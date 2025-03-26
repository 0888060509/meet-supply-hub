#!/bin/bash

# Di chuyển vào thư mục gốc của project
cd /root/meetly

# Clone repository vào thư mục src
cd src
git clone -b henry-backend git@github.com:0888060509/meet-supply-hub.git .

# Tạo các file Docker trong thư mục docker
cd ../docker

# Tạo Dockerfile cho Frontend
cat > frontend.Dockerfile << 'EOL'
FROM node:18-alpine

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
EOL

# Tạo Dockerfile cho Backend
cat > backend.Dockerfile << 'EOL'
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .

EXPOSE 8000
CMD ["npm", "run", "start:prod"]
EOL

# Tạo docker-compose.yml
cat > docker-compose.yml << 'EOL'
services:
  frontend:
    build:
      context: ../src
      dockerfile: ../docker/frontend.Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: always
    volumes:
      - ../src/frontend:/app
      - /app/node_modules
      - /app/.next

  backend:
    build:
      context: ../src
      dockerfile: ../docker/backend.Dockerfile
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
    restart: always
    volumes:
      - ../src/backend:/app
      - /app/node_modules
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=meetly
      - POSTGRES_PASSWORD=meetly@123
      - POSTGRES_DB=meetly
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

volumes:
  postgres_data:
EOL

# Tạo thư mục cho acme-challenge và SSL
mkdir -p /var/www/acme-challenge
mkdir -p /etc/nginx/ssl
chmod 700 /etc/nginx/ssl
chown -R nginx:nginx /var/www/acme-challenge

# Dừng Nginx nếu đang chạy
systemctl stop nginx

# Xóa cấu hình cũ nếu có
rm -f /etc/nginx/conf.d/meetly.conf

# Cấu hình Nginx ban đầu (HTTP only cho SSL verification)
cat > /etc/nginx/conf.d/meetly.conf << 'EOL'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/acme-challenge;
    
    location /.well-known/acme-challenge/ {
        default_type "text/plain";
        alias /var/www/acme-challenge/;
        try_files $uri =404;
    }
    
    location / {
        return 404;
    }
}
EOL

# Kiểm tra cấu hình Nginx
nginx -t

# Khởi động Nginx với cấu hình HTTP cơ bản
systemctl start nginx
systemctl enable nginx

# Tạo một file test để kiểm tra webroot
echo "acme-challenge test" > /var/www/acme-challenge/test.txt
curl -v http://localhost/.well-known/acme-challenge/test.txt

# Cài đặt acme.sh
curl https://get.acme.sh | sh -s email=henry@eggstech.io

# Đảm bảo acme.sh có sẵn trong PATH
source ~/.bashrc

# Thêm debug và log cho acme.sh
mkdir -p /var/log/acme.sh
export ACME_SH_LOG_FILE=/var/log/acme.sh/acme.sh.log

# Cài đặt SSL cho các domain sử dụng acme.sh với debug
~/.acme.sh/acme.sh --issue -d meetly.invitations.vn -d api.meetly.invitations.vn \
    --webroot /var/www/acme-challenge \
    --server letsencrypt \
    --debug \
    --log \
    --log-level 2

# Kiểm tra log nếu có lỗi
if [ $? -ne 0 ]; then
    echo "Lỗi khi lấy SSL certificate. Kiểm tra log tại /var/log/acme.sh/acme.sh.log"
    echo "Đang kiểm tra DNS..."
    for domain in "meetly.invitations.vn" "api.meetly.invitations.vn"; do
        echo "Kiểm tra $domain..."
        host $domain
        curl -v http://$domain/.well-known/acme-challenge/test.txt
    done
    exit 1
fi

# Cài đặt certificate cho Nginx
~/.acme.sh/acme.sh --install-cert -d meetly.invitations.vn \
  --key-file       /etc/nginx/ssl/meetly.invitations.vn.key  \
  --fullchain-file /etc/nginx/ssl/meetly.invitations.vn.crt \
  --reloadcmd     "systemctl reload nginx"

# Kiểm tra xem certificate đã được tạo chưa
if [ ! -f "/etc/nginx/ssl/meetly.invitations.vn.crt" ] || [ ! -f "/etc/nginx/ssl/meetly.invitations.vn.key" ]; then
    echo "Lỗi: SSL certificate chưa được tạo thành công!"
    exit 1
fi

# Cập nhật cấu hình Nginx để sử dụng SSL
cat > /etc/nginx/conf.d/meetly.conf << 'EOL'
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name meetly.invitations.vn api.meetly.invitations.vn;
    
    # Maintain the acme-challenge location
    location /.well-known/acme-challenge/ {
        default_type "text/plain";
        alias /var/www/acme-challenge/;
        try_files $uri =404;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name meetly.invitations.vn;
    
    ssl_certificate /etc/nginx/ssl/meetly.invitations.vn.crt;
    ssl_certificate_key /etc/nginx/ssl/meetly.invitations.vn.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.meetly.invitations.vn;
    
    ssl_certificate /etc/nginx/ssl/meetly.invitations.vn.crt;
    ssl_certificate_key /etc/nginx/ssl/meetly.invitations.vn.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

# Kiểm tra cấu hình Nginx
nginx -t

# Nếu cấu hình OK thì khởi động lại Nginx
if [ $? -eq 0 ]; then
    systemctl restart nginx
else
    echo "Lỗi trong cấu hình Nginx!"
    exit 1
fi

# Build và chạy Docker containers
cd /root/meetly/docker
docker-compose up -d --build

echo "Triển khai ứng dụng hoàn tất!" 