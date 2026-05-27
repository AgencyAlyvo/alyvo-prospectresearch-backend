import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'local_business_prospects'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('facebook_url')
      table.dropColumn('instagram_url')
      table.string('pages_jaunes_url', 500).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('pages_jaunes_url')
      table.string('facebook_url', 500).nullable()
      table.string('instagram_url', 500).nullable()
    })
  }
}
