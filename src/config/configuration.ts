export default () => ({
  PORT: process.env.PORT || 3000,
  LOGGER_LEVEL: process.env.LOGGER_LEVEL,
  SALT: process.env.SALT,
  database: {
    DB_URL: process.env.DB_URL,
    REDIS_URL: process.env.REDIS_URL,
  },
  mail: {
    CLIENT_URL: process.env.CLIENT_URL,
    MAIL_FROM: process.env.MAIL_FROM,
    MAIL_USER_NAME: process.env.MAIL_USER_NAME,
    MAIL_USER_PASS: process.env.MAIL_USER_PASS,
  },
  jwt: {
    ACCESS_SECRET: process.env.ACCESS_SECRET,
    ACCESS_TIMEOUT: process.env.ACCESS_TIMEOUT,
  },
});
