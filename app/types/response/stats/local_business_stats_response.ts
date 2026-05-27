/**
 * Statistiques business locaux (parallele du tableau de bord LinkedIn).
 */
export type LocalBusinessStatsResponse = {
  // Acquisition / base de donnees
  totalProspects: number
  withEmail: number
  withPhone: number
  withWebsite: number
  enriched: number

  // Engagement (contact direct)
  emailsSent: number
  callsMade: number
  contactsMade: number

  // Reponses (positives / negatives uniquement, derivees des statuts)
  positiveReplies: number
  negativeReplies: number
  replyRate: number
  positiveReplyRate: number

  // Rendez-vous (uniquement les faits, alignes sur les statuts commerciaux)
  discoveryCallsDone: number
  salesCallsDone: number

  // Ventes
  proposalsSent: number
  proposalsAccepted: number
  proposalsRefused: number
  closingRate: number
  totalProposalAmount: number
  totalSignedAmount: number

  // Web / SEO (scores Lighthouse moyens sur prospects analyses)
  lighthouseAnalyzed: number
  averageSeoScore: number
  averagePerformanceScore: number
  averageAccessibilityScore: number
  averageBestPracticesScore: number
}
