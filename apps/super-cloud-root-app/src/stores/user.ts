import { defineStore } from "pinia"
import { ref } from "vue"
import type { User } from "../types/user"
export const useUserStore = defineStore("user", () => {
    const sid = ref("")
    const userInfo = ref<User | null>(null)
    const setSid = (newSid: string) => {
        sid.value = newSid
    }
    const setUserInfo = (newUserInfo: User | null) => {
        userInfo.value = newUserInfo
    }
    return {
        sid,
        setSid,
        userInfo,
        setUserInfo
    }
},{
    persist: true
});