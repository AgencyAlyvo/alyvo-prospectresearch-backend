import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'local_business_prospects'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').notNullable().unsigned().references('id').inTable('users').onDelete('CASCADE')

      // Identifiants OpenStreetMap (cle naturelle).
      // osm_id stocke en string pour eviter les soucis de precision (les ids OSM peuvent depasser Number.MAX_SAFE_INTEGER).
      table.string('osm_type', 16).nullable() // node | way | relation
      table.string('osm_id', 32).nullable()

      // Identite du business.
      table.string('name', 255).notNullable()
      table.string('category', 64).nullable() // amenity | shop | craft | office | healthcare | tourism | leisure | other
      table.string('subcategory', 120).nullable() // ex: bakery, restaurant, dentist, italian...

      // Localisation.
      table.string('address', 255).nullable()
      table.string('city', 120).nullable()
      table.string('postal_code', 16).nullable()
      table.string('region', 120).nullable()
      table.string('country', 64).nullable().defaultTo('France')
      table.decimal('latitude', 10, 7).nullable()
      table.decimal('longitude', 10, 7).nullable()

      // Contact direct (issu d'OSM ou enrichi via n8n).
      table.string('phone', 60).nullable()
      table.string('email', 254).nullable()
      table.string('email_source', 32).nullable() // osm | website_scrape | facebook | manual
      table.string('website', 500).nullable()
      table.string('facebook_url', 500).nullable()
      table.string('instagram_url', 500).nullable()
      table.text('opening_hours').nullable()

      // Scoring Lighthouse / PageSpeed Insights (rempli a l'enrichissement).
      table.boolean('has_website').notNullable().defaultTo(false)
      table.integer('seo_score').nullable() // 0-100
      table.integer('performance_score').nullable() // 0-100
      table.integer('accessibility_score').nullable() // 0-100
      table.integer('best_practices_score').nullable() // 0-100
      table.timestamp('lighthouse_fetched_at').nullable()
      table.timestamp('enriched_at').nullable()

      // Cycle de prospection.
      table.string('status', 64).notNullable().defaultTo('a_contacter').index()
      table.string('contact_channel', 32).nullable() // email | phone | website_form | facebook
      table.string('next_action', 200).nullable()
      table.date('next_action_at').nullable()
      table.text('identified_need').nullable()
      table.text('notes').nullable()

      // Suivi hebdomadaire (semaine ISO YYYY-Www).
      table.string('added_at_week', 10).nullable().index()

      // Workflow de relance (parallele a celui de LinkedIn).
      table.timestamp('first_contact_at').nullable()
      table.timestamp('relance_1_at').nullable()
      table.timestamp('relance_2_at').nullable()
      table.timestamp('relance_3_at').nullable()
      table.integer('relances_count').notNullable().defaultTo(0)
      table.timestamp('replied_at').nullable()
      table.boolean('positive_reply').notNullable().defaultTo(false)

      // Rendez-vous et ventes.
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
      table.index(['user_id', 'city'])
      table.index(['user_id', 'added_at_week'])
      table.index(['user_id', 'next_action_at'])
      // Cle naturelle OSM scoped a l'utilisateur (evite les doublons d'import).
      table.unique(['user_id', 'osm_type', 'osm_id'], { indexName: 'lbp_user_osm_unique' })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
