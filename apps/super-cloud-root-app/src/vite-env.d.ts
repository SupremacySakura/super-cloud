/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly MYAPP_LOGIN_BASE_URL: string
    readonly MYAPP_MAIL_USER: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
