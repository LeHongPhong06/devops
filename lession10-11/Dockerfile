# Sử dụng base image Node.js Alpine nhẹ và bảo mật
FROM node:20-alpine AS base

# Tạo thư mục làm việc
WORKDIR /app

# Thiết lập biến môi trường production
ENV NODE_ENV=production

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies phục vụ production (bỏ qua devDependencies)
RUN npm ci --only=production && npm cache clean --force

# Copy toàn bộ mã nguồn
COPY src ./src

# Đổi quyền sở hữu cho user không phải root (user 'node' có sẵn trong node:alpine)
RUN chown -R node:node /app

# Chuyển sang user node để tăng tính bảo mật cho container chạy trên ECS
USER node

# Expose port ứng dụng lắng nghe
EXPOSE 3000

# Khởi chạy ứng dụng
CMD ["node", "src/server.js"]
