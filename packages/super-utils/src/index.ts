export type * from './request-core'
import {
    RequestCore,
    useCachePlugin
} from "./request-core/index"
import { AxiosRequester } from "./request-axios-imp"
export { RequestCore, AxiosRequester, useCachePlugin }