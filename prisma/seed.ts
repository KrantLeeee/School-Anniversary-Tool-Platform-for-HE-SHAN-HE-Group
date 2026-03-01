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

  const tool4 = await prisma.tool.upsert({
    where: { id: 'anniversary-planner-tool' },
    update: {
      cozeBotId: 'school-anniversary-planner',
      name: '校庆策划设计案全案生成助手',
      description: '基于学校特色生成定制化、可落地的校庆策划设计全案。',
      icon: '📝',
    },
    create: {
      id: 'anniversary-planner-tool',
      name: '校庆策划设计案全案生成助手',
      description: '基于学校特色生成定制化、可落地的校庆策划设计全案。',
      icon: '📝',
      cozeType: 'BOT',
      cozeBotId: 'school-anniversary-planner',
      isEnabled: true,
      sortOrder: 4,
    },
  })

  console.log('Created new tool:', tool4.name)

  const tool5 = await prisma.tool.upsert({
    where: { id: 'logo-design-tool' },
    update: {
      cozeBotId: 'logo-design-assistant',
      name: '校庆 Logo 设计助手',
      description: '上传学校校徽、文化资料或参考图，AI 生成专业的校庆 Logo 设计方案，包含设计灵感图和完整的标志释义、色彩释义、图形元素说明文案。',
      icon: '🎨',
    },
    create: {
      id: 'logo-design-tool',
      name: '校庆 Logo 设计助手',
      description: '上传学校校徽、文化资料或参考图，AI 生成专业的校庆 Logo 设计方案，包含设计灵感图和完整的标志释义、色彩释义、图形元素说明文案。',
      icon: '🎨',
      cozeType: 'BOT',
      cozeBotId: 'logo-design-assistant',
      isEnabled: true,
      sortOrder: 5,
    },
  })

  console.log('Created new tool:', tool5.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
