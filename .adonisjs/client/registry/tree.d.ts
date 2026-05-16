/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  health: typeof routes['health']
  auth: {
    signIn: typeof routes['auth.sign_in']
    signUp: typeof routes['auth.sign_up']
    logout: typeof routes['auth.logout']
  }
}
