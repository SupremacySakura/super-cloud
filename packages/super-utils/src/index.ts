import type {
    Requester,
    RequestConfig,
    Response
} from "./request-core/index"
import {
    RequestCore,
} from "./request-core/index"
import { AxiosRequester } from "./request-axios-imp/index"

export type {
    Requester,
    RequestConfig,
    Response
}

export { RequestCore, AxiosRequester }