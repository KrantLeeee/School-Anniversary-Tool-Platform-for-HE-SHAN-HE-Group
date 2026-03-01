#!/bin/bash

# =================================================================
# 禾山禾 AI 工具平台 - 自动化部署脚本
# =================================================================

# 1. 进入项目目录 (根据用户服务器路径设定)
PROJECT_DIR="/var/www/school-platform/School-Anniversary-Tool-Platform-for-HE-SHAN-HE-Group"

echo "📂 正在进入项目目录: $PROJECT_DIR"
cd $PROJECT_DIR || { echo "❌ 错误: 无法进入目录 $PROJECT_DIR"; exit 1; }

echo "🚀 开始自动化部署过程..."

# 2. 获取最新代码
echo "📥 正在从 GitHub 拉取最新代码..."
git pull origin main || { echo "❌ 错误: git pull 失败"; exit 1; }

# 3. 安装依赖
echo "📦 正在安装依赖..."
npm install || { echo "❌ 错误: npm install 失败"; exit 1; }

# 4. Prisma 数据库同步 (生成客户端并执行迁移)
echo "🗄️ 正在生成 Prisma 客户端..."
npx prisma generate || { echo "❌ 错误: prisma generate 失败"; exit 1; }
echo "🗄️ 正在更新数据库种子数据 (Seed)..."
npx prisma db seed || { echo "❌ 错误: prisma db seed 失败"; exit 1; }
# echo "🗄️ 正在执行数据库迁移..."
# npx prisma migrate deploy || { echo "❌ 错误: prisma migrate 失败"; exit 1; }

# 5. 构建生产环境构建
echo "🏗️ 正在执行 Next.js 构建 (npm run build)..."
npm run build || { echo "❌ 错误: 构建失败"; exit 1; }

# 6. PM2 重启应用
# 注意: 请确保第一次部署时已经运行过 pm2 start npm --name "school-platform" -- start
echo "🔄 正在通过 PM2 重启应用..."
pm2 restart school-platform || pm2 start npm --name "school-platform" -- start

echo "✨ ==================================================="
echo "✅ 部署成功！应用已在生产环境更新并运行。"
echo "✨ ==================================================="
