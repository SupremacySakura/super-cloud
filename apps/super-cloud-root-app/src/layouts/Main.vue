<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from '../components/NavBar.vue'
</script>

<template>
    <div class="common-layout">
        <el-container style="height: 100%;">
            <el-header style="padding: 0;height: 50px;">
                <NavBar />
            </el-header>
            <el-main style="padding: 0;height: calc(100vh-50px);">
                <router-view />
            </el-main>
        </el-container>
    </div>
</template>

<style scoped lang="less">
.common-layout {
    height: 100%;
    overflow: hidden;

    .main-item {
        width: 100%;
        height: calc(100vh-50px);
    }
}
</style>
