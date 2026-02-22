# 校庆策划工具平台

企业内部 AI 工具箱，集成 Coze 智能体，用于校庆活动策划。

## 功能特性

- **安全认证** - NextAuth.js 邮箱密码登录
- **实时对话** - SSE 流式响应，打字机效果
- **Coze 集成** - 官方 SDK，支持 Bot 和 Workflow
- **对话持久化** - 完整对话历史保存
- **审计日志** - 用户操作记录
- **现代 UI** - shadcn/ui + Tailwind CSS

## 技术栈

- **Framework**: Next.js 14 (App Router)
- **Database**: Prisma + SQLite
- **Auth**: NextAuth.js
- **AI**: Coze API (@coze/api SDK)
- **UI**: shadcn/ui, Tailwind CSS
- **Streaming**: Server-Sent Events (SSE)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local`:

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 Coze API Token。

### 3. 初始化数据库

```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000

### 5. 登录

默认管理员账号：
- 邮箱: `admin@company.com`
- 密码: `admin123`

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (BFF)
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── chat/         # Streaming chat
│   │   └── conversations/# History
│   ├── login/            # Login page
│   ├── register/         # Register page
│   ├── chat/             # Chat interface
│   └── page.tsx          # Home (tool selection)
├── components/
│   ├── auth/             # Auth forms
│   ├── chat/             # Chat UI components
│   ├── layout/           # Header, nav
│   └── ui/               # shadcn components
├── lib/
│   ├── coze/             # Coze SDK wrapper
│   ├── auth.ts           # NextAuth config
│   └── db.ts             # Prisma client
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Initial data
└── Reference/            # Coze API documentation
```

## 安全特性

- API 密钥仅存在服务端 (.env.local)
- BFF 模式，客户端无法访问 Coze API
- bcrypt 密码哈希 (saltRounds=12)
- 路由中间件保护
- 数据隔离（用户只能访问自己的对话）
- 审计日志

## 开发指南

### 添加新工具

1. 在 Coze 平台创建新 Bot 或 Workflow
2. 复制 Bot ID
3. 通过 Prisma Studio 或管理后台添加工具记录
4. 填写 `cozeBotId` 字段

### 查看数据库

```bash
npx prisma studio
```

### 数据库迁移

```bash
npx prisma migrate dev --name your_migration_name
```

## 下一步开发 (Phase 2)

- [ ] 文件上传功能
- [ ] 对话历史侧边栏
- [ ] 多工具快速切换
- [ ] 管理后台（用户管理、工具管理）
- [ ] 审计日志查看器
- [ ] 账号审批流程
- [ ] 登录失败锁定

## License

Private - Internal Use Only
