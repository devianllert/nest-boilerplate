export default () => ({
  PORT: process.env.PORT,
  LOGGER_LEVEL: process.env.LOGGER_LEVEL,
  SALT: process.env.SALT,
  CLIENT_URL: process.env.CLIENT_URL,
  database: {
    DB_URL: process.env.DB_URL,
    REDIS_URL: process.env.REDIS_URL,
  },
  mail: {
    MAIL_FROM: process.env.MAIL_FROM,
    MAIL_USER_NAME: process.env.MAIL_USER_NAME,
    MAIL_USER_PASS: process.env.MAIL_USER_PASS,
  },
  token: {
    ACCESS_SECRET: process.env.ACCESS_SECRET,
    ACCESS_TIMEOUT: process.env.ACCESS_TIMEOUT,
    REFRESH_TIMEOUT: process.env.REFRESH_TIMEOUT,
    EMAIL_SECRET: process.env.EMAIL_SECRET,
    EMAIL_TIMEOUT: process.env.EMAIL_TIMEOUT,
    RESET_SECRET: process.env.RESET_SECRET,
    RESET_TIMEOUT: process.env.RESET_TIMEOUT,
  },
});
