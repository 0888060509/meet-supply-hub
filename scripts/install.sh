#!/bin/bash

# Cập nhật hệ thống
dnf update -y
dnf upgrade -y

# Cài đặt các công cụ cần thiết
dnf install -y epel-release
dnf install -y git nginx docker docker-compose curl socat

# Khởi động và enable Docker
systemctl start docker
systemctl enable docker

# Tạo cấu trúc thư mục
mkdir -p /root/meetly/docker
mkdir -p /root/meetly/src

# Clone repository vào thư mục src
cd /root/meetly/src
git clone -b henry-backend git@github.com:0888060509/meet-supply-hub.git .

# Tạo các file Docker trong thư mục docker
cd /root/meetly/docker

# Tạo Dockerfile cho Frontend
cat > frontend.Dockerfile << 'EOL'
FROM node:18-alpine

WORKDIR /app

COPY ../src/frontend/package*.json ./
RUN npm install

COPY ../src/frontend .

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
EOL

# Tạo Dockerfile cho Backend
cat > backend.Dockerfile << 'EOL'
FROM node:18-alpine

WORKDIR /app

COPY ../src/backend/package*.json ./
RUN npm install

COPY ../src/backend .

EXPOSE 8000
CMD ["npm", "run", "start:prod"]
EOL

# Tạo docker-compose.yml
cat > docker-compose.yml << 'EOL'
version: '3.8'

services:
  frontend:
    build:
      context: ..
      dockerfile: docker/frontend.Dockerfile
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
      context: ..
      dockerfile: docker/backend.Dockerfile
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

# Cấu hình Nginx ban đầu (HTTP only)
cat > /etc/nginx/conf.d/meetly.conf << 'EOL'
server {
    listen 80;
    server_name meetly.productify.vn;
    root /usr/share/nginx/html;

    location /.well-known/acme-challenge/ {
        alias /var/www/acme-challenge/;
        try_files $uri =404;
    }
    
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
    listen 80;
    server_name api.meetly.productify.vn;
    root /usr/share/nginx/html;

    location /.well-known/acme-challenge/ {
        alias /var/www/acme-challenge/;
        try_files $uri =404;
    }
    
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

# Khởi động Nginx với cấu hình HTTP
systemctl start nginx
systemctl enable nginx

# Cài đặt acme.sh
curl https://get.acme.sh | sh -s email=henry@eggstech.io

# Đảm bảo acme.sh có sẵn trong PATH
source ~/.bashrc

# Cài đặt SSL cho các domain sử dụng acme.sh
~/.acme.sh/acme.sh --issue -d meetly.productify.vn -d api.meetly.productify.vn --webroot /var/www/acme-challenge --server letsencrypt

# Cài đặt certificate cho Nginx
~/.acme.sh/acme.sh --install-cert -d meetly.productify.vn \
  --key-file       /etc/nginx/ssl/meetly.productify.vn.key  \
  --fullchain-file /etc/nginx/ssl/meetly.productify.vn.crt \
  --reloadcmd     "systemctl reload nginx"

# Cập nhật cấu hình Nginx để sử dụng SSL
cat > /etc/nginx/conf.d/meetly.conf << 'EOL'
server {
    listen 80;
    server_name meetly.productify.vn api.meetly.productify.vn;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name meetly.productify.vn;
    
    ssl_certificate /etc/nginx/ssl/meetly.productify.vn.crt;
    ssl_certificate_key /etc/nginx/ssl/meetly.productify.vn.key;
    
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
    listen 443 ssl;
    server_name api.meetly.productify.vn;
    
    ssl_certificate /etc/nginx/ssl/meetly.productify.vn.crt;
    ssl_certificate_key /etc/nginx/ssl/meetly.productify.vn.key;
    
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

# Khởi động lại Nginx với cấu hình SSL
systemctl restart nginx

# Build và chạy Docker containers
cd /root/meetly/docker
docker-compose up -d --build

echo "Cài đặt hoàn tất!" 