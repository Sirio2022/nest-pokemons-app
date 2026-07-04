export const EnvConfig = () => ({
  environment: process.env.NODE_ENV || 'DEV',
  mongodb: process.env.MONGO_DB || 'mongodb://localhost:27017/nest-pokedex',
  port: process.env.PORT || 3002,
  defaultLimit: process.env.DEFAULT_LIMIT || 10,
})
