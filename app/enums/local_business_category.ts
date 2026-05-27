/**
 * Categorie principale d'un business local (derivee des tags OpenStreetMap).
 * Une categorie correspond a un tag OSM "famille" (amenity / shop / ...) ; la sous-categorie
 * (ex: bakery, italian) est stockee dans le champ libre `subcategory`.
 */
export enum LocalBusinessCategory {
  AMENITY = 'amenity',
  SHOP = 'shop',
  CRAFT = 'craft',
  OFFICE = 'office',
  HEALTHCARE = 'healthcare',
  TOURISM = 'tourism',
  LEISURE = 'leisure',
  OTHER = 'other',
}
