import { beforeCreate, beforeSave, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { LocalBusinessProspectSchema } from '#database/schema'
import ProspectAction from '#models/prospect_action'
import { ProspectableType } from '#enums/prospectable_type'

/**
 * Modele Lucid pour un prospect "business local" (issu d'OpenStreetMap puis enrichi).
 */
export default class LocalBusinessProspect extends LocalBusinessProspectSchema {
  public static table = 'local_business_prospects'

  /**
   * Timeline d'actions associee a ce prospect (relation polymorphe filtree).
   */
  @hasMany(() => ProspectAction, {
    foreignKey: 'prospectableId',
    onQuery: (query) => query.where('prospectable_type', ProspectableType.LOCAL_BUSINESS_PROSPECT),
  })
  declare actions: HasMany<typeof ProspectAction>

  /**
   * Calcule la semaine ISO (YYYY-Www) a la creation si elle n'est pas deja fournie.
   * @param {LocalBusinessProspect} prospect - Instance en cours de creation.
   * @returns {void}
   */
  @beforeCreate()
  public static assignAddedAtWeek(prospect: LocalBusinessProspect): void {
    if (!prospect.addedAtWeek) {
      const now: DateTime = DateTime.now().setZone('Europe/Paris')
      prospect.addedAtWeek = `${now.weekYear}-W${String(now.weekNumber).padStart(2, '0')}`
    }
  }

  /**
   * Normalise les flags booleens et le drapeau hasWebsite avant chaque sauvegarde.
   * @param {LocalBusinessProspect} prospect - Instance en cours de sauvegarde.
   * @returns {void}
   */
  @beforeSave()
  public static normalizeFlags(prospect: LocalBusinessProspect): void {
    prospect.positiveReply = Boolean(prospect.positiveReply)
    prospect.isFavorite = Boolean(prospect.isFavorite)
    prospect.discoveryCallDone = Boolean(prospect.discoveryCallDone)
    prospect.salesCallDone = Boolean(prospect.salesCallDone)
    prospect.dealWon = Boolean(prospect.dealWon)
    prospect.hasWebsite = Boolean(prospect.website && prospect.website.trim().length > 0)
  }
}
