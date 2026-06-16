import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'linkedin_prospects'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').notNullable().unsigned().references('id').inTable('users').onDelete('CASCADE')

      // Identite du prospect.
      table.string('first_name', 120).notNullable()
      table.string('last_name', 120).notNullable()
      table.string('position', 200).nullable()
      table.string('company', 200).nullable()
      table.string('industry', 120).nullable()
      table.string('city', 120).nullable()
      table.string('region', 120).nullable()
      table.string('country', 120).nullable()
      table.string('profile_headline', 500).nullable()
      table.boolean('open_to_work').nullable()
      table.boolean('hiring').nullable()
      table.integer('connections_count').nullable()
      table.integer('follower_count').nullable()

      // URLs / contact direct.
      table.string('linkedin_url', 500).nullable()
      table.string('company_linkedin_url', 500).nullable()
      table.string('website_url', 500).nullable()
      table.string('email', 254).nullable()
      table.string('phone', 60).nullable()

      // Donnees enrichies depuis la page entreprise LinkedIn.
      table.string('company_employee_count_range', 120).nullable()
      table.string('company_type', 120).nullable()
      table.string('company_tagline', 500).nullable()
      table.text('company_description').nullable()

      // Cycle LinkedIn.
      table.string('status', 64).notNullable().defaultTo('a_inviter').index()
      table.string('next_action', 200).nullable()
      table.date('next_action_at').nullable()

      // Suivi hebdomadaire (semaine ISO format YYYY-Www).
      table.string('added_at_week', 10).nullable().index()

      // Workflow LinkedIn.
      table.timestamp('invitation_sent_at').nullable()
      table.timestamp('invitation_accepted_at').nullable()
      table.timestamp('message_1_sent_at').nullable()
      table.timestamp('relance_1_at').nullable()
      table.timestamp('relance_2_at').nullable()
      table.timestamp('relance_3_at').nullable()
      table.integer('relances_count').notNullable().defaultTo(0)
      table.timestamp('replied_at').nullable()
      table.boolean('positive_reply').notNullable().defaultTo(false)
      table.text('identified_need').nullable()

      // Rendez-vous et ventes LinkedIn.
      table.timestamp('discovery_call_at').nullable()
      table.boolean('discovery_call_done').notNullable().defaultTo(false)
      table.timestamp('sales_call_at').nullable()
      table.boolean('sales_call_done').notNullable().defaultTo(false)
      table.timestamp('proposal_sent_at').nullable()
      table.decimal('proposal_amount', 12, 2).nullable()
      table.boolean('deal_won').notNullable().defaultTo(false)
      table.decimal('signed_amount', 12, 2).nullable()
      table.timestamp('signed_at').nullable()
      table.text('loss_reason').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Index composes pour requetes frequentes.
      table.index(['user_id', 'status'])
      table.index(['user_id', 'added_at_week'])
      table.index(['user_id', 'next_action_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
