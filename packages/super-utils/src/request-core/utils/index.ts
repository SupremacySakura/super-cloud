import { Response } from '../types'
export const isResponse = (obj: any): obj is Response<any> => {
    return obj
        && typeof obj === 'object'
        && 'data' in obj
        && 'status' in obj
        && 'statusText' in obj
        && 'headers' in obj
        && 'config' in obj
        && typeof obj.config === 'object'
}