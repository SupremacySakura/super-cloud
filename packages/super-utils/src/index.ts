import type {
    Requester,
    RequestConfig,
    Response,
    GlobalCacheOptions,
    RequestCacheOptions,
    RequestPlugin
} from "./request-core/index"
import {
    RequestCore,
    useCachePlugin
} from "./request-core/index"
import { AxiosRequester } from "./request-axios-imp/index"

export type {
    Requester,
    RequestConfig,
    Response,
    GlobalCacheOptions,
    RequestCacheOptions,
    RequestPlugin
}

export { RequestCore, AxiosRequester, useCachePlugin }