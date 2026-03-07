import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3'

function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  })
}

export async function uploadBackup(clientSlug: string, data: string) {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = now.toISOString().split('T')[0]
  const key = `${clientSlug}/${year}/${month}/${date}.json`

  const client = getR2Client()
  await client.send(new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
    Key: key,
    Body: data,
    ContentType: 'application/json',
  }))

  return key
}

export async function cleanOldBackups(clientSlug: string, maxAgeDays = 90) {
  const client = getR2Client()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - maxAgeDays)

  const { Contents } = await client.send(new ListObjectsV2Command({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
    Prefix: `${clientSlug}/`,
  }))

  if (!Contents) return 0

  let deleted = 0
  for (const obj of Contents) {
    if (obj.LastModified && obj.LastModified < cutoff && obj.Key) {
      await client.send(new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
        Key: obj.Key,
      }))
      deleted++
    }
  }
  return deleted
}
