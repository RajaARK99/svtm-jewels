import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
  },
  clientPrefix: 'VITE_',
  client: {},
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
})
