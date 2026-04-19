<script lang="ts" setup>
import type { Task } from '../types.ts';
import TaskItem from './TaskItem.vue';

defineProps<{ tasks: Task[] }>();
defineEmits<{
  (e: 'toggle-done', id: string): void;
  (e: 'remove-task', id: string): void;
}>();
</script>

<template>
  <ul class="task-list">
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      @toggle-done="$emit('toggle-done', $event)"
      @remove-task="$emit('remove-task', $event)"
    />
  </ul>
</template>

<style scoped>
.task-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
