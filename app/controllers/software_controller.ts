import type { HttpContext } from '@adonisjs/core/http'
import { resolveSoftwareDownloadKey, resolveUpdaterManifestKey } from '#constants/software_storage'
import SoftwareStorageS3Service from '#services/software_storage_s3_service'

/**
 * Endpoints publics de distribution des mises a jour Alyvo ProspectResearch (manifest + binaires S3).
 */
export default class SoftwareController {
  /**
   * Retourne le manifeste Tauri updater stocke sur S3.
   */
  public async updaterManifest(ctx: HttpContext): Promise<void> {
    const manifestContent: string = await SoftwareStorageS3Service.getFileContent(resolveUpdaterManifestKey())
    const manifest: unknown = JSON.parse(manifestContent)

    ctx.response.json(manifest)
  }

  /**
   * Proxie le telechargement d'un binaire de mise a jour depuis S3.
   */
  public async download(ctx: HttpContext): Promise<void> {
    await SoftwareStorageS3Service.streamDownload(ctx, resolveSoftwareDownloadKey(ctx.params.nameBundle))
  }
}
