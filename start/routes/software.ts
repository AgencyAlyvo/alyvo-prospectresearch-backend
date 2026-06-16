import router from '@adonisjs/core/services/router'

const SoftwareController = () => import('#controllers/software_controller')

/**
 * Manifeste de mise a jour consomme par Tauri plugin-updater.
 */
router.get('/software/updater/:target/:arch/:currentVersion', [SoftwareController, 'updaterManifest'])

/**
 * Telechargement des binaires Alyvo ProspectResearch (MSI, AppImage, tar.gz, etc.).
 */
router.get('/software/download/:nameBundle', [SoftwareController, 'download'])
