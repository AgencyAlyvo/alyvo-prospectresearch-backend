import { healthChecks } from '#start/health'
import type { HttpContext } from '@adonisjs/core/http'
import type { HealthCheckReport } from '@adonisjs/health/types'

/**
 * Contrôleur pour gérer les contrôles de santé de l'application.
 * @class HealthController
 */
export default class HealthController {
  /**
   * @health
   * @summary Vérifie l'état de santé de l'application
   * @description Retourne un rapport indiquant si l'application est saine.
   * @operationId healthCheck
   * @responseBody 200 - <HealthCheckReportResponseBody> - L'application est saine
   * @responseBody 503 - <HealthCheckReportResponseBody> - L'application n'est pas saine
   * @responseBody 500 - <ErrorResponseBody> - Erreur serveur lors de l'exécution des contrôles de santé
   */
  /**
   * Gère la requête de contrôle de santé.
   * @param {HttpContext} ctx - Le contexte HTTP contenant la requête et la réponse.
   * @param {Object} ctx.response - L'objet de réponse HTTP.
   * @returns {Promise<void>} - Une promesse qui ne retourne rien mais envoie une réponse HTTP.
   * @throws {InternalServerErrorException} - Si une erreur serveur survient lors de l'exécution des contrôles.
   */
  public async handle({ response }: HttpContext): Promise<void> {
    // Exécuter les contrôles de santé configurés dans l'application
    const report: HealthCheckReport = await healthChecks.run()

    // Retourner le rapport avec un code de statut 200 si l'application est saine
    if (report.isHealthy) {
      response.ok(report)
    }

    // Retourner le rapport avec un code de statut 503 si l'application n'est pas saine
    response.serviceUnavailable(report)
  }
}
