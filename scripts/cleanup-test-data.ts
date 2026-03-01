import { PrismaClient } from '@prisma/client'
const COS = require('cos-nodejs-sdk-v5')

const prisma = new PrismaClient()

// COS Configuration
const COS_SECRET_ID = process.env.S3_ACCESS_KEY
const COS_SECRET_KEY = process.env.S3_SECRET_KEY
const COS_BUCKET = process.env.S3_BUCKET_NAME
const COS_REGION = process.env.S3_REGION || 'ap-chengdu'

async function cleanup() {
    console.log('🚀 开始清理测试数据...')

    try {
        // 1. 清理数据库对话记录 (Cascade 会自动删除 Message)
        // 注意：这里建议只删除 dev 环境下产生的记录。
        // 如果是本地 SQLite 且全是测试数据，可以直接 wipe。
        const conversationCount = await prisma.conversation.count()
        if (conversationCount > 0) {
            console.log(`- 正在删除 ${conversationCount} 条对话记录...`)
            await prisma.conversation.deleteMany({})
            console.log('✅ 数据库清理完成')
        } else {
            console.log('- 数据库中没有需要清理的对话')
        }

        // 2. 清理腾讯云 COS 中的开发文件夹
        if (COS_SECRET_ID && COS_SECRET_KEY && COS_BUCKET) {
            const cos = new COS({
                SecretId: COS_SECRET_ID,
                SecretKey: COS_SECRET_KEY,
            })

            const prefixes = ['dev-uploads/', 'dev-ai-generations/']

            for (const prefix of prefixes) {
                console.log(`- 正在清理 COS 目录: ${prefix}...`)

                // 列出对象
                const listData = await new Promise<any>((resolve, reject) => {
                    cos.getBucket({
                        Bucket: COS_BUCKET,
                        Region: COS_REGION,
                        Prefix: prefix,
                    }, (err: any, data: any) => {
                        if (err) reject(err)
                        else resolve(data)
                    })
                })

                if (listData.Contents && listData.Contents.length > 0) {
                    const keys = listData.Contents.map((item: any) => ({ Key: item.Key }))

                    // 批量删除
                    await new Promise<void>((resolve, reject) => {
                        cos.deleteMultipleObject({
                            Bucket: COS_BUCKET,
                            Region: COS_REGION,
                            Objects: keys,
                        }, (err: any) => {
                            if (err) reject(err)
                            else resolve()
                        })
                    })
                    console.log(`✅ 已从 COS 删除 ${keys.length} 个文件`)
                } else {
                    console.log(`- COS 目录 ${prefix} 是空的`)
                }
            }
        } else {
            console.warn('⚠️ 腾讯云配置缺失，跳过 COS 清理')
        }

        console.log('\n✨ 测试数据清理任务全部完成！')
    } catch (error) {
        console.error('❌ 清理过程中出错:', error)
    } finally {
        await prisma.$disconnect()
    }
}

cleanup()
