// src/config/env.config.ts
export const EnvConfiguration = () => ({
  environment: process.env.NODE_ENV || 'dev',
  mongodb: process.env.MONGO_DB,
  port: process.env.PORT || 3002,
  defaultLimit: Number(process.env.DEFAULT_LIMIT || 10),
})
