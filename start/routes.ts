import router from '@adonisjs/core/services/router'

/**
 * Routes système
 */
import './routes/swagger.js'
import './routes/health.js'
import './routes/auth.js'

/**
 * Routes métiers
 */
import './routes/linkedin.js'

/**
 * Cette route est utilisée pour tester le fonctionnement de base de l'application.
 */
router.get('/', async (): Promise<{ hello: string }> => {
  return {
    hello: 'test',
  }
})
