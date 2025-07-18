<script setup lang="ts">
import { resourceSideBar } from '../route';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();
</script>

<template>
    <div class="container">
        <header class="header">
            <h2>资源管理</h2>
        </header>
        <ul>
            <li v-for="(item) of resourceSideBar" :key="item.path" :class="{ active: item.path === route.path }"
                @click="router.push(item.path)">
                {{ item.text }}
            </li>
        </ul>
    </div>
</template>

<style lang="less" scoped>
.container {
    width: 100%;
    height: 100%;
    background-color: white;
    color: black;
    border-right: 1px solid rgb(192, 198, 204);

    .header {
        height: 60px;
        padding: 20px 24px;

        h2 {
            font-size: 14px;
            font-weight: 600;
        }
    }

    ul {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;

        li {
            width: 100%;
            height: 32px;
            line-height: 32px;
            list-style: none;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 12px;
            font-weight: 400;
            padding: 0 24px;

            &:hover {
                background-color: rgb(247, 249, 250);
            }
        }

        .active {
            background-color: rgba(52, 152, 219, 0.1);
            font-weight: 700;
            color: rgb(0, 100, 200);
        }
    }
}
</style>