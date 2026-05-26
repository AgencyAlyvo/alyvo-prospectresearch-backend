import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_settings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').notNullable().unsigned().references('id').inTable('users').onDelete('CASCADE').unique()

      // Parametres LinkedIn (cahier paragraphe 14.3).
      table.integer('max_invites_per_week').notNullable().defaultTo(100)
      table.integer('relance_1_delay_days').notNullable().defaultTo(3)
      table.integer('relance_2_delay_days').notNullable().defaultTo(7)
      table.integer('relance_3_delay_days').notNullable().defaultTo(15)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
