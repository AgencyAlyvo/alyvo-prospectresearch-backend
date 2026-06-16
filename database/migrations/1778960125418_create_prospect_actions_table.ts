import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'prospect_actions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      // Relation vers le prospect LinkedIn.
      table.string('prospectable_type', 64).notNullable() // linkedin_prospect
      table.integer('prospectable_id').notNullable().unsigned()

      table.integer('user_id').notNullable().unsigned().references('id').inTable('users').onDelete('CASCADE')

      // Type d'action effectuee (invitation_sent, message_sent, relance_1, etc.).
      table.string('action_type', 64).notNullable().index()
      // Canal physique utilise pour l'action (LinkedIn uniquement).
      table.string('channel', 32).notNullable().defaultTo('linkedin')

      table.text('content').nullable()

      // Date a laquelle l'action a reellement eu lieu (pour la timeline et les stats).
      table.timestamp('occurred_at').notNullable().index()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Index composite pour recuperer rapidement la timeline d'un prospect donne.
      table.index(['prospectable_type', 'prospectable_id'])
      table.index(['user_id', 'occurred_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
