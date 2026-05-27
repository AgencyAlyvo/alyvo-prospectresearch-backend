/**
 * Departements metropolitains et DOM (code -> libelle).
 */
const FRENCH_DEPARTMENT_BY_CODE: Record<string, string> = {
  '01': 'Ain',
  '02': 'Aisne',
  '03': 'Allier',
  '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes',
  '06': 'Alpes-Maritimes',
  '07': 'Ardeche',
  '08': 'Ardennes',
  '09': 'Ariege',
  '10': 'Aube',
  '11': 'Aude',
  '12': 'Aveyron',
  '13': 'Bouches-du-Rhone',
  '14': 'Calvados',
  '15': 'Cantal',
  '16': 'Charente',
  '17': 'Charente-Maritime',
  '18': 'Cher',
  '19': 'Correze',
  '21': "Cote-d'Or",
  '22': "Cotes-d'Armor",
  '23': 'Creuse',
  '24': 'Dordogne',
  '25': 'Doubs',
  '26': 'Drome',
  '27': 'Eure',
  '28': 'Eure-et-Loir',
  '29': 'Finistere',
  '30': 'Gard',
  '31': 'Haute-Garonne',
  '32': 'Gers',
  '33': 'Gironde',
  '34': 'Herault',
  '35': 'Ille-et-Vilaine',
  '36': 'Indre',
  '37': 'Indre-et-Loire',
  '38': 'Isere',
  '39': 'Jura',
  '40': 'Landes',
  '41': 'Loir-et-Cher',
  '42': 'Loire',
  '43': 'Haute-Loire',
  '44': 'Loire-Atlantique',
  '45': 'Loiret',
  '46': 'Lot',
  '47': 'Lot-et-Garonne',
  '48': 'Lozere',
  '49': 'Maine-et-Loire',
  '50': 'Manche',
  '51': 'Marne',
  '52': 'Haute-Marne',
  '53': 'Mayenne',
  '54': 'Meurthe-et-Moselle',
  '55': 'Meuse',
  '56': 'Morbihan',
  '57': 'Moselle',
  '58': 'Nievre',
  '59': 'Nord',
  '60': 'Oise',
  '61': 'Orne',
  '62': 'Pas-de-Calais',
  '63': 'Puy-de-Dome',
  '64': 'Pyrenees-Atlantiques',
  '65': 'Hautes-Pyrenees',
  '66': 'Pyrenees-Orientales',
  '67': 'Bas-Rhin',
  '68': 'Haut-Rhin',
  '69': 'Rhone',
  '70': 'Haute-Saone',
  '71': 'Saone-et-Loire',
  '72': 'Sarthe',
  '73': 'Savoie',
  '74': 'Haute-Savoie',
  '75': 'Paris',
  '76': 'Seine-Maritime',
  '77': 'Seine-et-Marne',
  '78': 'Yvelines',
  '79': 'Deux-Sevres',
  '80': 'Somme',
  '81': 'Tarn',
  '82': 'Tarn-et-Garonne',
  '83': 'Var',
  '84': 'Vaucluse',
  '85': 'Vendee',
  '86': 'Vienne',
  '87': 'Haute-Vienne',
  '88': 'Vosges',
  '89': 'Yonne',
  '90': 'Territoire de Belfort',
  '91': 'Essonne',
  '92': 'Hauts-de-Seine',
  '93': 'Seine-Saint-Denis',
  '94': 'Val-de-Marne',
  '95': "Val-d'Oise",
  '2A': 'Corse-du-Sud',
  '2B': 'Haute-Corse',
  '971': 'Guadeloupe',
  '972': 'Martinique',
  '973': 'Guyane',
  '974': 'La Reunion',
  '976': 'Mayotte',
}

/**
 * Region administrative (2016) a partir du departement.
 */
const FRENCH_REGION_BY_DEPARTMENT: Record<string, string> = {
  Ain: 'Auvergne-Rhone-Alpes',
  Aisne: 'Hauts-de-France',
  Allier: 'Auvergne-Rhone-Alpes',
  'Alpes-de-Haute-Provence': "Provence-Alpes-Cote d'Azur",
  'Hautes-Alpes': "Provence-Alpes-Cote d'Azur",
  'Alpes-Maritimes': "Provence-Alpes-Cote d'Azur",
  Ardeche: 'Auvergne-Rhone-Alpes',
  Ardennes: 'Grand Est',
  Ariege: 'Occitanie',
  Aube: 'Grand Est',
  Aude: 'Occitanie',
  Aveyron: 'Occitanie',
  'Bouches-du-Rhone': "Provence-Alpes-Cote d'Azur",
  Calvados: 'Normandie',
  Cantal: 'Auvergne-Rhone-Alpes',
  Charente: 'Nouvelle-Aquitaine',
  'Charente-Maritime': 'Nouvelle-Aquitaine',
  Cher: 'Centre-Val de Loire',
  Correze: 'Nouvelle-Aquitaine',
  "Cote-d'Or": 'Bourgogne-Franche-Comte',
  "Cotes-d'Armor": 'Bretagne',
  Creuse: 'Nouvelle-Aquitaine',
  Dordogne: 'Nouvelle-Aquitaine',
  Doubs: 'Bourgogne-Franche-Comte',
  Drome: 'Auvergne-Rhone-Alpes',
  Eure: 'Normandie',
  'Eure-et-Loir': 'Centre-Val de Loire',
  Finistere: 'Bretagne',
  Gard: 'Occitanie',
  'Haute-Garonne': 'Occitanie',
  Gers: 'Occitanie',
  Gironde: 'Nouvelle-Aquitaine',
  Herault: 'Occitanie',
  'Ille-et-Vilaine': 'Bretagne',
  Indre: 'Centre-Val de Loire',
  'Indre-et-Loire': 'Centre-Val de Loire',
  Isere: 'Auvergne-Rhone-Alpes',
  Jura: 'Bourgogne-Franche-Comte',
  Landes: 'Nouvelle-Aquitaine',
  'Loir-et-Cher': 'Centre-Val de Loire',
  Loire: 'Auvergne-Rhone-Alpes',
  'Haute-Loire': 'Auvergne-Rhone-Alpes',
  'Loire-Atlantique': 'Pays de la Loire',
  Loiret: 'Centre-Val de Loire',
  Lot: 'Occitanie',
  'Lot-et-Garonne': 'Nouvelle-Aquitaine',
  Lozere: 'Occitanie',
  'Maine-et-Loire': 'Pays de la Loire',
  Manche: 'Normandie',
  Marne: 'Grand Est',
  'Haute-Marne': 'Grand Est',
  Mayenne: 'Pays de la Loire',
  'Meurthe-et-Moselle': 'Grand Est',
  Meuse: 'Grand Est',
  Morbihan: 'Bretagne',
  Moselle: 'Grand Est',
  Nievre: 'Bourgogne-Franche-Comte',
  Nord: 'Hauts-de-France',
  Oise: 'Hauts-de-France',
  Orne: 'Normandie',
  'Pas-de-Calais': 'Hauts-de-France',
  'Puy-de-Dome': 'Auvergne-Rhone-Alpes',
  'Pyrenees-Atlantiques': 'Nouvelle-Aquitaine',
  'Hautes-Pyrenees': 'Occitanie',
  'Pyrenees-Orientales': 'Occitanie',
  'Bas-Rhin': 'Grand Est',
  'Haut-Rhin': 'Grand Est',
  Rhone: 'Auvergne-Rhone-Alpes',
  'Haute-Saone': 'Bourgogne-Franche-Comte',
  'Saone-et-Loire': 'Bourgogne-Franche-Comte',
  Sarthe: 'Pays de la Loire',
  Savoie: 'Auvergne-Rhone-Alpes',
  'Haute-Savoie': 'Auvergne-Rhone-Alpes',
  Paris: 'Ile-de-France',
  'Seine-Maritime': 'Normandie',
  'Seine-et-Marne': 'Ile-de-France',
  Yvelines: 'Ile-de-France',
  'Deux-Sevres': 'Nouvelle-Aquitaine',
  Somme: 'Hauts-de-France',
  Tarn: 'Occitanie',
  'Tarn-et-Garonne': 'Occitanie',
  Var: "Provence-Alpes-Cote d'Azur",
  Vaucluse: "Provence-Alpes-Cote d'Azur",
  Vendee: 'Pays de la Loire',
  Vienne: 'Nouvelle-Aquitaine',
  'Haute-Vienne': 'Nouvelle-Aquitaine',
  Vosges: 'Grand Est',
  Yonne: 'Bourgogne-Franche-Comte',
  'Territoire de Belfort': 'Bourgogne-Franche-Comte',
  Essonne: 'Ile-de-France',
  'Hauts-de-Seine': 'Ile-de-France',
  'Seine-Saint-Denis': 'Ile-de-France',
  'Val-de-Marne': 'Ile-de-France',
  "Val-d'Oise": 'Ile-de-France',
  'Corse-du-Sud': 'Corse',
  'Haute-Corse': 'Corse',
  Guadeloupe: 'Guadeloupe',
  Martinique: 'Martinique',
  Guyane: 'Guyane',
  'La Reunion': 'La Reunion',
  Mayotte: 'Mayotte',
}

/**
 * Extrait le code departement d'un code postal francais.
 * @param {string} postcode - Code postal (5 chiffres).
 * @returns {string | null} Code departement ou null.
 */
function departmentCodeFromPostcode(postcode: string): string | null {
  const digits: string = postcode.replace(/\D/g, '')
  if (digits.length < 2) {
    return null
  }
  if (digits.startsWith('97')) {
    return digits.length >= 3 ? digits.slice(0, 3) : null
  }
  if (digits.startsWith('20')) {
    if (digits.length < 5) {
      return null
    }
    const value: number = Number.parseInt(digits.slice(0, 5), 10)
    return value >= 20200 ? '2B' : '2A'
  }
  return digits.slice(0, 2)
}

/**
 * Deduit le departement francais a partir d'un code postal.
 * @param {string | null | undefined} postcode - Code postal.
 * @returns {string | null} Nom du departement ou null.
 */
export function inferFrenchDepartmentFromPostcode(postcode: string | null | undefined): string | null {
  if (!postcode?.trim()) {
    return null
  }
  const code: string | null = departmentCodeFromPostcode(postcode.trim())
  if (!code) {
    return null
  }
  return FRENCH_DEPARTMENT_BY_CODE[code] ?? null
}

/**
 * Deduit la region administrative francaise (ex. Bretagne) depuis un code postal.
 * @param {string | null | undefined} postcode - Code postal.
 * @returns {string | null} Nom de region ou null.
 */
export function inferFrenchRegionFromPostcode(postcode: string | null | undefined): string | null {
  const department: string | null = inferFrenchDepartmentFromPostcode(postcode)
  if (!department) {
    return null
  }
  return FRENCH_REGION_BY_DEPARTMENT[department] ?? department
}

/**
 * Lit et nettoie un tag OSM optionnel.
 * @param {Record<string, string>} tags - Tags OSM.
 * @param {string} key - Cle du tag.
 * @returns {string | undefined} Valeur nettoyee ou undefined.
 */
function readOsmTag(tags: Record<string, string>, key: string): string | undefined {
  if (!(key in tags)) {
    return undefined
  }
  const trimmed: string = tags[key].trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * Resout la region a afficher : tags OSM puis deduction depuis le code postal.
 * @param {Record<string, string>} tags - Tags OSM du POI.
 * @param {string | null | undefined} postcode - Code postal.
 * @returns {string | null} Region ou null.
 */
export function resolveRegionFromOsmTags(
  tags: Record<string, string>,
  postcode: string | null | undefined,
): string | null {
  const fromTags: string | undefined =
    readOsmTag(tags, 'addr:state') ||
    readOsmTag(tags, 'addr:province') ||
    readOsmTag(tags, 'addr:region') ||
    readOsmTag(tags, 'is_in:state')
  if (fromTags) {
    return fromTags
  }
  return inferFrenchRegionFromPostcode(postcode)
}

/**
 * Resout le pays depuis les tags OSM (defaut France pour l'outil).
 * @param {Record<string, string>} tags - Tags OSM du POI.
 * @returns {string} Libelle pays.
 */
export function resolveCountryFromOsmTags(tags: Record<string, string>): string {
  const raw: string | undefined = readOsmTag(tags, 'addr:country')
  if (!raw) {
    return 'France'
  }
  const upper: string = raw.toUpperCase()
  if (upper === 'FR' || upper === 'FRA') {
    return 'France'
  }
  return raw
}

/**
 * Region affichable en API : valeur en base ou deduction depuis le code postal.
 * @param {string | null | undefined} storedRegion - Region persistee.
 * @param {string | null | undefined} postcode - Code postal.
 * @returns {string | null} Region ou null.
 */
export function resolveDisplayRegion(
  storedRegion: string | null | undefined,
  postcode: string | null | undefined,
): string | null {
  if (storedRegion?.trim()) {
    return storedRegion.trim()
  }
  return inferFrenchRegionFromPostcode(postcode)
}
