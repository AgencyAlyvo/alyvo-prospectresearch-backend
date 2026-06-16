import vine from '@vinejs/vine'
import { LinkedinProspectStatus } from '#enums/linkedin_prospect_status'

const statusValues = Object.values(LinkedinProspectStatus) as string[]

/**
 * Valide la creation manuelle d'un prospect LinkedIn (cahier paragraphe 6.2).
 */
export const createLinkedinProspectValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().minLength(1).maxLength(120),
    lastName: vine.string().trim().minLength(1).maxLength(120),
    position: vine.string().trim().maxLength(200).nullable().optional(),
    company: vine.string().trim().maxLength(200).nullable().optional(),
    industry: vine.string().trim().maxLength(120).nullable().optional(),
    city: vine.string().trim().maxLength(120).nullable().optional(),
    region: vine.string().trim().maxLength(120).nullable().optional(),
    country: vine.string().trim().maxLength(120).nullable().optional(),
    profileHeadline: vine.string().trim().maxLength(500).nullable().optional(),
    openToWork: vine.boolean().nullable().optional(),
    hiring: vine.boolean().nullable().optional(),
    connectionsCount: vine.number().min(0).nullable().optional(),
    followerCount: vine.number().min(0).nullable().optional(),
    linkedinUrl: vine.string().trim().url().nullable().optional(),
    companyLinkedinUrl: vine.string().trim().url().nullable().optional(),
    websiteUrl: vine.string().trim().url().nullable().optional(),
    email: vine.string().trim().email().normalizeEmail().nullable().optional(),
    phone: vine.string().trim().maxLength(60).nullable().optional(),
    companyEmployeeCountRange: vine.string().trim().maxLength(120).nullable().optional(),
    companyType: vine.string().trim().maxLength(120).nullable().optional(),
    companyTagline: vine.string().trim().maxLength(500).nullable().optional(),
    companyDescription: vine.string().trim().nullable().optional(),
    status: vine.enum(statusValues).optional(),
  }),
)

/**
 * Valide la demande d'enrichissement d'un prospect depuis LinkedIn.
 */
export const enrichLinkedinProspectValidator = vine.compile(
  vine.object({
    linkedinUrl: vine.string().trim().url(),
  }),
)

/**
 * Valide la mise a jour partielle d'un prospect LinkedIn.
 */
export const updateLinkedinProspectValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().minLength(1).maxLength(120).optional(),
    lastName: vine.string().trim().minLength(1).maxLength(120).optional(),
    position: vine.string().trim().maxLength(200).nullable().optional(),
    company: vine.string().trim().maxLength(200).nullable().optional(),
    industry: vine.string().trim().maxLength(120).nullable().optional(),
    city: vine.string().trim().maxLength(120).nullable().optional(),
    region: vine.string().trim().maxLength(120).nullable().optional(),
    country: vine.string().trim().maxLength(120).nullable().optional(),
    profileHeadline: vine.string().trim().maxLength(500).nullable().optional(),
    openToWork: vine.boolean().nullable().optional(),
    hiring: vine.boolean().nullable().optional(),
    connectionsCount: vine.number().min(0).nullable().optional(),
    followerCount: vine.number().min(0).nullable().optional(),
    linkedinUrl: vine.string().trim().url().nullable().optional(),
    companyLinkedinUrl: vine.string().trim().url().nullable().optional(),
    websiteUrl: vine.string().trim().url().nullable().optional(),
    email: vine.string().trim().email().normalizeEmail().nullable().optional(),
    phone: vine.string().trim().maxLength(60).nullable().optional(),
    companyEmployeeCountRange: vine.string().trim().maxLength(120).nullable().optional(),
    companyType: vine.string().trim().maxLength(120).nullable().optional(),
    companyTagline: vine.string().trim().maxLength(500).nullable().optional(),
    companyDescription: vine.string().trim().nullable().optional(),
    status: vine.enum(statusValues).optional(),
    nextAction: vine.string().trim().maxLength(200).nullable().optional(),
    nextActionAt: vine.string().trim().nullable().optional(),
    identifiedNeed: vine.string().trim().nullable().optional(),
    discoveryCallAt: vine.string().trim().nullable().optional(),
    salesCallAt: vine.string().trim().nullable().optional(),
    proposalSentAt: vine.string().trim().nullable().optional(),
    signedAt: vine.string().trim().nullable().optional(),
    proposalAmount: vine.number().min(0).nullable().optional(),
    signedAmount: vine.number().min(0).nullable().optional(),
    lossReason: vine.string().trim().nullable().optional(),
    isFavorite: vine.boolean().optional(),
  }),
)

/**
 * Valide les filtres et la pagination du listing des prospects LinkedIn
 * (cahier paragraphes 5.2 section 4 et 6.4).
 */
export const listLinkedinProspectsValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    perPage: vine.number().min(1).max(200).optional(),
    search: vine.string().trim().nullable().optional(),
    status: vine.array(vine.enum(statusValues)).optional(),
    industry: vine.string().trim().optional(),
    city: vine.string().trim().optional(),
    region: vine.string().trim().optional(),
    position: vine.string().trim().optional(),
    company: vine.string().trim().optional(),
    invitationSent: vine.boolean().optional(),
    invitationAccepted: vine.boolean().optional(),
    replied: vine.boolean().optional(),
    hasEmail: vine.boolean().optional(),
    isFavorite: vine.boolean().optional(),
    week: vine
      .string()
      .trim()
      .regex(/^\d{4}-W\d{2}$/)
      .optional(),
    sortBy: vine.enum(['createdAt', 'nextActionAt', 'invitationSentAt', 'lastName']).optional(),
    sortDir: vine.enum(['asc', 'desc']).optional(),
  }),
)
