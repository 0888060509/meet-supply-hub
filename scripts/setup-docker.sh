#!/bin/bash

# Di chuyển vào thư mục gốc của project
cd /root/meetly

# Tạo thư mục src và clone repository
mkdir -p src
cd src
git clone -b henry-backend git@github.com:0888060509/meet-supply-hub.git .

# Kiểm tra cấu trúc thư mục
echo "=== Kiểm tra cấu trúc thư mục sau khi clone ==="
ls -la
echo ""
echo "=== Tìm kiếm package.json ==="
find . -name "package.json"
echo ""

# Tạo thư mục docker nếu chưa có
cd ..
mkdir -p docker
cd docker

# Tạo Dockerfile cho Frontend
cat > frontend.Dockerfile << 'EOL'
FROM node:18-alpine

WORKDIR /app

# Cài đặt Vite global
RUN npm install -g vite

# Kiểm tra và cài đặt dependencies
COPY package*.json ./
RUN if [ -f package.json ]; then \
      npm install; \
    else \
      echo "Error: package.json not found"; \
      exit 1; \
    fi

COPY . .

# Kiểm tra script build tồn tại
RUN if grep -q "\"build\"" package.json; then \
      npm run build; \
    else \
      echo "Warning: build script not found in package.json"; \
    fi

EXPOSE 8000

# Kiểm tra các script có sẵn và chọn script phù hợp để chạy
CMD if grep -q "\"start\"" package.json; then \
      npm start; \
    elif grep -q "\"dev\"" package.json; then \
      npm run dev; \
    elif grep -q "\"serve\"" package.json; then \
      npm run serve; \
    else \
      echo "Error: No suitable start script found in package.json (tried: start, dev, serve)"; \
      echo "Available scripts:"; \
      npm run; \
      exit 1; \
    fi
EOL

# Tạo Dockerfile cho Backend
cat > backend.Dockerfile << 'EOL'
FROM node:18-alpine

WORKDIR /app

# Kiểm tra và cài đặt dependencies
COPY package*.json ./
RUN if [ -f package.json ]; then \
      npm install; \
    else \
      echo "Error: package.json not found"; \
      exit 1; \
    fi

COPY . .

EXPOSE 3000

# Kiểm tra script start:prod tồn tại
CMD if grep -q "\"start:prod\"" package.json; then \
      npm run start:prod; \
    elif grep -q "\"start\"" package.json; then \
      npm start; \
    elif grep -q "\"dev\"" package.json; then \
      npm run dev; \
    else \
      echo "Error: No suitable start script found in package.json (tried: start:prod, start, dev)"; \
      echo "Available scripts:"; \
      npm run; \
      exit 1; \
    fi
EOL

# Tạo docker-compose.yml
cat > docker-compose.yml << 'EOL'
services:
  frontend:
    build:
      context: ../src
      dockerfile: ../docker/frontend.Dockerfile
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=development
      - PORT=8000
    restart: always
    volumes:
      - ../src:/app
      - /app/node_modules
      - /app/.next

  backend:
    build:
      context: ../src
      dockerfile: ../docker/backend.Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
    restart: always
    volumes:
      - ../src:/app
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

echo "=== Kiểm tra nội dung package.json của frontend ==="
cat ../src/package.json || echo "Không tìm thấy package.json của frontend"
echo ""

echo "=== Hiển thị các script có sẵn trong package.json ==="
cd ../src && npm run || echo "Không thể đọc scripts từ package.json"
echo ""

echo "=== Chuẩn bị build và chạy containers ==="
cd ../docker && docker-compose up -d --build

echo "Cài đặt Docker và triển khai ứng dụng hoàn tất!" 