<script setup lang="ts">
import SideBar from '../../components/SideBar.vue';
import { RouterView } from 'vue-router'
import { sideBarList } from './route'
</script>

<template>
    <div class="common-layout">
        <el-container style="height: 100%;">
            <el-aside width="200px">
                <SideBar :sideBarList="sideBarList" title="AI集合体"></SideBar>
            </el-aside>
            <el-main style="padding: 0; max-width: calc(100vw - 200px); overflow: hidden;"
                class="hide-scrollbar">
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
