import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Ajoute le marqueur favori aux prospects LinkedIn et business locaux.
 */
export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('linkedin_prospects', (table) => {
      table.boolean('is_favorite').notNullable().defaultTo(false)
    })

    this.schema.alterTable('local_business_prospects', (table) => {
      table.boolean('is_favorite').notNullable().defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable('linkedin_prospects', (table) => {
      table.dropColumn('is_favorite')
    })

    this.schema.alterTable('local_business_prospects', (table) => {
      table.dropColumn('is_favorite')
    })
  }
}
