export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    database: process.env.DATABASE_URI,
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    productsURL: process.env.PRODUCTS_URL
})