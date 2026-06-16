import { beforeCreate, beforeSave, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { LinkedinProspectSchema } from '#database/schema'
import ProspectAction from '#models/prospect_action'
import { ProspectableType } from '#enums/prospectable_type'

/**
 * Modele Lucid pour un prospect LinkedIn.
 * Voir le cahier des charges, paragraphes 6.2 (colonnes) et 6.3 (statuts).
 */
export default class LinkedinProspect extends LinkedinProspectSchema {
  public static table = 'linkedin_prospects'

  /**
   * Timeline d'actions associee a ce prospect (relation polymorphe filtree).
   */
  @hasMany(() => ProspectAction, {
    foreignKey: 'prospectableId',
    onQuery: (query) => query.where('prospectable_type', ProspectableType.LINKEDIN_PROSPECT),
  })
  declare actions: HasMany<typeof ProspectAction>

  /**
   * Calcule la semaine ISO (YYYY-Www) a la creation si elle n'est pas deja fournie.
   * @param {LinkedinProspect} prospect - Instance en cours de creation.
   * @returns {void}
   */
  @beforeCreate()
  public static assignAddedAtWeek(prospect: LinkedinProspect): void {
    if (!prospect.addedAtWeek) {
      const now: DateTime = DateTime.now().setZone('Europe/Paris')
      prospect.addedAtWeek = `${now.weekYear}-W${String(now.weekNumber).padStart(2, '0')}`
    }
  }

  /**
   * Normalise les flags booleens avant chaque sauvegarde.
   * @param {LinkedinProspect} prospect - Instance en cours de sauvegarde.
   * @returns {void}
   */
  @beforeSave()
  public static normalizeFlags(prospect: LinkedinProspect): void {
    prospect.positiveReply = Boolean(prospect.positiveReply)
    prospect.isFavorite = Boolean(prospect.isFavorite)
    prospect.discoveryCallDone = Boolean(prospect.discoveryCallDone)
    prospect.salesCallDone = Boolean(prospect.salesCallDone)
    prospect.dealWon = Boolean(prospect.dealWon)
  }
}
