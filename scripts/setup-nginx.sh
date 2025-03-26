#!/bin/bash

# Cài đặt Nginx nếu chưa có
if ! command -v nginx &> /dev/null; then
    echo "=== Cài đặt Nginx ==="
    apt-get update
    apt-get install -y nginx
fi

# Dừng Nginx nếu đang chạy
systemctl stop nginx

# Xóa cấu hình mặc định
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-available/default

# Tạo cấu hình cho Meetly
cat > /etc/nginx/sites-available/meetly << 'EOL'
server {
    listen 80;
    server_name meetly.invitations.vn;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.meetly.invitations.vn;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

# Tạo symbolic link để kích hoạt cấu hình
ln -sf /etc/nginx/sites-available/meetly /etc/nginx/sites-enabled/

# Kiểm tra cấu hình Nginx
nginx -t

# Khởi động lại Nginx
systemctl start nginx
systemctl enable nginx

echo "=== Cài đặt và cấu hình Nginx hoàn tất! ==="
echo "Frontend có thể truy cập tại: http://meetly.invitations.vn"
echo "Backend có thể truy cập tại: http://api.meetly.invitations.vn" 