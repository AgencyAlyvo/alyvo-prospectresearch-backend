import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'weekly_objectives'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').notNullable().unsigned().references('id').inTable('users').onDelete('CASCADE')

      // Semaine ISO au format YYYY-Www, unique par utilisateur.
      table.string('week', 10).notNullable()

      // Objectif d'invitations LinkedIn pour cette semaine.
      table.integer('invites_target').notNullable().defaultTo(100)
      // Cache du nombre d'invitations envoyees, recalcule cote service apres chaque action.
      table.integer('invites_sent').notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['user_id', 'week'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
