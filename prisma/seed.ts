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

  // Create default tool using our custom agent ID
  const tool = await prisma.tool.upsert({
    where: { id: 'default-tool' },
    update: {
      cozeBotId: 'scene-3d-generator',
      name: '校园场景 3D 底图生成助手',
      description: '将实拍的校园现场照片转化为写实 3D 渲染风格的底图。',
      icon: '🏛️',
    },
    create: {
      id: 'default-tool',
      name: '校园场景 3D 底图生成助手',
      description: '将实拍的校园现场照片转化为写实 3D 渲染风格的底图。',
      icon: '🏛️',
      cozeType: 'BOT',
      cozeBotId: 'scene-3d-generator', // Used by AgentRegistry
      isEnabled: true,
      sortOrder: 1,
    },
  })

  console.log('Created default tool:', tool.name)

  const tool2 = await prisma.tool.upsert({
    where: { id: 'museum-generator-tool' },
    update: {
      cozeBotId: 'school-history-museum-generator',
      name: '校史馆室内设计生成助手',
      description: '将校园空间底图进行校史馆的展陈空间设计，输出高精度 3D 效果图。',
      icon: '🏛️',
    },
    create: {
      id: 'museum-generator-tool',
      name: '校史馆室内设计生成助手',
      description: '将校园空间底图进行校史馆的展陈空间设计，输出高精度 3D 效果图。',
      icon: '🏛️',
      cozeType: 'BOT',
      cozeBotId: 'school-history-museum-generator',
      isEnabled: true,
      sortOrder: 2,
    },
  })

  console.log('Created new tool:', tool2.name)

  const tool3 = await prisma.tool.upsert({
    where: { id: 'school-research-tool' },
    update: {
      cozeBotId: 'school-research-assistant',
      name: '校领导及校情综合调研助手',
      description: '精准整合公开信息、预判校庆相关项目方向，输出结构化、精准化、实用化的调研结果。',
      icon: '🔎',
    },
    create: {
      id: 'school-research-tool',
      name: '校领导及校情综合调研助手',
      description: '精准整合公开信息、预判校庆相关项目方向，输出结构化、精准化、实用化的调研结果。',
      icon: '🔎',
      cozeType: 'BOT',
      cozeBotId: 'school-research-assistant',
      isEnabled: true,
      sortOrder: 3,
    },
  })

  console.log('Created new tool:', tool3.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
