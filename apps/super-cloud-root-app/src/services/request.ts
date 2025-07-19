import axios from "axios"
import { useUserStore } from "../stores/user"
import { storeToRefs } from 'pinia'
const loginRequest = axios.create({
  baseURL: 'http://localhost:3001',
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
export default loginRequest