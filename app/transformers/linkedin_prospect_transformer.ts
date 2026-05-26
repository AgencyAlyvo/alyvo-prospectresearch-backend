import type LinkedinProspect from '#models/linkedin_prospect'
import type ProspectAction from '#models/prospect_action'
import { DateTime } from 'luxon'
import { BaseTransformer } from '@adonisjs/core/transformers'
import type { LinkedinProspectStatus } from '#enums/linkedin_prospect_status'
import ProspectActionTransformer from '#transformers/prospect_action_transformer'
import type {
  LinkedinProspectFullResponse,
  LinkedinProspectSummaryResponse,
} from '#types/response/linkedin/linkedin_prospect_response'

/**
 * Transformer dedie aux prospects LinkedIn.
 * Mode "summary" pour les listings, "full" (avec timeline) pour la fiche detaillee.
 */
export default class LinkedinProspectTransformer extends BaseTransformer<LinkedinProspect> {
  /**
   * Serialise une date/heure Lucid (ou legacy string) en ISO.
   * @param {DateTime | string | null} value - Valeur a serialiser.
   * @returns {string | null} Date ISO ou null.
   */
  private formatDateTime(value: DateTime | string | null): string | null {
    if (!value) {
      return null
    }

    if (DateTime.isDateTime(value)) {
      return value.toISO()
    }

    const parsed: DateTime = DateTime.fromISO(String(value))
    return parsed.isValid ? parsed.toISO() : null
  }

  /**
   * Forme compacte renvoyee dans les listes LinkedIn.
   * @returns {LinkedinProspectSummaryResponse} Forme compacte serialisable.
   */
  public toObject(): LinkedinProspectSummaryResponse {
    return {
      id: this.resource.id,
      firstName: this.resource.firstName,
      lastName: this.resource.lastName,
      position: this.resource.position,
      company: this.resource.company,
      industry: this.resource.industry,
      city: this.resource.city,
      region: this.resource.region,
      linkedinUrl: this.resource.linkedinUrl,
      companyLinkedinUrl: this.resource.companyLinkedinUrl,
      websiteUrl: this.resource.websiteUrl,
      email: this.resource.email,
      phone: this.resource.phone,
      status: this.resource.status as LinkedinProspectStatus,
      invitationSentAt: this.resource.invitationSentAt ? this.resource.invitationSentAt.toISO() : null,
      invitationAcceptedAt: this.resource.invitationAcceptedAt ? this.resource.invitationAcceptedAt.toISO() : null,
      message1SentAt: this.resource.message1SentAt ? this.resource.message1SentAt.toISO() : null,
      repliedAt: this.resource.repliedAt ? this.resource.repliedAt.toISO() : null,
      positiveReply: this.resource.positiveReply,
      relancesCount: this.resource.relancesCount,
      nextAction: this.resource.nextAction,
      nextActionAt: this.formatDateTime(this.resource.nextActionAt),
      discoveryCallAt: this.resource.discoveryCallAt ? this.resource.discoveryCallAt.toISO() : null,
      salesCallAt: this.resource.salesCallAt ? this.resource.salesCallAt.toISO() : null,
      proposalAmount: this.resource.proposalAmount !== null ? Number(this.resource.proposalAmount) : null,
      signedAmount: this.resource.signedAmount !== null ? Number(this.resource.signedAmount) : null,
      addedAtWeek: this.resource.addedAtWeek,
      createdAt: this.resource.createdAt.toISO()!,
    }
  }

  /**
   * Forme complete (toObject + tous les champs avances + timeline d'actions).
   * @returns {LinkedinProspectFullResponse} Forme complete serialisable.
   */
  public toFullObject(): LinkedinProspectFullResponse {
    return {
      ...this.toObject(),
      country: this.resource.country,
      profileHeadline: this.resource.profileHeadline,
      openToWork: this.resource.openToWork,
      hiring: this.resource.hiring,
      connectionsCount: this.resource.connectionsCount,
      followerCount: this.resource.followerCount,
      companyEmployeeCountRange: this.resource.companyEmployeeCountRange,
      companyType: this.resource.companyType,
      companyTagline: this.resource.companyTagline,
      companyDescription: this.resource.companyDescription,
      message1SentAt: this.resource.message1SentAt ? this.resource.message1SentAt.toISO() : null,
      relance1At: this.resource.relance1At ? this.resource.relance1At.toISO() : null,
      relance2At: this.resource.relance2At ? this.resource.relance2At.toISO() : null,
      relance3At: this.resource.relance3At ? this.resource.relance3At.toISO() : null,
      identifiedNeed: this.resource.identifiedNeed,
      discoveryCallDone: this.resource.discoveryCallDone,
      salesCallDone: this.resource.salesCallDone,
      proposalSentAt: this.resource.proposalSentAt ? this.resource.proposalSentAt.toISO() : null,
      proposalAmount: this.resource.proposalAmount !== null ? Number(this.resource.proposalAmount) : null,
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
