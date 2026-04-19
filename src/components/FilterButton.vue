<script lang="ts" setup>
import type { TaskFilter } from '../types.ts';

const props = defineProps<{
  currentFilter: TaskFilter;
  filter: TaskFilter;
}>();
defineEmits<{ (e: 'set-filter', value: TaskFilter): void }>();

const labels: Record<TaskFilter, string> = {
  all: 'All',
  todo: 'Todo',
  done: 'Done',
  high: 'High priority',
};
</script>

<template>
  <button
    class="filter-btn"
    :class="{ active: currentFilter === filter }"
    @click="$emit('set-filter', filter)"
  >
    {{ labels[filter] }}
  </button>
</template>

<style scoped>
.filter-btn {
  height: 28px;
  padding: 0 12px;
  border: 0.5px solid #ddd;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  background: transparent;
  color: #888;
}
.filter-btn.active {
  background: #111;
  color: white;
  border-color: transparent;
}
</style>
