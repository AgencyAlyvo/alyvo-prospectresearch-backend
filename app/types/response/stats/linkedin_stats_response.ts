/**
 * Statistiques LinkedIn (cahier paragraphe 13.2).
 */
export type LinkedinStatsResponse = {
  invitationsSent: number
  invitationsAccepted: number
  acceptanceRate: number
  messagesSent: number
  replies: number
  replyRate: number
  positiveReplies: number
  negativeReplies: number
  positiveReplyRate: number
  discoveryCallsScheduled: number
  discoveryCallsDone: number
  salesCallsScheduled: number
  salesCallsDone: number
  appointmentRate: number
  proposalsSent: number
  proposalsAccepted: number
  proposalsRefused: number
  closingRate: number
  totalProposalAmount: number
  totalSignedAmount: number
}
