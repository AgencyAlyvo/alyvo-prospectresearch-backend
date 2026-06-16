/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  health: typeof routes['health']
  auth: {
    signIn: typeof routes['auth.sign_in']
    signUp: typeof routes['auth.sign_up']
    logout: typeof routes['auth.logout']
  }
  linkedinProspects: {
    listLinkedinProspects: typeof routes['linkedin_prospects.list_linkedin_prospects']
    listWeeklyLinkedinProspects: typeof routes['linkedin_prospects.list_weekly_linkedin_prospects']
    listDueLinkedinRelances: typeof routes['linkedin_prospects.list_due_linkedin_relances']
    enrichLinkedinProspect: typeof routes['linkedin_prospects.enrich_linkedin_prospect']
    bulkLinkedinProspectAction: typeof routes['linkedin_prospects.bulk_linkedin_prospect_action']
    getLinkedinProspect: typeof routes['linkedin_prospects.get_linkedin_prospect']
    createLinkedinProspect: typeof routes['linkedin_prospects.create_linkedin_prospect']
    updateLinkedinProspect: typeof routes['linkedin_prospects.update_linkedin_prospect']
    refreshLinkedinProspect: typeof routes['linkedin_prospects.refresh_linkedin_prospect']
    deleteLinkedinProspect: typeof routes['linkedin_prospects.delete_linkedin_prospect']
    markLinkedinProspectAction: typeof routes['linkedin_prospects.mark_linkedin_prospect_action']
  }
  linkedinStats: {
    getLinkedinStats: typeof routes['linkedin_stats.get_linkedin_stats']
  }
  weeklyObjectives: {
    getCurrentWeeklyObjective: typeof routes['weekly_objectives.get_current_weekly_objective']
  }
  userSettings: {
    getUserSettings: typeof routes['user_settings.get_user_settings']
    updateUserSettings: typeof routes['user_settings.update_user_settings']
  }
}
