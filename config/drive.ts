import env from '#start/env'
import { defineConfig, services } from '@adonisjs/drive'

const driveConfig = defineConfig({
  default: env.get('DRIVE_DISK'),

  services: {
    s3: services.s3({
      credentials: {
        accessKeyId: env.get('S3_BUCKET_ACCESS_KEY_ID'),
        secretAccessKey: env.get('S3_BUCKET_SECRET_ACCESS_KEY'),
      },
      region: env.get('S3_BUCKET_REGION'),
      bucket: env.get('S3_BUCKET_NAME'),
      visibility: env.get('S3_BUCKET_VISIBILITY'),
      endpoint: env.get('S3_BUCKET_ENDPOINT'),
      forcePathStyle: env.get('S3_BUCKET_FORCE_PATH_STYLE'),
    }),
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
