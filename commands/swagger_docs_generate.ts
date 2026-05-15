import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
import type { HttpRouterService } from '@adonisjs/core/types'

/**
 * Commande pour générer le fichier swagger.yml
 * @class DocsGenerate
 */
export default class DocsGenerate extends BaseCommand {
  public static commandName: string = 'swagger:docs:generate'
  public static description: string = 'Génère le fichier swagger.yml pour la documentation'
  public static options: CommandOptions = {
    startApp: true, // Nécessaire pour charger l'application et ses routes
    allowUnknownFlags: false,
    staysAlive: false,
  }

  /**
   * Exécute la commande pour générer le fichier swagger.yml
   * @returns {Promise<void>}
   */
  public async run(): Promise<void> {
    // Récupère les routes de l'application
    const Router: HttpRouterService = await this.app.container.make('router')

    // Valide les routes
    Router.commit()

    // Génère le fichier swagger.yml
    await AutoSwagger.default.writeFile(Router.toJSON(), swagger)
    this.logger.info('Swagger documentation generated successfully.')
  }
}
