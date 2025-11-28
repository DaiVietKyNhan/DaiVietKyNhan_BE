import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { z } from 'zod'

// Try to load .env.production first, then .env, or skip if env vars already loaded (Docker)
const envFile = fs.existsSync(path.resolve('.env.production'))
  ? '.env.production'
  : fs.existsSync(path.resolve('.env'))
    ? '.env'
    : null

if (envFile) {
  config({
    path: envFile
  })
} else {
  // In Docker, environment variables are already loaded from docker-compose env_file
  console.log('Loading environment variables from system (Docker mode)')
}

const configSchema = z.object({
  //Application
  APP_NAME: z.string().default('My App'),
  APP_URL: z.string(),
  APP_PORT: z.coerce.number(),
  API_PREFIX: z.string(),
  APP_CORS_ORIGIN: z.string(),
  //Database
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  SECRET_API_KEY: z.string(),
  ADMIN_NAME: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_EMAIL: z.string(),
  PHONE_NUMBER: z.string(),
  OTP_EXPIRES_IN: z.string(),
  //Redis
  REDIS_URI: z.string(),
  // RESEND_API_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string(),
  GOOGLE_CLIENT_REDIRECT_URI: z.string(),
  FE_URL: z.string().url(),
  NEXTJS_APP_URL: z.string().url().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string(),
  GA_PROPERTY_ID: z.string(),
  // Optional: supply service account fields directly via env (avoid storing JSON file)
  GA_SA_CLIENT_EMAIL: z.string().optional(),
  GA_SA_PRIVATE_KEY: z.string().optional()
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  console.error('Invalid environment variables')
  console.error(configServer.error.format())
  process.exit(1)
}

const envConfig = configServer.data

export default envConfig
