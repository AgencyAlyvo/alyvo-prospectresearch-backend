import { HealthChecks, DiskSpaceCheck, MemoryHeapCheck } from '@adonisjs/core/health'
import { DbCheck, DbConnectionCountCheck } from '@adonisjs/lucid/database'
import db from '@adonisjs/lucid/services/db'

export const healthChecks: HealthChecks = new HealthChecks().register([
  new DiskSpaceCheck(),
  new MemoryHeapCheck(),
  new DbCheck(db.connection()),
  new DbConnectionCountCheck(db.connection()),
])
