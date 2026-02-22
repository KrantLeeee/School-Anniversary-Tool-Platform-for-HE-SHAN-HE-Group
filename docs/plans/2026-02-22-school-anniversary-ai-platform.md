# School Anniversary AI Platform - MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an internal AI toolbox platform integrating Coze agents for school anniversary event planning, with secure API key management and user authentication.

**Architecture:** Next.js 14 App Router with server-side BFF pattern to protect Coze API credentials. Real-time streaming chat via SSE. SQLite + Prisma for data persistence. NextAuth.js for authentication. All Coze API calls follow official SDK documentation in `Reference/Coze Agent API & SDK/`.

**Tech Stack:**
- Frontend: Next.js 14, shadcn/ui, Tailwind CSS
- AI Integration: @coze/api Node.js SDK
- Database: Prisma + SQLite
- Auth: NextAuth.js (Credentials)
- Streaming: Server-Sent Events (SSE)

**MVP Scope:** Authentication, single-tool streaming chat, conversation history persistence. Phase 2 will add file upload, multi-tool management, admin dashboard.

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `tsconfig.json`

**Step 1: Initialize Next.js project**

Run the following command:

```bash
npx create-next-app@latest . --typescript --app --eslint --tailwind --no-src-dir --import-alias "@/*"
```

When prompted:
- Use TypeScript: Yes
- Use ESLint: Yes
- Use Tailwind CSS: Yes
- Use `src/` directory: **No** (we'll use app/ directly)
- Use App Router: Yes
- Customize default import alias: No (use @/*)

**Step 2: Install core dependencies**

```bash
npm install @coze/api @prisma/client prisma bcryptjs next-auth@beta react-markdown
npm install -D @types/bcryptjs
```

**Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes

**Step 4: Install essential shadcn components**

```bash
npx shadcn@latest add button input card label textarea scroll-area avatar dropdown-menu
```

**Step 5: Verify .gitignore includes sensitive files**

Check that `.gitignore` contains:

```
# Environment variables
.env
.env.local
.env*.local

# Database
*.db
*.db-journal
prisma/migrations

# Uploads
uploads/
```

If missing, add these lines.

**Step 6: Commit project initialization**

```bash
git init
git add .
git commit -m "feat: initialize Next.js project with core dependencies

- Next.js 14 with App Router
- Prisma + SQLite setup
- NextAuth.js for authentication
- shadcn/ui component library
- Coze SDK integration

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Database Schema Setup

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `lib/db.ts`

**Step 1: Create Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  passwordHash  String
  name          String?
  role          Role           @default(EMPLOYEE)
  isApproved    Boolean        @default(true)  // MVP: auto-approve
  createdAt     DateTime       @default(now())
  conversations Conversation[]
  auditLogs     AuditLog[]
}

enum Role {
  ADMIN
  EMPLOYEE
}

model Tool {
  id             String         @id @default(cuid())
  name           String
  description    String
  icon           String?
  cozeType       CozeTool       @default(BOT)
  cozeBotId      String?
  cozeWorkflowId String?
  isEnabled      Boolean        @default(true)
  sortOrder      Int            @default(0)
  createdAt      DateTime       @default(now())
  conversations  Conversation[]
}

enum CozeTool {
  BOT
  WORKFLOW
}

model Conversation {
  id                 String    @id @default(cuid())
  userId             String
  toolId             String
  cozeConversationId String?
  title              String    @default("新对话")
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  user               User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tool               Tool      @relation(fields: [toolId], references: [id], onDelete: Cascade)
  messages           Message[]

  @@index([userId])
  @@index([toolId])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  role           String
  content        String
  contentType    String       @default("text")
  attachments    String?      // JSON string for SQLite
  createdAt      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId])
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String
  detail    String?
  ip        String?
  userAgent String?
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([createdAt])
}
```

**Step 2: Create Prisma client singleton**

Create `lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

**Step 3: Create seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      passwordHash: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
      isApproved: true,
    },
  })

  console.log('Created admin user:', admin.email)

  // Create default tool using provided bot token
  const tool = await prisma.tool.upsert({
    where: { id: 'default-tool' },
    update: {},
    create: {
      id: 'default-tool',
      name: '校庆活动策划助手',
      description: 'AI驱动的校庆活动策划方案生成工具',
      icon: '🎓',
      cozeType: 'BOT',
      cozeBotId: 'k8xhP2vgTTy6ZAUYVDoxccOy6YZrkYfd', // Extracted from user's token
      isEnabled: true,
      sortOrder: 1,
    },
  })

  console.log('Created default tool:', tool.name)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

**Step 4: Add seed script to package.json**

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Install tsx:

```bash
npm install -D tsx
```

**Step 5: Create initial migration**

```bash
npx prisma migrate dev --name init
```

Expected output: Migration files created, database tables generated.

**Step 6: Run seed**

```bash
npx prisma db seed
```

Expected output:
```
Created admin user: admin@company.com
Created default tool: 校庆活动策划助手
```

**Step 7: Verify database**

```bash
npx prisma studio
```

Open browser at http://localhost:5555, verify:
- User table has admin@company.com
- Tool table has 校庆活动策划助手

**Step 8: Commit database setup**

```bash
git add prisma/ lib/db.ts package.json package-lock.json
git commit -m "feat: setup database schema with Prisma

- User, Tool, Conversation, Message, AuditLog models
- SQLite database configuration
- Seed script with admin user and default tool
- Prisma client singleton

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Environment Configuration

**Files:**
- Create: `.env.local`
- Create: `.env.example`

**Step 1: Create .env.local with real credentials**

Create `.env.local`:

```env
# Database
DATABASE_URL="file:./dev.db"

# Coze API (SERVER-SIDE ONLY - NEVER expose to client)
COZE_API_TOKEN="eyJhbGciOiJSUzI1NiIsImtpZCI6IjViNGM3ZTFlLTJjYjUtNGE3Yi1iYjFiLWM4OTYwMDEyOWM5NSJ9.eyJpc3MiOiJodHRwczovL2FwaS5jb3plLmNuIiwiYXVkIjpbIms4eGhQMnZnVFR5NlpBVVlWRG94Y2NPeTZZWnJrWWZkIl0sImV4cCI6ODIxMDI2Njg3Njc5OSwiaWF0IjoxNzcxNzMyODEzLCJzdWIiOiJzcGlmZmU6Ly9hcGkuY296ZS5jbi93b3JrbG9hZF9pZGVudGl0eS9pZDo3NjA5MjA2NzA5NjIxMzU4NjI4Iiwic3JjIjoiaW5ib3VuZF9hdXRoX2FjY2Vzc190b2tlbl9pZDo3NjA5NTM0NDkwOTAxMjE3MzA2In0.L6x9esreRYro3luLg3xFe7xhtwrekCyniYe4w_S-mUywjJZ8pX9NxOsrg3fLI6tbldNtQHoAJxd6pjnLWSDdSuy5CWn9KTu-ddlJet2yuD-Ofv7gfSWz_8F0aRaSSmLiMfNVToB1MuluaEg-blQ3wp9YFVvZd33x5Z70MPeydFg7V0RTKgW-Iwy8GSmVjPftnUtfV4_KraILl0y49svCsVVoR41POadx7Lu-SFelYBG936L2PTbUu1wUCQRXho-oqiOF1R6fBR3CJTuah0hDo0no69XHIc-wS97KtYTOqokXMHtUzvwnJbcrvIkZ6ZJXqFDHw4z06MSaVo9_gxCV3Q"
COZE_BASE_URL="https://api.coze.cn"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production-min-32-characters-long"
```

**Step 2: Create .env.example for documentation**

Create `.env.example`:

```env
# Database
DATABASE_URL="file:./dev.db"

# Coze API (SERVER-SIDE ONLY)
COZE_API_TOKEN="your_coze_api_token_here"
COZE_BASE_URL="https://api.coze.cn"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_with_openssl_rand_base64_32"
```

**Step 3: Verify .env.local is gitignored**

```bash
git status
```

Expected: `.env.local` should NOT appear in untracked files (should be ignored)

**Step 4: Commit environment template**

```bash
git add .env.example
git commit -m "docs: add environment variables template

- Database connection string
- Coze API configuration
- NextAuth secret configuration

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: NextAuth Configuration

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `middleware.ts`

**Step 1: Create NextAuth configuration**

Create `lib/auth.ts`:

```typescript
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('请输入邮箱和密码')
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          throw new Error('用户不存在')
        }

        if (!user.isApproved) {
          throw new Error('账号待审批，请联系管理员')
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isValid) {
          throw new Error('密码错误')
        }

        // Log successful login
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            detail: `User ${user.email} logged in`,
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
}
```

**Step 2: Create NextAuth API route**

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

**Step 3: Create TypeScript type extensions**

Create `types/next-auth.d.ts`:

```typescript
import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string | null
    role: string
  }

  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}
```

**Step 4: Create middleware for route protection**

Create `middleware.ts`:

```typescript
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN'
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    '/((?!api/auth|login|register|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

**Step 5: Verify auth configuration compiles**

```bash
npm run build
```

Expected: Build completes without TypeScript errors

**Step 6: Commit authentication setup**

```bash
git add lib/auth.ts app/api/auth middleware.ts types/
git commit -m "feat: configure NextAuth.js authentication

- Credentials provider with bcrypt password hashing
- JWT session strategy (8 hour expiry)
- Middleware for route protection
- Admin role authorization
- Audit logging for login events

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Coze SDK Integration Layer

**Files:**
- Create: `lib/coze/client.ts`
- Create: `lib/coze/chat.ts`
- Create: `lib/coze/types.ts`

**Step 1: Read Coze SDK documentation**

Before writing code, read:
- `Reference/Coze Agent API & SDK/Node_js SDK 概述.md`
- `Reference/Coze Agent API & SDK/发起对话.md`

**Step 2: Create Coze client singleton**

Create `lib/coze/client.ts`:

```typescript
import { CozeAPI } from '@coze/api'

if (!process.env.COZE_API_TOKEN) {
  throw new Error('COZE_API_TOKEN is not defined in environment variables')
}

if (!process.env.COZE_BASE_URL) {
  throw new Error('COZE_BASE_URL is not defined in environment variables')
}

// Singleton Coze client (server-side only)
export const cozeClient = new CozeAPI({
  token: process.env.COZE_API_TOKEN,
  baseURL: process.env.COZE_BASE_URL,
})

export type { CozeAPI }
```

**Step 3: Create type definitions**

Create `lib/coze/types.ts`:

```typescript
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  content_type?: 'text' | 'object_string'
}

export interface ChatStreamChunk {
  event: string
  data: {
    id?: string
    conversation_id?: string
    content?: string
    type?: string
    role?: string
  }
}

export interface CreateConversationResponse {
  conversation_id: string
}
```

**Step 4: Create chat service layer**

Create `lib/coze/chat.ts`:

```typescript
import { cozeClient } from './client'
import { db } from '../db'

export interface StreamChatOptions {
  botId: string
  userId: string
  message: string
  conversationId?: string
}

/**
 * Create or get existing Coze conversation for user+tool
 */
export async function getOrCreateCozeConversation(
  userId: string,
  toolId: string
): Promise<string> {
  // Check if conversation exists in our DB
  const conversation = await db.conversation.findFirst({
    where: {
      userId,
      toolId,
      cozeConversationId: { not: null },
    },
    orderBy: { updatedAt: 'desc' },
  })

  if (conversation?.cozeConversationId) {
    return conversation.cozeConversationId
  }

  // Create new conversation via Coze API
  const response = await cozeClient.conversations.create()
  return response.id
}

/**
 * Stream chat with Coze bot
 * Returns async generator for SSE streaming
 */
export async function* streamChat(options: StreamChatOptions) {
  const { botId, userId, message, conversationId } = options

  // Get or create Coze conversation ID
  const cozeConversationId = conversationId || (await getOrCreateCozeConversation(userId, botId))

  // Create chat stream
  const stream = await cozeClient.chat.stream({
    bot_id: botId,
    user_id: userId,
    additional_messages: [
      {
        role: 'user',
        content: message,
        content_type: 'text',
      },
    ],
    conversation_id: cozeConversationId,
  })

  // Yield chunks as they arrive
  for await (const chunk of stream) {
    yield {
      event: chunk.event,
      data: chunk,
    }
  }
}
```

**Step 5: Verify Coze client initializes without errors**

Create temporary test file `lib/coze/test.ts`:

```typescript
import { cozeClient } from './client'

console.log('Coze client initialized:', !!cozeClient)
```

Run:

```bash
npx tsx lib/coze/test.ts
```

Expected output: `Coze client initialized: true`

Delete test file after verification.

**Step 6: Commit Coze integration layer**

```bash
git add lib/coze/
git commit -m "feat: implement Coze SDK integration layer

- Coze client singleton with environment config
- Conversation creation and retrieval
- Streaming chat service with async generator
- Type definitions for chat messages

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Streaming Chat API Route

**Files:**
- Create: `app/api/chat/stream/route.ts`
- Create: `app/api/conversations/route.ts`

**Step 1: Create streaming chat API endpoint**

Create `app/api/chat/stream/route.ts`:

```typescript
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { streamChat } from '@/lib/coze/chat'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { message, toolId, conversationId } = await req.json()

    if (!message || !toolId) {
      return new Response('Missing required fields', { status: 400 })
    }

    // Get tool configuration
    const tool = await db.tool.findUnique({
      where: { id: toolId },
    })

    if (!tool || !tool.isEnabled) {
      return new Response('Tool not found or disabled', { status: 404 })
    }

    if (!tool.cozeBotId) {
      return new Response('Tool not configured with Coze bot', { status: 400 })
    }

    // Get or create conversation in our DB
    let conversation = conversationId
      ? await db.conversation.findUnique({ where: { id: conversationId } })
      : null

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          userId: session.user.id,
          toolId: tool.id,
          title: message.slice(0, 50),
        },
      })
    }

    // Save user message
    await db.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
        contentType: 'text',
      },
    })

    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = ''

          // Stream from Coze
          for await (const chunk of streamChat({
            botId: tool.cozeBotId!,
            userId: session.user.id,
            message,
            conversationId: conversation!.cozeConversationId || undefined,
          })) {
            // Update Coze conversation ID if this is first message
            if (chunk.data.conversation_id && !conversation!.cozeConversationId) {
              await db.conversation.update({
                where: { id: conversation!.id },
                data: { cozeConversationId: chunk.data.conversation_id },
              })
            }

            // Accumulate assistant response
            if (chunk.event === 'conversation.message.delta' && chunk.data.content) {
              fullResponse += chunk.data.content
            }

            // Send chunk to client
            const sseData = `data: ${JSON.stringify(chunk)}\n\n`
            controller.enqueue(encoder.encode(sseData))
          }

          // Save assistant message after stream completes
          if (fullResponse) {
            await db.message.create({
              data: {
                conversationId: conversation!.id,
                role: 'assistant',
                content: fullResponse,
                contentType: 'text',
              },
            })

            // Update conversation timestamp
            await db.conversation.update({
              where: { id: conversation!.id },
              data: { updatedAt: new Date() },
            })
          }

          // Log tool usage
          await db.auditLog.create({
            data: {
              userId: session.user.id,
              action: 'TOOL_USE',
              detail: `Used tool: ${tool.name}`,
            },
          })

          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
```

**Step 2: Create conversations API endpoint**

Create `app/api/conversations/route.ts`:

```typescript
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const toolId = searchParams.get('toolId')

    const conversations = await db.conversation.findMany({
      where: {
        userId: session.user.id,
        ...(toolId ? { toolId } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        tool: {
          select: {
            name: true,
            icon: true,
          },
        },
      },
    })

    return Response.json(conversations)
  } catch (error) {
    console.error('Conversations API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 3: Verify API routes compile**

```bash
npm run build
```

Expected: Build succeeds without errors

**Step 4: Commit API routes**

```bash
git add app/api/
git commit -m "feat: implement streaming chat and conversations API

- SSE streaming chat endpoint with Coze integration
- Real-time message persistence to database
- Conversation history retrieval endpoint
- User authentication and authorization
- Audit logging for tool usage

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Authentication UI (Login/Register)

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/register/page.tsx`
- Create: `components/auth/login-form.tsx`
- Create: `components/auth/register-form.tsx`

**Step 1: Create login page**

Create `app/login/page.tsx`:

```typescript
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">🎓 校庆策划工具平台</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            登录以使用 AI 智能助手
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
```

**Step 2: Create login form component**

Create `components/auth/login-form.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>登录</CardTitle>
        <CardDescription>输入邮箱和密码以访问平台</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '登录中...' : '登录'}
          </Button>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            还没有账号？{' '}
            <Link href="/register" className="text-blue-600 hover:underline dark:text-blue-400">
              注册
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
```

**Step 3: Create register page**

Create `app/register/page.tsx`:

```typescript
import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">🎓 校庆策划工具平台</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            创建账号以开始使用
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
```

**Step 4: Create register form component**

Create `components/auth/register-form.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '注册失败')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>注册</CardTitle>
        <CardDescription>创建新账号</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-200">
              注册成功！正在跳转到登录页...
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="张三"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading || success}>
            {isLoading ? '注册中...' : '注册'}
          </Button>
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            已有账号？{' '}
            <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
              登录
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
```

**Step 5: Create register API endpoint**

Create `app/api/auth/register/route.ts`:

```typescript
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return Response.json({ error: '邮箱和密码不能为空' }, { status: 400 })
    }

    // Check if user exists
    const existing = await db.user.findUnique({
      where: { email },
    })

    if (existing) {
      return Response.json({ error: '该邮箱已被注册' }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        role: 'EMPLOYEE',
        isApproved: true, // MVP: auto-approve
      },
    })

    return Response.json({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    console.error('Register error:', error)
    return Response.json({ error: '注册失败' }, { status: 500 })
  }
}
```

**Step 6: Install missing shadcn components**

```bash
npx shadcn@latest add card
```

**Step 7: Test authentication flow**

```bash
npm run dev
```

1. Open http://localhost:3000/login
2. Should redirect to login (middleware active)
3. Try registering new account
4. Try logging in with admin credentials: admin@company.com / admin123
5. Should redirect to home page (/)

**Step 8: Commit authentication UI**

```bash
git add app/login app/register components/auth app/api/auth/register
git commit -m "feat: implement authentication UI

- Login page with form validation
- Register page with success feedback
- Registration API endpoint with bcrypt
- Responsive card-based layout
- Error handling and loading states

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Chat Interface UI

**Files:**
- Create: `app/page.tsx`
- Create: `app/chat/page.tsx`
- Create: `components/chat/chat-interface.tsx`
- Create: `components/chat/message-list.tsx`
- Create: `components/chat/message-input.tsx`
- Create: `components/layout/header.tsx`

**Step 1: Create main layout with header**

Create `components/layout/header.tsx`:

```typescript
'use client'

import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/95">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎓</span>
          <h1 className="text-xl font-bold">校庆策划工具平台</h1>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {session?.user?.name || session?.user?.email}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
```

**Step 2: Create home page (tool selection)**

Create `app/page.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/layout/header'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const tools = await db.tool.findMany({
    where: { isEnabled: true },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="container max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">AI 工具箱</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            选择一个工具开始使用
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link key={tool.id} href={`/chat?toolId=${tool.id}`}>
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105">
                <CardHeader>
                  <div className="mb-2 text-4xl">{tool.icon || '🤖'}</div>
                  <CardTitle>{tool.name}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {tools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">暂无可用工具</p>
          </div>
        )}
      </main>
    </div>
  )
}
```

**Step 3: Create chat page**

Create `app/chat/page.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/layout/header'
import { ChatInterface } from '@/components/chat/chat-interface'

export default async function ChatPage({
  searchParams,
}: {
  searchParams: { toolId?: string; conversationId?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const toolId = searchParams.toolId || 'default-tool'

  const tool = await db.tool.findUnique({
    where: { id: toolId },
  })

  if (!tool) {
    redirect('/')
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <ChatInterface tool={tool} conversationId={searchParams.conversationId} />
    </div>
  )
}
```

**Step 4: Create chat interface component**

Create `components/chat/chat-interface.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { MessageList } from './message-list'
import { MessageInput } from './message-input'
import type { Tool } from '@prisma/client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

interface ChatInterfaceProps {
  tool: Tool
  conversationId?: string
}

export function ChatInterface({ tool, conversationId: initialConversationId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState(initialConversationId)
  const [isStreaming, setIsStreaming] = useState(false)

  async function handleSendMessage(message: string) {
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsStreaming(true)

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          toolId: tool.id,
          conversationId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      // Create assistant message placeholder
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)

                // Update conversation ID from first response
                if (parsed.data?.conversation_id && !conversationId) {
                  setConversationId(parsed.data.conversation_id)
                }

                // Accumulate content
                if (parsed.event === 'conversation.message.delta' && parsed.data?.content) {
                  assistantContent += parsed.data.content
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: assistantContent }
                        : msg
                    )
                  )
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) =>
        prev.concat({
          id: Date.now().toString(),
          role: 'assistant',
          content: '抱歉，发送消息时出现错误。请重试。',
          createdAt: new Date(),
        })
      )
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b bg-white px-6 py-4 dark:bg-slate-950">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{tool.icon || '🤖'}</span>
          <div>
            <h2 className="text-lg font-semibold">{tool.name}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {tool.description}
            </p>
          </div>
        </div>
      </div>

      <MessageList messages={messages} isStreaming={isStreaming} />
      <MessageInput onSend={handleSendMessage} disabled={isStreaming} />
    </div>
  )
}
```

**Step 5: Create message list component**

Create `components/chat/message-list.tsx`:

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

interface MessageListProps {
  messages: Message[]
  isStreaming: boolean
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">开始对话</h3>
          <p className="text-slate-600 dark:text-slate-400">
            在下方输入框发送消息开始使用 AI 助手
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef}>
      <div className="mx-auto max-w-3xl space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 border'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="rounded-lg border bg-white px-4 py-3 dark:bg-slate-800">
              <div className="flex space-x-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
```

**Step 6: Create message input component**

Create `components/chat/message-input.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface MessageInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t bg-white p-4 dark:bg-slate-950">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
        <div className="flex space-x-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
            className="min-h-[60px] max-h-[200px] resize-none"
            disabled={disabled}
          />
          <Button type="submit" disabled={disabled || !message.trim()} className="px-6">
            发送
          </Button>
        </div>
      </form>
    </div>
  )
}
```

**Step 7: Install missing shadcn components**

```bash
npx shadcn@latest add scroll-area dropdown-menu avatar
```

**Step 8: Create SessionProvider wrapper**

Create `app/providers.tsx`:

```typescript
'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

Update `app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '校庆策划工具平台',
  description: 'AI驱动的校庆活动策划工具箱',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

**Step 9: Test complete chat flow**

```bash
npm run dev
```

1. Open http://localhost:3000
2. Login with admin@company.com / admin123
3. Click on the tool card
4. Send a test message: "你好，请介绍一下你的功能"
5. Verify streaming response appears character by character
6. Send another message to test conversation context

**Step 10: Commit chat interface**

```bash
git add app/ components/
git commit -m "feat: implement complete chat interface

- Home page with tool grid
- Real-time streaming chat with SSE
- Message list with markdown rendering
- Message input with keyboard shortcuts
- Loading states and animations
- Session provider for auth state
- Responsive layout with header

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Final Testing & Documentation

**Files:**
- Create: `README.md`
- Create: `docs/DEPLOYMENT.md`

**Step 1: Comprehensive testing checklist**

Run through this checklist:

- [ ] Registration: Create new account successfully
- [ ] Login: Login with new account
- [ ] Chat: Send message and receive streaming response
- [ ] Context: Send follow-up message, verify conversation context maintained
- [ ] Logout: Sign out and verify redirect to login
- [ ] Protected routes: Try accessing /chat without login (should redirect)
- [ ] Database: Verify messages saved in Prisma Studio
- [ ] Audit logs: Verify login and tool usage logged

**Step 2: Create README**

Create `README.md`:

```markdown
# 校庆策划工具平台 - School Anniversary AI Platform

企业内部 AI 工具箱，集成 Coze 智能体，用于校庆活动策划。

## 功能特性

- 🔐 **安全认证** - NextAuth.js 邮箱密码登录
- 💬 **实时对话** - SSE 流式响应，打字机效果
- 🤖 **Coze 集成** - 官方 SDK，支持 Bot 和 Workflow
- 💾 **对话持久化** - 完整对话历史保存
- 📊 **审计日志** - 用户操作记录
- 🎨 **现代 UI** - shadcn/ui + Tailwind CSS

## 技术栈

- **Framework**: Next.js 14 (App Router)
- **Database**: Prisma + SQLite
- **Auth**: NextAuth.js
- **AI**: Coze API (@coze/api SDK)
- **UI**: shadcn/ui, Tailwind CSS
- **Streaming**: Server-Sent Events (SSE)

## 快速开始

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 配置环境变量

复制 \`.env.example\` 到 \`.env.local\`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

编辑 \`.env.local\`，填入你的 Coze API Token。

### 3. 初始化数据库

\`\`\`bash
npx prisma migrate dev
npx prisma db seed
\`\`\`

### 4. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

打开 http://localhost:3000

### 5. 登录

默认管理员账号：
- 邮箱: \`admin@company.com\`
- 密码: \`admin123\`

## 项目结构

\`\`\`
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
\`\`\`

## 安全特性

- ✅ API 密钥仅存在服务端 (.env.local)
- ✅ BFF 模式，客户端无法访问 Coze API
- ✅ bcrypt 密码哈希 (saltRounds=12)
- ✅ 路由中间件保护
- ✅ 数据隔离（用户只能访问自己的对话）
- ✅ 审计日志

## 开发指南

### 添加新工具

1. 在 Coze 平台创建新 Bot 或 Workflow
2. 复制 Bot ID
3. 通过 Prisma Studio 或管理后台添加工具记录
4. 填写 \`cozeBotId\` 字段

### 查看数据库

\`\`\`bash
npx prisma studio
\`\`\`

### 数据库迁移

\`\`\`bash
npx prisma migrate dev --name your_migration_name
\`\`\`

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
\`\`\`

**Step 3: Create deployment guide**

Create `docs/DEPLOYMENT.md`:

```markdown
# 部署指南

## 生产环境部署

### 1. 环境变量配置

生产环境需要更新以下环境变量：

\`\`\`env
# 生产数据库 (推荐 PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Coze API (不变)
COZE_API_TOKEN="your_production_token"
COZE_BASE_URL="https://api.coze.cn"

# NextAuth (更新域名和密钥)
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate_strong_secret_with_openssl_rand_base64_32"
\`\`\`

### 2. 数据库迁移 (SQLite → PostgreSQL)

修改 \`prisma/schema.prisma\`:

\`\`\`prisma
datasource db {
  provider = "postgresql"  // 改为 postgresql
  url      = env("DATABASE_URL")
}
\`\`\`

运行迁移:

\`\`\`bash
npx prisma migrate deploy
npx prisma db seed
\`\`\`

### 3. 部署到 Vercel

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

在 Vercel Dashboard 配置环境变量。

### 4. 安全加固

- [ ] 更改管理员默认密码
- [ ] 启用账号审批流程 (修改 seed.ts 中 \`isApproved: false\`)
- [ ] 配置登录失败锁定
- [ ] 定期审查审计日志
- [ ] 配置 HTTPS 和 CSP

### 5. 监控

推荐工具:
- Sentry (错误追踪)
- Vercel Analytics (性能)
- Prisma Accelerate (数据库缓存)

## 备份策略

每日备份数据库:

\`\`\`bash
pg_dump dbname > backup_$(date +%Y%m%d).sql
\`\`\`

## 回滚计划

保留最近 3 个版本的数据库备份。

回滚命令:

\`\`\`bash
git revert HEAD
vercel --prod
\`\`\`
\`\`\`

**Step 4: Run final build test**

```bash
npm run build
```

Expected: Build completes successfully without errors.

**Step 5: Commit documentation**

```bash
git add README.md docs/DEPLOYMENT.md
git commit -m "docs: add README and deployment guide

- Project overview and features
- Quick start instructions
- Development guidelines
- Production deployment checklist
- Security hardening steps

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

**Step 6: Create final tag**

```bash
git tag -a v1.0.0-mvp -m "MVP Release: Core chat functionality

Features:
- User authentication (login/register)
- Real-time streaming chat with Coze integration
- Conversation history persistence
- Audit logging
- Secure API key management

Ready for internal testing."
```

---

## Execution Complete - Next Steps

**Plan saved to:** `docs/plans/2026-02-22-school-anniversary-ai-platform.md`

**Two execution options:**

**1. Subagent-Driven Development (this session)**
- I dispatch fresh subagent per task
- Review code between tasks
- Fast iteration with continuous oversight
- **REQUIRED SUB-SKILL:** superpowers:subagent-driven-development

**2. Parallel Session (separate session)**
- Open new terminal session
- Load plan with executing-plans skill
- Batch execution with checkpoints
- **REQUIRED SUB-SKILL:** superpowers:executing-plans (in new session)

**Which approach do you prefer?**

If neither, I can also execute tasks directly in this session step-by-step with your approval at each stage.
