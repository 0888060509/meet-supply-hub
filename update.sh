#!/bin/bash

# Di chuyển đến thư mục source code
cd /root/meetly/src

# Pull code mới từ repository
git pull origin henry-backend

# Di chuyển đến thư mục docker và rebuild containers
cd ../docker
docker-compose down
docker-compose up -d --build

echo "Cập nhật ứng dụng hoàn tất!" 