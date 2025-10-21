import { RequestCore } from "./core/RequestCore"
import type { Requester,RequestPlugin } from "./interfaces"
import type {
    RequestConfig,
    Response,
    GlobalCacheOptions,
    RequestCacheOptions
} from "./types"
import { useCachePlugin } from "./plugins"
export type {
    Requester,
    RequestConfig,
    Response,
    GlobalCacheOptions,
    RequestCacheOptions,
    RequestPlugin
}

export {
    RequestCore,
    useCachePlugin
}