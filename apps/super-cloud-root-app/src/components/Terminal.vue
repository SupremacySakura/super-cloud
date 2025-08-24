<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  content?: string[]
  title?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  content: () => [],
  title: '终端',
  placeholder: '暂无内容...'
})

const formattedContent = computed(() => {
  return props.content.join('\n')
})
</script>

<template>
  <div class="terminal-container">
    <div class="terminal-header">
      <div class="terminal-dot red"></div>
      <div class="terminal-dot yellow"></div>
      <div class="terminal-dot green"></div>
      <span class="terminal-title">{{ title }}</span>
    </div>
    <div class="terminal-body">
      <pre v-if="content && content.length > 0" class="terminal-content">{{ formattedContent }}</pre>
      <pre v-else class="terminal-content terminal-placeholder">{{ placeholder }}</pre>
    </div>
  </div>
</template>


<style lang="less" scoped>
.terminal-container {
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.terminal-header {
  background-color: #2d2d2d;
  height: 30px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  position: relative;
}

.terminal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.red {
  background-color: #ff5f56;
}

.yellow {
  background-color: #ffbd2e;
}

.green {
  background-color: #27c93f;
}

.terminal-title {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  color: #ccc;
  font-size: 12px;
}

.terminal-body {
  background-color: #1e1e1e;
  height: 200px;
  overflow-y: auto;
  padding: 15px;
}

.terminal-content {
  color: #ccc;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
}

.terminal-placeholder {
  color: #777;
  font-style: italic;
}
</style>