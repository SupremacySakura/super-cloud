import axios from 'axios'
import { Requester } from '../../request-core/interfaces/Requester'

export const AxiosRequester: Requester = {
    request: (config) => axios.request(config),
    get: (url, config) => axios.get(url, config),
    post: (url, data, config) => axios.post(url, data, config),
    put: (url, data, config) => axios.put(url, data, config),
    delete: (url, config) => axios.delete(url, config),
}