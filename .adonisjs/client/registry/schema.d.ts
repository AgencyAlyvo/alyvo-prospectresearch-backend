/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'health': {
    methods: ["GET","HEAD"]
    pattern: '/health'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/health_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/health_controller').default['handle']>>>
    }
  }
  'auth.sign_in': {
    methods: ["POST"]
    pattern: '/signin'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth_validator').signInValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth_validator').signInValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['signIn']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['signIn']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.sign_up': {
    methods: ["POST"]
    pattern: '/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth_validator').signUpValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth_validator').signUpValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['signUp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['signUp']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.logout': {
    methods: ["DELETE"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
    }
  }
  'linkedin_prospects.list_linkedin_prospects': {
    methods: ["GET","HEAD"]
    pattern: '/linkedin-prospects'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/linkedin/linkedin_prospect_validator').listLinkedinProspectsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['listLinkedinProspects']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['listLinkedinProspects']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'linkedin_prospects.list_weekly_linkedin_prospects': {
    methods: ["GET","HEAD"]
    pattern: '/linkedin-prospects/weekly'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['listWeeklyLinkedinProspects']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['listWeeklyLinkedinProspects']>>>
    }
  }
  'linkedin_prospects.list_due_linkedin_relances': {
    methods: ["GET","HEAD"]
    pattern: '/linkedin-prospects/due-relances'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['listDueLinkedinRelances']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['listDueLinkedinRelances']>>>
    }
  }
  'linkedin_prospects.enrich_linkedin_prospect': {
    methods: ["POST"]
    pattern: '/linkedin-prospects/enrich'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/linkedin/linkedin_prospect_validator').enrichLinkedinProspectValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/linkedin/linkedin_prospect_validator').enrichLinkedinProspectValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['enrichLinkedinProspect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['enrichLinkedinProspect']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'linkedin_prospects.bulk_linkedin_prospect_action': {
    methods: ["POST"]
    pattern: '/linkedin-prospects/bulk-actions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/shared/prospect_bulk_action_validator').prospectBulkActionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/shared/prospect_bulk_action_validator').prospectBulkActionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['bulkLinkedinProspectAction']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['bulkLinkedinProspectAction']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'linkedin_prospects.get_linkedin_prospect': {
    methods: ["GET","HEAD"]
    pattern: '/linkedin-prospects/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['getLinkedinProspect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['getLinkedinProspect']>>>
    }
  }
  'linkedin_prospects.create_linkedin_prospect': {
    methods: ["POST"]
    pattern: '/linkedin-prospects'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/linkedin/linkedin_prospect_validator').createLinkedinProspectValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/linkedin/linkedin_prospect_validator').createLinkedinProspectValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['createLinkedinProspect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['createLinkedinProspect']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'linkedin_prospects.update_linkedin_prospect': {
    methods: ["PATCH"]
    pattern: '/linkedin-prospects/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/linkedin/linkedin_prospect_validator').updateLinkedinProspectValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/linkedin/linkedin_prospect_validator').updateLinkedinProspectValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['updateLinkedinProspect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['updateLinkedinProspect']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'linkedin_prospects.refresh_linkedin_prospect': {
    methods: ["POST"]
    pattern: '/linkedin-prospects/:id/refresh'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['refreshLinkedinProspect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['refreshLinkedinProspect']>>>
    }
  }
  'linkedin_prospects.delete_linkedin_prospect': {
    methods: ["DELETE"]
    pattern: '/linkedin-prospects/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['deleteLinkedinProspect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['deleteLinkedinProspect']>>>
    }
  }
  'linkedin_prospects.mark_linkedin_prospect_action': {
    methods: ["POST"]
    pattern: '/linkedin-prospects/:id/actions/:action_type'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; action_type: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['markLinkedinProspectAction']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/linkedin_prospects_controller').default['markLinkedinProspectAction']>>>
    }
  }
  'linkedin_stats.get_linkedin_stats': {
    methods: ["GET","HEAD"]
    pattern: '/stats/linkedin'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/stats/linkedin_stats_validator').linkedinStatsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/linkedin_stats_controller').default['getLinkedinStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/linkedin_stats_controller').default['getLinkedinStats']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'weekly_objectives.get_current_weekly_objective': {
    methods: ["GET","HEAD"]
    pattern: '/weekly-objectives/current'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/weekly_objectives_controller').default['getCurrentWeeklyObjective']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/weekly_objectives_controller').default['getCurrentWeeklyObjective']>>>
    }
  }
  'user_settings.get_user_settings': {
    methods: ["GET","HEAD"]
    pattern: '/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_settings_controller').default['getUserSettings']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_settings_controller').default['getUserSettings']>>>
    }
  }
  'user_settings.update_user_settings': {
    methods: ["PUT"]
    pattern: '/settings'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/settings/user_settings_validator').updateUserSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/settings/user_settings_validator').updateUserSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_settings_controller').default['updateUserSettings']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_settings_controller').default['updateUserSettings']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'local_business_prospects.list_local_business_prospects': {
    methods: ["GET","HEAD"]
    pattern: '/local-businesses'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/local_business/local_business_prospect_validator').listLocalBusinessProspectsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['listLocalBusinessProspects']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['listLocalBusinessProspects']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'local_business_prospects.list_weekly_local_business_prospects': {
    methods: ["GET","HEAD"]
    pattern: '/local-businesses/weekly'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['listWeeklyLocalBusinessProspects']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['listWeeklyLocalBusinessProspects']>>>
    }
  }
  'local_business_prospects.search_osm_by_city': {
    methods: ["POST"]
    pattern: '/local-businesses/search-osm'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/local_business/local_business_prospect_validator').searchOsmValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/local_business/local_business_prospect_validator').searchOsmValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['searchOsmByCity']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['searchOsmByCity']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'local_business_prospects.bulk_import_from_osm': {
    methods: ["POST"]
    pattern: '/local-businesses/bulk-import'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/local_business/local_business_prospect_validator').bulkImportFromOsmValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/local_business/local_business_prospect_validator').bulkImportFromOsmValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['bulkImportFromOsm']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['bulkImportFromOsm']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'local_business_prospects.bulk_local_business_prospect_action': {
    methods: ["POST"]
    pattern: '/local-businesses/bulk-actions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/shared/prospect_bulk_action_validator').prospectBulkActionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/shared/prospect_bulk_action_validator').prospectBulkActionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['bulkLocalBusinessProspectAction']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['bulkLocalBusinessProspectAction']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'local_business_prospects.get_local_business_prospect': {
    methods: ["GET","HEAD"]
    pattern: '/local-businesses/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['getLocalBusinessProspect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['getLocalBusinessProspect']>>>
    }
  }
  'local_business_prospects.create_local_business_prospect': {
    methods: ["POST"]
    pattern: '/local-businesses'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/local_business/local_business_prospect_validator').createLocalBusinessProspectValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/local_business/local_business_prospect_validator').createLocalBusinessProspectValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['createLocalBusinessProspect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['createLocalBusinessProspect']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'local_business_prospects.update_local_business_prospect': {
    methods: ["PATCH"]
    pattern: '/local-businesses/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/local_business/local_business_prospect_validator').updateLocalBusinessProspectValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/local_business/local_business_prospect_validator').updateLocalBusinessProspectValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['updateLocalBusinessProspect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['updateLocalBusinessProspect']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'local_business_prospects.enrich_local_business_prospect': {
    methods: ["POST"]
    pattern: '/local-businesses/:id/enrich'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['enrichLocalBusinessProspect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['enrichLocalBusinessProspect']>>>
    }
  }
  'local_business_prospects.delete_local_business_prospect': {
    methods: ["DELETE"]
    pattern: '/local-businesses/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['deleteLocalBusinessProspect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['deleteLocalBusinessProspect']>>>
    }
  }
  'local_business_prospects.mark_local_business_prospect_action': {
    methods: ["POST"]
    pattern: '/local-businesses/:id/actions/:action_type'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; action_type: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['markLocalBusinessProspectAction']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/local_business_prospects_controller').default['markLocalBusinessProspectAction']>>>
    }
  }
  'local_business_stats.get_local_business_stats': {
    methods: ["GET","HEAD"]
    pattern: '/stats/local-business'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/stats/local_business_stats_validator').localBusinessStatsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/local_business_stats_controller').default['getLocalBusinessStats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/local_business_stats_controller').default['getLocalBusinessStats']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
