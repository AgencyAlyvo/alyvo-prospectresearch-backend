import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'health': { paramsTuple?: []; params?: {} }
    'auth.sign_in': { paramsTuple?: []; params?: {} }
    'auth.sign_up': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.list_linkedin_prospects': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.list_weekly_linkedin_prospects': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.list_due_linkedin_relances': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.enrich_linkedin_prospect': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.bulk_linkedin_prospect_action': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.get_linkedin_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'linkedin_prospects.create_linkedin_prospect': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.update_linkedin_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'linkedin_prospects.refresh_linkedin_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'linkedin_prospects.delete_linkedin_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'linkedin_prospects.mark_linkedin_prospect_action': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'action_type': ParamValue} }
    'linkedin_stats.get_linkedin_stats': { paramsTuple?: []; params?: {} }
    'weekly_objectives.get_current_weekly_objective': { paramsTuple?: []; params?: {} }
    'user_settings.get_user_settings': { paramsTuple?: []; params?: {} }
    'user_settings.update_user_settings': { paramsTuple?: []; params?: {} }
    'local_business_prospects.list_local_business_prospects': { paramsTuple?: []; params?: {} }
    'local_business_prospects.list_weekly_local_business_prospects': { paramsTuple?: []; params?: {} }
    'local_business_prospects.search_osm_by_city': { paramsTuple?: []; params?: {} }
    'local_business_prospects.bulk_import_from_osm': { paramsTuple?: []; params?: {} }
    'local_business_prospects.bulk_local_business_prospect_action': { paramsTuple?: []; params?: {} }
    'local_business_prospects.get_local_business_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'local_business_prospects.create_local_business_prospect': { paramsTuple?: []; params?: {} }
    'local_business_prospects.update_local_business_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'local_business_prospects.enrich_local_business_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'local_business_prospects.delete_local_business_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'local_business_prospects.mark_local_business_prospect_action': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'action_type': ParamValue} }
  }
  GET: {
    'health': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.list_linkedin_prospects': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.list_weekly_linkedin_prospects': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.list_due_linkedin_relances': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.get_linkedin_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'linkedin_stats.get_linkedin_stats': { paramsTuple?: []; params?: {} }
    'weekly_objectives.get_current_weekly_objective': { paramsTuple?: []; params?: {} }
    'user_settings.get_user_settings': { paramsTuple?: []; params?: {} }
    'local_business_prospects.list_local_business_prospects': { paramsTuple?: []; params?: {} }
    'local_business_prospects.list_weekly_local_business_prospects': { paramsTuple?: []; params?: {} }
    'local_business_prospects.get_local_business_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'health': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.list_linkedin_prospects': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.list_weekly_linkedin_prospects': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.list_due_linkedin_relances': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.get_linkedin_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'linkedin_stats.get_linkedin_stats': { paramsTuple?: []; params?: {} }
    'weekly_objectives.get_current_weekly_objective': { paramsTuple?: []; params?: {} }
    'user_settings.get_user_settings': { paramsTuple?: []; params?: {} }
    'local_business_prospects.list_local_business_prospects': { paramsTuple?: []; params?: {} }
    'local_business_prospects.list_weekly_local_business_prospects': { paramsTuple?: []; params?: {} }
    'local_business_prospects.get_local_business_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'auth.sign_in': { paramsTuple?: []; params?: {} }
    'auth.sign_up': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.enrich_linkedin_prospect': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.bulk_linkedin_prospect_action': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.create_linkedin_prospect': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.refresh_linkedin_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'linkedin_prospects.mark_linkedin_prospect_action': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'action_type': ParamValue} }
    'local_business_prospects.search_osm_by_city': { paramsTuple?: []; params?: {} }
    'local_business_prospects.bulk_import_from_osm': { paramsTuple?: []; params?: {} }
    'local_business_prospects.bulk_local_business_prospect_action': { paramsTuple?: []; params?: {} }
    'local_business_prospects.create_local_business_prospect': { paramsTuple?: []; params?: {} }
    'local_business_prospects.enrich_local_business_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'local_business_prospects.mark_local_business_prospect_action': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'action_type': ParamValue} }
  }
  DELETE: {
    'auth.logout': { paramsTuple?: []; params?: {} }
    'linkedin_prospects.delete_linkedin_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'local_business_prospects.delete_local_business_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'linkedin_prospects.update_linkedin_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'local_business_prospects.update_local_business_prospect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'user_settings.update_user_settings': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}