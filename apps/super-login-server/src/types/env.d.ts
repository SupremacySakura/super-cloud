// types/env.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
        PORT?: string

        DB_HOST: string
        DB_PORT: string
        DB_USER: string
        DB_PASSWORD: string
        DB_NAME: string

        MAIL_HOST: string
        MAIL_PORT: string
        MAIL_USER: string
        MAIL_PASS: string
    }
}
