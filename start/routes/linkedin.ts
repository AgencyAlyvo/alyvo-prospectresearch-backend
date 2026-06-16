import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const LinkedinProspectsController = () => import('#controllers/linkedin_prospects_controller')
const LinkedinStatsController = () => import('#controllers/linkedin_stats_controller')
const WeeklyObjectivesController = () => import('#controllers/weekly_objectives_controller')
const UserSettingsController = () => import('#controllers/user_settings_controller')

/**
 * Routes du canal LinkedIn et des features transverses (stats, relances,
 * parametres et objectif hebdomadaire).
 *
 * Toutes les routes sont protegees par le guard 'api' (access token bearer).
 */
router
  .group((): void => {
    // Prospects LinkedIn (cahier paragraphes 5, 6, 7).
    router.get('/linkedin-prospects', [LinkedinProspectsController, 'listLinkedinProspects'])
    router.get('/linkedin-prospects/weekly', [LinkedinProspectsController, 'listWeeklyLinkedinProspects'])
    router.get('/linkedin-prospects/due-relances', [LinkedinProspectsController, 'listDueLinkedinRelances'])
    router.post('/linkedin-prospects/enrich', [LinkedinProspectsController, 'enrichLinkedinProspect'])
    router.post('/linkedin-prospects/bulk-actions', [LinkedinProspectsController, 'bulkLinkedinProspectAction'])
    router.get('/linkedin-prospects/:id', [LinkedinProspectsController, 'getLinkedinProspect'])
    router.post('/linkedin-prospects', [LinkedinProspectsController, 'createLinkedinProspect'])
    router.patch('/linkedin-prospects/:id', [LinkedinProspectsController, 'updateLinkedinProspect'])
    router.post('/linkedin-prospects/:id/refresh', [LinkedinProspectsController, 'refreshLinkedinProspect'])
    router.delete('/linkedin-prospects/:id', [LinkedinProspectsController, 'deleteLinkedinProspect'])
    router.post('/linkedin-prospects/:id/actions/:action_type', [
      LinkedinProspectsController,
      'markLinkedinProspectAction',
    ])

    // Statistiques (cahier paragraphes 13.2 a 13.4).
    router.get('/stats/linkedin', [LinkedinStatsController, 'getLinkedinStats'])

    // Objectif hebdomadaire (cahier paragraphe 5.2 section 1).
    router.get('/weekly-objectives/current', [WeeklyObjectivesController, 'getCurrentWeeklyObjective'])

    // Parametres utilisateur (cahier paragraphe 14).
    router.get('/settings', [UserSettingsController, 'getUserSettings'])
    router.put('/settings', [UserSettingsController, 'updateUserSettings'])
  })
  .use(middleware.auth({ guards: ['api'] }))
