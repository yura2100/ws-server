export default () => ({
    database: process.env.DATABASE_URI,
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT
})