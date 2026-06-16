import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth_controller')

/**
 * Routes d'authentification API.
 */
router.post('/signin', [AuthController, 'signIn'])
router.post('/signup', [AuthController, 'signUp'])

router.delete('/logout', [AuthController, 'logout']).use(middleware.auth({ guards: ['api'] }))
