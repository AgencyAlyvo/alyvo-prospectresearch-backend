import vine from '@vinejs/vine'
import { localBusinessFilterStatusValues } from '#constants/local_business_filter_statuses'
import { LocalBusinessStatus } from '#enums/local_business_status'
import { LocalBusinessContactChannel } from '#enums/local_business_contact_channel'
import { LocalBusinessEmailSource } from '#enums/local_business_email_source'

const statusValues = Object.values(LocalBusinessStatus) as string[]
const filterStatusValues = localBusinessFilterStatusValues
const channelValues = Object.values(LocalBusinessContactChannel) as string[]
const emailSourceValues = Object.values(LocalBusinessEmailSource) as string[]

/**
 * Valide la creation manuelle d'un prospect business local.
 */
export const createLocalBusinessProspectValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    category: vine.string().trim().maxLength(64).nullable().optional(),
    subcategory: vine.string().trim().maxLength(120).nullable().optional(),
    osmType: vine.string().trim().maxLength(16).nullable().optional(),
    osmId: vine.string().trim().maxLength(32).nullable().optional(),
    address: vine.string().trim().maxLength(255).nullable().optional(),
    city: vine.string().trim().maxLength(120).nullable().optional(),
    postalCode: vine.string().trim().maxLength(16).nullable().optional(),
    region: vine.string().trim().maxLength(120).nullable().optional(),
    country: vine.string().trim().maxLength(64).nullable().optional(),
    latitude: vine.number().min(-90).max(90).nullable().optional(),
    longitude: vine.number().min(-180).max(180).nullable().optional(),
    phone: vine.string().trim().maxLength(60).nullable().optional(),
    email: vine.string().trim().email().normalizeEmail().nullable().optional(),
    emailSource: vine.enum(emailSourceValues).nullable().optional(),
    website: vine.string().trim().url().nullable().optional(),
    facebookUrl: vine.string().trim().url().nullable().optional(),
    instagramUrl: vine.string().trim().url().nullable().optional(),
    openingHours: vine.string().trim().nullable().optional(),
    contactChannel: vine.enum(channelValues).nullable().optional(),
    notes: vine.string().trim().nullable().optional(),
    status: vine.enum(statusValues).optional(),
  }),
)

/**
 * Valide la mise a jour partielle d'un business local.
 */
export const updateLocalBusinessProspectValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    category: vine.string().trim().maxLength(64).nullable().optional(),
    subcategory: vine.string().trim().maxLength(120).nullable().optional(),
    address: vine.string().trim().maxLength(255).nullable().optional(),
    city: vine.string().trim().maxLength(120).nullable().optional(),
    postalCode: vine.string().trim().maxLength(16).nullable().optional(),
    region: vine.string().trim().maxLength(120).nullable().optional(),
    country: vine.string().trim().maxLength(64).nullable().optional(),
    latitude: vine.number().min(-90).max(90).nullable().optional(),
    longitude: vine.number().min(-180).max(180).nullable().optional(),
    phone: vine.string().trim().maxLength(60).nullable().optional(),
    email: vine.string().trim().email().normalizeEmail().nullable().optional(),
    emailSource: vine.enum(emailSourceValues).nullable().optional(),
    website: vine.string().trim().url().nullable().optional(),
    facebookUrl: vine.string().trim().url().nullable().optional(),
    instagramUrl: vine.string().trim().url().nullable().optional(),
    openingHours: vine.string().trim().nullable().optional(),
    contactChannel: vine.enum(channelValues).nullable().optional(),
    notes: vine.string().trim().nullable().optional(),
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
    seoScore: vine.number().min(0).max(100).nullable().optional(),
    performanceScore: vine.number().min(0).max(100).nullable().optional(),
    accessibilityScore: vine.number().min(0).max(100).nullable().optional(),
    bestPracticesScore: vine.number().min(0).max(100).nullable().optional(),
    isFavorite: vine.boolean().optional(),
  }),
)

/**
 * Valide les filtres et la pagination du listing des business locaux.
 */
export const listLocalBusinessProspectsValidator = vine.compile(
  vine.object({
    page: vine.number().min(1).optional(),
    perPage: vine.number().min(1).max(200).optional(),
    search: vine.string().trim().nullable().optional(),
    status: vine.array(vine.enum(filterStatusValues)).optional(),
    category: vine.string().trim().optional(),
    city: vine.string().trim().optional(),
    region: vine.string().trim().optional(),
    postalCode: vine.string().trim().optional(),
    hasWebsite: vine.boolean().optional(),
    hasEmail: vine.boolean().optional(),
    hasPhone: vine.boolean().optional(),
    seoScoreMax: vine.number().min(0).max(100).optional(),
    isFavorite: vine.boolean().optional(),
    week: vine
      .string()
      .trim()
      .regex(/^\d{4}-W\d{2}$/)
      .optional(),
    sortBy: vine.enum(['createdAt', 'nextActionAt', 'name', 'seoScore', 'performanceScore']).optional(),
    sortDir: vine.enum(['asc', 'desc']).optional(),
  }),
)

/**
 * Valide la recherche OSM (preview avant import).
 */
export const searchOsmValidator = vine.compile(
  vine.object({
    city: vine.string().trim().minLength(2).maxLength(120),
    category: vine.string().trim().maxLength(64).optional(),
    limit: vine.number().min(1).max(100_000).optional(),
  }),
)

/**
 * Valide l'import en masse depuis OSM (apres preview).
 */
export const bulkImportFromOsmValidator = vine.compile(
  vine.object({
    items: vine
      .array(
        vine.object({
          osmType: vine.string().trim(),
          osmId: vine.string().trim(),
          name: vine.string().trim().minLength(1).maxLength(255),
          category: vine.string().trim().nullable().optional(),
          subcategory: vine.string().trim().nullable().optional(),
          address: vine.string().trim().nullable().optional(),
          city: vine.string().trim().nullable().optional(),
          postalCode: vine.string().trim().nullable().optional(),
          region: vine.string().trim().nullable().optional(),
          latitude: vine.number().min(-90).max(90).nullable().optional(),
          longitude: vine.number().min(-180).max(180).nullable().optional(),
          phone: vine.string().trim().maxLength(60).nullable().optional(),
          email: vine.string().trim().maxLength(255).nullable().optional(),
          website: vine.string().trim().maxLength(500).nullable().optional(),
          facebookUrl: vine.string().trim().maxLength(500).nullable().optional(),
          openingHours: vine.string().trim().nullable().optional(),
        }),
      )
      .minLength(1)
      .maxLength(5000),
  }),
)

/**
 * Valide la demande d'enrichissement (juste l'id qui vient des params).
 */
export const enrichLocalBusinessValidator = vine.compile(vine.object({}))
