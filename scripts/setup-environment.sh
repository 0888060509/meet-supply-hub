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
mkdir -p /root/meetly/{docker,src,scripts,ssl}

echo "Cài đặt môi trường hoàn tất!" 