import axios from "axios"
import { useUserStore } from "../stores/user"
import { storeToRefs } from 'pinia'
// 登录请求
const loginRequest = axios.create({
  baseURL: import.meta.env.MYAPP_LOGIN_BASE_URL,
  timeout: 10000,//请求超时时间
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
})

// 请求拦截器
loginRequest.interceptors.request.use(
  config => {
    // 在请求前做些什么,比如发送token
    const { sid } = storeToRefs(useUserStore())
    config.headers.Authorization = `Bearer ${sid.value}`
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
loginRequest.interceptors.response.use(
  async (response) => {
    // 对响应数据做些什么
    // ✅ 获取 Authorization 头部
    const authHeader = response.headers['authorization']
    if (authHeader) {
      const sid = authHeader.split(' ')[1]
      const { setSid, setUserInfo } = useUserStore()
      setSid(sid)
      const { userInfo } = response.data
      setUserInfo(userInfo)
    }
    return response
  },
  async (error) => {
    return Promise.reject(error)
  }
)
// 资源管理器请求
const rootRequest = axios.create({
  baseURL: import.meta.env.MYAPP_BASE_URL,
  timeout: 10000,//请求超时时间
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
})

// 请求拦截器
rootRequest.interceptors.request.use(
  config => {
    // 在请求前做些什么,比如发送token
    const { sid } = storeToRefs(useUserStore())
    config.headers.Authorization = `Bearer ${sid.value}`
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
rootRequest.interceptors.response.use(
  async (response) => {
    // 对响应数据做些什么
    return response
  },
  async (error) => {
    return Promise.reject(error)
  }
)
export { loginRequest,rootRequest }
