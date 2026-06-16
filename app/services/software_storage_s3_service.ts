import type { Readable } from 'stream'
import drive from '@adonisjs/drive/services/main'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'
import type { ObjectMetaData } from '@adonisjs/drive/types'
import NotFoundException from '#exceptions/not_found_exception'
import InternalServerErrorException from '#exceptions/internal_server_error_exception'

/**
 * Service de lecture S3 pour les mises a jour du logiciel Alyvo ProspectResearch.
 */
export default class SoftwareStorageS3Service {
  /**
   * Lit le contenu texte d'un objet S3.
   */
  public static async getFileContent(pathFilename: string): Promise<string> {
    try {
      if (!(await drive.use().exists(pathFilename))) {
        throw new NotFoundException('Software file not found')
      }

      const content: string | Uint8Array = await drive.use().get(pathFilename)

      if (typeof content === 'string') {
        return content
      }

      return Buffer.from(content).toString('utf-8')
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error
      }

      logger.error({ err: error, pathFilename }, 'Error fetching software file content')
      throw new InternalServerErrorException('Error while fetching software file content')
    }
  }

  /**
   * Stream un binaire de mise a jour vers le client (Tauri updater ou telechargement web).
   */
  public static async streamDownload(ctx: HttpContext, pathFilename: string): Promise<void> {
    logger.info({ pathFilename }, 'Software download started')

    try {
      if (!(await drive.use().exists(pathFilename))) {
        throw new NotFoundException('Software file not found')
      }

      const meta: ObjectMetaData = await drive.use().getMetaData(pathFilename)
      const fileStream: Readable = await drive.use().getStream(pathFilename)
      const filename: string = pathFilename.split('/').pop() ?? 'download.bin'

      ctx.response.response.setHeader('Content-Type', resolveSoftwareContentType(filename))
      ctx.response.response.setHeader('Access-Control-Allow-Origin', '*')
      ctx.response.response.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      ctx.response.response.setHeader('Content-Length', meta.contentLength.toString())

      return ctx.response.stream(fileStream)
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error
      }

      logger.error({ err: error, pathFilename }, 'Error streaming software file')
      throw new InternalServerErrorException('Error while downloading software file')
    }
  }
}

/**
 * Retourne le Content-Type HTTP adapte au binaire distribue.
 */
function resolveSoftwareContentType(filename: string): string {
  if (filename.endsWith('.tar.gz')) {
    return 'application/gzip'
  }

  if (filename.endsWith('.AppImage')) {
    return 'application/x-executable'
  }

  if (filename.endsWith('.msi')) {
    return 'application/octet-stream'
  }

  return 'application/octet-stream'
}
