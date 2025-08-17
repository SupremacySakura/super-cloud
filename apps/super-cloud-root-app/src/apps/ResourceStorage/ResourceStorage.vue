<script setup lang="ts">
import SideBar from '../../components/SideBar.vue';
import { RouterView } from 'vue-router'
import { sideBarList } from './route'
</script>

<template>
    <div class="common-layout">
        <el-container style="height: 100%;">
            <el-aside width="200px">
                <SideBar :sideBarList="sideBarList" title="资源管理助手"></SideBar>
            </el-aside>
            <el-main style="padding: 0; max-width: calc(100vw - 200px); overflow-x: hidden; overflow-y: auto;">
                <RouterView></RouterView>
            </el-main>
        </el-container>
    </div>
</template>

<style lang="less" scoped>
.common-layout {
    height: 100%;
}
</style>
