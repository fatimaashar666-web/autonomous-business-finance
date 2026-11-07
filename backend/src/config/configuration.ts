/**
 * Validated configuration factory.
 * All environment variables are read here — never scattered across the app.
 */
export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
  },
});
