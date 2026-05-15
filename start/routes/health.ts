import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

/**
 * Vérifie l'état de santé de l'application
 */
router.get('/health', [controllers.Health, 'handle']).use(middleware.health())
