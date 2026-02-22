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

  // Create default tool using provided bot ID
  const tool = await prisma.tool.upsert({
    where: { id: 'default-tool' },
    update: {},
    create: {
      id: 'default-tool',
      name: '校庆活动策划助手',
      description: 'AI驱动的校庆活动策划方案生成工具',
      icon: '🎓',
      cozeType: 'BOT',
      cozeBotId: '7609206709621358628',
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
