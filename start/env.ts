import '@foadonis/crypt'
/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import '@foadonis/crypt'
import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'staging', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),
  DB_DEBUG: Env.schema.boolean(),
  DB_CONNECTION: Env.schema.string(),
  HEALTH_API_KEY_SECRET: Env.schema.string(),
  SESSION_DRIVER: Env.schema.enum(['cookie', 'database', 'memory'] as const),
  API_USER_TOKEN_EXPIRATION: Env.schema.string(),
  API_USER_TOKEN_SECRET_LENGTH: Env.schema.number(),
})
