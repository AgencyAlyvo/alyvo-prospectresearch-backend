/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'health': {
    methods: ["GET","HEAD"],
    pattern: '/health',
    tokens: [{"old":"/health","type":0,"val":"health","end":""}],
    types: placeholder as Registry['health']['types'],
  },
  'auth.sign_in': {
    methods: ["POST"],
    pattern: '/signin',
    tokens: [{"old":"/signin","type":0,"val":"signin","end":""}],
    types: placeholder as Registry['auth.sign_in']['types'],
  },
  'auth.sign_up': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.sign_up']['types'],
  },
  'auth.logout': {
    methods: ["DELETE"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.logout']['types'],
  },
  'linkedin_prospects.list_linkedin_prospects': {
    methods: ["GET","HEAD"],
    pattern: '/linkedin-prospects',
    tokens: [{"old":"/linkedin-prospects","type":0,"val":"linkedin-prospects","end":""}],
    types: placeholder as Registry['linkedin_prospects.list_linkedin_prospects']['types'],
  },
  'linkedin_prospects.list_weekly_linkedin_prospects': {
    methods: ["GET","HEAD"],
    pattern: '/linkedin-prospects/weekly',
    tokens: [{"old":"/linkedin-prospects/weekly","type":0,"val":"linkedin-prospects","end":""},{"old":"/linkedin-prospects/weekly","type":0,"val":"weekly","end":""}],
    types: placeholder as Registry['linkedin_prospects.list_weekly_linkedin_prospects']['types'],
  },
  'linkedin_prospects.list_due_linkedin_relances': {
    methods: ["GET","HEAD"],
    pattern: '/linkedin-prospects/due-relances',
    tokens: [{"old":"/linkedin-prospects/due-relances","type":0,"val":"linkedin-prospects","end":""},{"old":"/linkedin-prospects/due-relances","type":0,"val":"due-relances","end":""}],
    types: placeholder as Registry['linkedin_prospects.list_due_linkedin_relances']['types'],
  },
  'linkedin_prospects.enrich_linkedin_prospect': {
    methods: ["POST"],
    pattern: '/linkedin-prospects/enrich',
    tokens: [{"old":"/linkedin-prospects/enrich","type":0,"val":"linkedin-prospects","end":""},{"old":"/linkedin-prospects/enrich","type":0,"val":"enrich","end":""}],
    types: placeholder as Registry['linkedin_prospects.enrich_linkedin_prospect']['types'],
  },
  'linkedin_prospects.bulk_linkedin_prospect_action': {
    methods: ["POST"],
    pattern: '/linkedin-prospects/bulk-actions',
    tokens: [{"old":"/linkedin-prospects/bulk-actions","type":0,"val":"linkedin-prospects","end":""},{"old":"/linkedin-prospects/bulk-actions","type":0,"val":"bulk-actions","end":""}],
    types: placeholder as Registry['linkedin_prospects.bulk_linkedin_prospect_action']['types'],
  },
  'linkedin_prospects.get_linkedin_prospect': {
    methods: ["GET","HEAD"],
    pattern: '/linkedin-prospects/:id',
    tokens: [{"old":"/linkedin-prospects/:id","type":0,"val":"linkedin-prospects","end":""},{"old":"/linkedin-prospects/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['linkedin_prospects.get_linkedin_prospect']['types'],
  },
  'linkedin_prospects.create_linkedin_prospect': {
    methods: ["POST"],
    pattern: '/linkedin-prospects',
    tokens: [{"old":"/linkedin-prospects","type":0,"val":"linkedin-prospects","end":""}],
    types: placeholder as Registry['linkedin_prospects.create_linkedin_prospect']['types'],
  },
  'linkedin_prospects.update_linkedin_prospect': {
    methods: ["PATCH"],
    pattern: '/linkedin-prospects/:id',
    tokens: [{"old":"/linkedin-prospects/:id","type":0,"val":"linkedin-prospects","end":""},{"old":"/linkedin-prospects/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['linkedin_prospects.update_linkedin_prospect']['types'],
  },
  'linkedin_prospects.refresh_linkedin_prospect': {
    methods: ["POST"],
    pattern: '/linkedin-prospects/:id/refresh',
    tokens: [{"old":"/linkedin-prospects/:id/refresh","type":0,"val":"linkedin-prospects","end":""},{"old":"/linkedin-prospects/:id/refresh","type":1,"val":"id","end":""},{"old":"/linkedin-prospects/:id/refresh","type":0,"val":"refresh","end":""}],
    types: placeholder as Registry['linkedin_prospects.refresh_linkedin_prospect']['types'],
  },
  'linkedin_prospects.delete_linkedin_prospect': {
    methods: ["DELETE"],
    pattern: '/linkedin-prospects/:id',
    tokens: [{"old":"/linkedin-prospects/:id","type":0,"val":"linkedin-prospects","end":""},{"old":"/linkedin-prospects/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['linkedin_prospects.delete_linkedin_prospect']['types'],
  },
  'linkedin_prospects.mark_linkedin_prospect_action': {
    methods: ["POST"],
    pattern: '/linkedin-prospects/:id/actions/:action_type',
    tokens: [{"old":"/linkedin-prospects/:id/actions/:action_type","type":0,"val":"linkedin-prospects","end":""},{"old":"/linkedin-prospects/:id/actions/:action_type","type":1,"val":"id","end":""},{"old":"/linkedin-prospects/:id/actions/:action_type","type":0,"val":"actions","end":""},{"old":"/linkedin-prospects/:id/actions/:action_type","type":1,"val":"action_type","end":""}],
    types: placeholder as Registry['linkedin_prospects.mark_linkedin_prospect_action']['types'],
  },
  'linkedin_stats.get_linkedin_stats': {
    methods: ["GET","HEAD"],
    pattern: '/stats/linkedin',
    tokens: [{"old":"/stats/linkedin","type":0,"val":"stats","end":""},{"old":"/stats/linkedin","type":0,"val":"linkedin","end":""}],
    types: placeholder as Registry['linkedin_stats.get_linkedin_stats']['types'],
  },
  'weekly_objectives.get_current_weekly_objective': {
    methods: ["GET","HEAD"],
    pattern: '/weekly-objectives/current',
    tokens: [{"old":"/weekly-objectives/current","type":0,"val":"weekly-objectives","end":""},{"old":"/weekly-objectives/current","type":0,"val":"current","end":""}],
    types: placeholder as Registry['weekly_objectives.get_current_weekly_objective']['types'],
  },
  'user_settings.get_user_settings': {
    methods: ["GET","HEAD"],
    pattern: '/settings',
    tokens: [{"old":"/settings","type":0,"val":"settings","end":""}],
    types: placeholder as Registry['user_settings.get_user_settings']['types'],
  },
  'user_settings.update_user_settings': {
    methods: ["PUT"],
    pattern: '/settings',
    tokens: [{"old":"/settings","type":0,"val":"settings","end":""}],
    types: placeholder as Registry['user_settings.update_user_settings']['types'],
  },
  'software.updater_manifest': {
    methods: ["GET","HEAD"],
    pattern: '/software/updater/:target/:arch/:currentVersion',
    tokens: [{"old":"/software/updater/:target/:arch/:currentVersion","type":0,"val":"software","end":""},{"old":"/software/updater/:target/:arch/:currentVersion","type":0,"val":"updater","end":""},{"old":"/software/updater/:target/:arch/:currentVersion","type":1,"val":"target","end":""},{"old":"/software/updater/:target/:arch/:currentVersion","type":1,"val":"arch","end":""},{"old":"/software/updater/:target/:arch/:currentVersion","type":1,"val":"currentVersion","end":""}],
    types: placeholder as Registry['software.updater_manifest']['types'],
  },
  'software.download': {
    methods: ["GET","HEAD"],
    pattern: '/software/download/:nameBundle',
    tokens: [{"old":"/software/download/:nameBundle","type":0,"val":"software","end":""},{"old":"/software/download/:nameBundle","type":0,"val":"download","end":""},{"old":"/software/download/:nameBundle","type":1,"val":"nameBundle","end":""}],
    types: placeholder as Registry['software.download']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
