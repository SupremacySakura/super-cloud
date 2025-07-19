<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
    <div class="common-layout">
        <RouterView />
    </div>
</template>

<style scoped lang="less">
.common-layout {
    height: 100%;
    width: 100%;
    overflow: hidden;
}
</style>
