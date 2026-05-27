import { LocalBusinessStatus } from '#enums/local_business_status'

/**
 * Statuts autorisés en filtre de listing (hors etapes intermediaires automatiques).
 */
export const localBusinessFilterStatuses: LocalBusinessStatus[] = [
  LocalBusinessStatus.A_CONTACTER,
  LocalBusinessStatus.EMAIL_ENVOYE,
  LocalBusinessStatus.APPEL_PASSE,
  LocalBusinessStatus.NON_REPONDU,
  LocalBusinessStatus.REPONDU_INTERESSE,
  LocalBusinessStatus.REPONDU_NON_INTERESSE,
  LocalBusinessStatus.APPEL_DECOUVERTE_FAIT,
  LocalBusinessStatus.APPEL_DE_VENTE_FAIT,
  LocalBusinessStatus.PROPOSITION_ENVOYEE,
  LocalBusinessStatus.PROPOSITION_ACCEPTEE,
  LocalBusinessStatus.PROPOSITION_REFUSEE,
  LocalBusinessStatus.ARCHIVE,
]

export const localBusinessFilterStatusValues: string[] = localBusinessFilterStatuses as string[]
