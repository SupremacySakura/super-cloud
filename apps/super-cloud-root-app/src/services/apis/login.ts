import { loginRequest } from '../request'
import type { ApiResponse, CommonResponseData, LoginResponseData } from '../../types/api'
import type { AxiosResponse } from 'axios'
// 请求登录
const postLogin = (username: string, password: string): Promise<AxiosResponse<ApiResponse<LoginResponseData>>> => {
    return loginRequest.post('/user/login', {
        username: username,
        password: password
    })
}
// 发送验证码
const postSendVerificationCode = (email: string): Promise<AxiosResponse<ApiResponse<CommonResponseData>>> => {
    return loginRequest.post('/user/sendVerificationCode', {
        email: email
    })
}
// 注册账号
const postRegister = (username: string, password: string, email: string, code: string): Promise<AxiosResponse<ApiResponse<CommonResponseData>>> => {
    return loginRequest.post('/user/register', {
        username,
        password,
        email,
        code,
    })
}
// 登出
const postLogout = (): Promise<AxiosResponse<ApiResponse<CommonResponseData>>> => {
    return loginRequest.post('/user/logout')
}
export {
    postLogin,
    postSendVerificationCode,
    postRegister,
    postLogout,
}