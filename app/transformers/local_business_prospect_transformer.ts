import type LocalBusinessProspect from '#models/local_business_prospect'
import type ProspectAction from '#models/prospect_action'
import { DateTime } from 'luxon'
import { BaseTransformer } from '@adonisjs/core/transformers'
import type { LocalBusinessStatus } from '#enums/local_business_status'
import ProspectActionTransformer from '#transformers/prospect_action_transformer'
import type {
  LocalBusinessProspectFullResponse,
  LocalBusinessProspectSummaryResponse,
} from '#types/response/local_business/local_business_prospect_response'
import { resolveDisplayRegion } from '#utils/french_address'

/**
 * Transformer dedie aux business locaux.
 * Mode "summary" pour les listings, "full" (avec timeline) pour la fiche detaillee.
 */
export default class LocalBusinessProspectTransformer extends BaseTransformer<LocalBusinessProspect> {
  /**
   * Serialise une date/heure Lucid (ou legacy string) en ISO.
   * @param {DateTime | string | null} value - Valeur a serialiser.
   * @returns {string | null} Date ISO ou null.
   */
  private formatDateTime(value: DateTime | string | null): string | null {
    if (!value) return null
    if (DateTime.isDateTime(value)) return value.toISO()
    const parsed: DateTime = DateTime.fromISO(String(value))
    return parsed.isValid ? parsed.toISO() : null
  }

  /**
   * Forme compacte renvoyee dans les listings.
   * @returns {LocalBusinessProspectSummaryResponse} Forme compacte serialisable.
   */
  public toObject(): LocalBusinessProspectSummaryResponse {
    return {
      id: this.resource.id,
      name: this.resource.name,
      category: this.resource.category,
      subcategory: this.resource.subcategory,
      osmType: this.resource.osmType,
      osmId: this.resource.osmId,
      address: this.resource.address,
      city: this.resource.city,
      postalCode: this.resource.postalCode,
      region: resolveDisplayRegion(this.resource.region, this.resource.postalCode),
      country: this.resource.country ?? 'France',
      latitude: this.resource.latitude !== null ? Number(this.resource.latitude) : null,
      longitude: this.resource.longitude !== null ? Number(this.resource.longitude) : null,
      phone: this.resource.phone,
      email: this.resource.email,
      emailSource: this.resource.emailSource,
      website: this.resource.website,
      facebookUrl: this.resource.facebookUrl,
      instagramUrl: this.resource.instagramUrl,
      hasWebsite: this.resource.hasWebsite,
      seoScore: this.resource.seoScore,
      performanceScore: this.resource.performanceScore,
      accessibilityScore: this.resource.accessibilityScore,
      bestPracticesScore: this.resource.bestPracticesScore,
      lighthouseFetchedAt: this.resource.lighthouseFetchedAt ? this.resource.lighthouseFetchedAt.toISO() : null,
      enrichedAt: this.resource.enrichedAt ? this.resource.enrichedAt.toISO() : null,
      status: this.resource.status as LocalBusinessStatus,
      isFavorite: Boolean(this.resource.isFavorite),
      contactChannel: this.resource.contactChannel,
      nextAction: this.resource.nextAction,
      nextActionAt: this.formatDateTime(this.resource.nextActionAt),
      firstContactAt: this.resource.firstContactAt ? this.resource.firstContactAt.toISO() : null,
      relancesCount: this.resource.relancesCount,
      repliedAt: this.resource.repliedAt ? this.resource.repliedAt.toISO() : null,
      positiveReply: this.resource.positiveReply,
      discoveryCallAt: this.resource.discoveryCallAt ? this.resource.discoveryCallAt.toISO() : null,
      salesCallAt: this.resource.salesCallAt ? this.resource.salesCallAt.toISO() : null,
      proposalAmount: this.resource.proposalAmount !== null ? Number(this.resource.proposalAmount) : null,
      signedAmount: this.resource.signedAmount !== null ? Number(this.resource.signedAmount) : null,
      addedAtWeek: this.resource.addedAtWeek,
      createdAt: this.resource.createdAt.toISO()!,
    }
  }

  /**
   * Forme complete (toObject + champs avances + timeline d'actions).
   * @returns {LocalBusinessProspectFullResponse} Forme complete serialisable.
   */
  public toFullObject(): LocalBusinessProspectFullResponse {
    return {
      ...this.toObject(),
      openingHours: this.resource.openingHours,
      notes: this.resource.notes,
      identifiedNeed: this.resource.identifiedNeed,
      relance1At: this.resource.relance1At ? this.resource.relance1At.toISO() : null,
      relance2At: this.resource.relance2At ? this.resource.relance2At.toISO() : null,
      relance3At: this.resource.relance3At ? this.resource.relance3At.toISO() : null,
      discoveryCallDone: this.resource.discoveryCallDone,
      salesCallDone: this.resource.salesCallDone,
      proposalSentAt: this.resource.proposalSentAt ? this.resource.proposalSentAt.toISO() : null,
      dealWon: this.resource.dealWon,
      signedAt: this.resource.signedAt ? this.resource.signedAt.toISO() : null,
      lossReason: this.resource.lossReason,
      updatedAt: this.resource.updatedAt ? this.resource.updatedAt.toISO() : null,
      actions: this.resource.actions.map(
        (action: ProspectAction): ReturnType<ProspectActionTransformer['toObject']> =>
          new ProspectActionTransformer(action).toObject(),
      ),
    }
  }
}
