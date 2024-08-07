import dotenv from 'dotenv';
dotenv.config()

const config = {
    INVOICE_INITIALS: process.env.INVOICE_INITIALS || "ST",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY : process.env.JWT_EXPIRY || "30d",
    MONGODB_URL : process.env.MONGODB_URL,
    PORT: process.env.PORT || 4000,
    SMTP_MAIL_HOST: process.env.SMTP_MAIL_HOST,
    SMTP_MAIL_PORT: process.env.SMTP_MAIL_PORT,
    SMTP_MAIL_USERNAME: process.env.SMTP_MAIL_USERNAME,
    SMTP_MAIL_PASSWORD: process.env.SMTP_MAIL_PASSWORD,
    SMTP_MAIL_SENDER_EMAIL: process.env.SMTP_MAIL_SENDER_EMAIL,
}

export default config