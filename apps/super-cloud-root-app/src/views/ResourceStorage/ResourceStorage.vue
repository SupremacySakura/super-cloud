<script setup lang="ts">
import SideBar from './components/SideBar.vue';
import { RouterView } from 'vue-router'
</script>

<template>
    <div class="common-layout">
        <el-container style="height: 100%;">
            <el-aside width="200px">
                <SideBar></SideBar>
            </el-aside>
            <el-main style="padding: 0;">
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
