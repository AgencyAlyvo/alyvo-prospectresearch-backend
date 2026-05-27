import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import LocalBusinessImportService from '#services/local_business_import_service'
import User from '#models/user'
import env from '#start/env'

/**
 * Commande d'import en masse de business OSM dans la base.
 *
 * Usage :
 *   node ace import:osm-businesses --user-id=1 --file=./businesses-france.osm.pbf
 *
 * Prerequis : le .pbf doit avoir ete pre-filtre via osmium-tool pour ne contenir
 * que les business pertinents (cf. plan du module Business Locaux).
 */
export default class ImportOsmBusinesses extends BaseCommand {
  public static commandName: string = 'import:osm-businesses'
  public static description: string = 'Importe les business locaux depuis un fichier OSM .pbf pre-filtre'
  public static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
    staysAlive: false,
  }

  @flags.number({
    flagName: 'user-id',
    description: "Identifiant de l'utilisateur a qui rattacher les business importes",
    required: true,
  })
  declare public userId: number

  @flags.string({
    flagName: 'file',
    description: 'Chemin du fichier .osm.pbf pre-filtre (defaut : OSM_PBF_FILE_PATH)',
    required: false,
  })
  declare public file: string

  /**
   * Execute l'import.
   * @returns {Promise<void>}
   */
  public async run(): Promise<void> {
    const filePath: string = this.file || env.get('OSM_PBF_FILE_PATH', '')
    if (!filePath) {
      this.logger.error('Aucun fichier OSM specifie. Utilisez --file ou definissez OSM_PBF_FILE_PATH')
      this.exitCode = 1
      return
    }

    const user: User | null = await User.find(this.userId)
    if (!user) {
      this.logger.error(`Utilisateur introuvable : id=${this.userId}`)
      this.exitCode = 1
      return
    }

    const absolutePath: string = LocalBusinessImportService.resolvePbfPath(filePath)
    this.logger.info(`Import OSM en cours depuis ${absolutePath} pour user ${user.email}...`)

    try {
      const stats: { read: number; inserted: number; skipped: number } =
        await LocalBusinessImportService.importPbfToDatabase(
          absolutePath,
          user,
          (progress: { read: number; inserted: number; skipped: number }): void => {
            this.logger.info(
              `Progression : ${progress.read} elements lus, ${progress.inserted} inseres, ${progress.skipped} ignores`,
            )
          },
        )
      this.logger.success(
        `Import termine : ${stats.read} elements lus, ${stats.inserted} inseres, ${stats.skipped} ignores`,
      )
    } catch (err) {
      this.logger.error(`Echec de l'import : ${(err as Error).message}`)
      this.exitCode = 1
    }
  }
}
