<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
 <div id="app">
  <router-view />
 </div>
</template>

<style scoped lang="less">
#app {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
}
</style>
