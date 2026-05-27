import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const LocalBusinessProspectsController = () => import('#controllers/local_business_prospects_controller')

/**
 * Routes des business locaux (parallele du canal LinkedIn).
 *
 * Toutes les routes sont protegees par le guard 'api' (access token bearer).
 */
router
  .group((): void => {
    router.get('/local-businesses', [LocalBusinessProspectsController, 'listLocalBusinessProspects'])
    router.get('/local-businesses/weekly', [LocalBusinessProspectsController, 'listWeeklyLocalBusinessProspects'])
    router.post('/local-businesses/search-osm', [LocalBusinessProspectsController, 'searchOsmByCity'])
    router.post('/local-businesses/bulk-import', [LocalBusinessProspectsController, 'bulkImportFromOsm'])
    router.post('/local-businesses/bulk-actions', [LocalBusinessProspectsController, 'bulkLocalBusinessProspectAction'])
    router.get('/local-businesses/:id', [LocalBusinessProspectsController, 'getLocalBusinessProspect'])
    router.post('/local-businesses', [LocalBusinessProspectsController, 'createLocalBusinessProspect'])
    router.patch('/local-businesses/:id', [LocalBusinessProspectsController, 'updateLocalBusinessProspect'])
    router.post('/local-businesses/:id/enrich', [LocalBusinessProspectsController, 'enrichLocalBusinessProspect'])
    router.delete('/local-businesses/:id', [LocalBusinessProspectsController, 'deleteLocalBusinessProspect'])
    router.post('/local-businesses/:id/actions/:action_type', [
      LocalBusinessProspectsController,
      'markLocalBusinessProspectAction',
    ])
  })
  .use(middleware.auth({ guards: ['api'] }))
