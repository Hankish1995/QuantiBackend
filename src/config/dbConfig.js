require('dotenv').config();

module.exports = {
    url: process.env.DB_URL,
    PORT: process.env.PORT,
    SECRET_KEY: process.env.SECRET_KEY,
    GMAIL: process.env.GMAIL,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    CHATGPT_KEY: process.env.CHATGPT_KEY,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    OPENAI_ASSISTANT_ID: process.env.OPENAI_ASSISTANT_ID
}