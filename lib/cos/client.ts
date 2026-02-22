/**
 * 腾讯云 COS 对象存储客户端
 * 使用 cos-nodejs-sdk-v5
 * 配置项读取自环境变量（SERVER-SIDE ONLY）
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const COS = require('cos-nodejs-sdk-v5')

const COS_SECRET_ID = process.env.S3_ACCESS_KEY
const COS_SECRET_KEY = process.env.S3_SECRET_KEY
const COS_BUCKET = process.env.S3_BUCKET_NAME
const COS_REGION = process.env.S3_REGION || 'ap-chengdu'

if (!COS_SECRET_ID || !COS_SECRET_KEY || !COS_BUCKET) {
    console.warn('腾讯云 COS 配置缺失，文件上传功能将不可用。请检查 S3_ACCESS_KEY / S3_SECRET_KEY / S3_BUCKET_NAME 环境变量。')
}

// 单例 COS 客户端（服务端专用）
export const cosClient = COS_SECRET_ID && COS_SECRET_KEY
    ? new COS({
        SecretId: COS_SECRET_ID,
        SecretKey: COS_SECRET_KEY,
    })
    : null

export const COS_CONFIG = {
    bucket: COS_BUCKET || '',
    region: COS_REGION,
}

/**
 * 将 Buffer 上传到 COS，返回带签名的临时 URL（有效期 24 小时）
 * 即使 Bucket 是私有的也可以正常访问
 * @param key  对象键，例如 uploads/2024/photo.jpg
 * @param buffer  文件内容
 * @param contentType  MIME 类型
 */
export async function uploadBufferToCOS(
    key: string,
    buffer: Buffer,
    contentType: string,
): Promise<string> {
    if (!cosClient) {
        throw new Error('腾讯云 COS 未配置，无法上传文件')
    }

    // Step 1: 上传文件
    await new Promise<void>((resolve, reject) => {
        cosClient.putObject(
            {
                Bucket: COS_CONFIG.bucket,
                Region: COS_CONFIG.region,
                Key: key,
                StorageClass: 'STANDARD',
                Body: buffer,
                ContentType: contentType,
            },
            (err: Error | null) => {
                if (err) reject(err)
                else resolve()
            },
        )
    })

    // Step 2: 生成带签名的临时 URL（有效期 86400 秒 = 24 小时）
    // 即使 Bucket 是私有读，这个 URL 也可以被 Coze 等外部服务访问
    const signedUrl = await new Promise<string>((resolve, reject) => {
        cosClient.getObjectUrl(
            {
                Bucket: COS_CONFIG.bucket,
                Region: COS_CONFIG.region,
                Key: key,
                Sign: true,
                Expires: 86400,
            },
            (err: Error | null, data: { Url: string }) => {
                if (err) reject(err)
                else resolve(data.Url)
            },
        )
    })

    return signedUrl
}
