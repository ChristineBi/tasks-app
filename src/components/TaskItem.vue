<script lang="ts" setup>
import type { Task } from '../types.ts';

const props = defineProps<{ task: Task }>();
defineEmits<{
  (e: 'toggle-done', id: string): void;
  (e: 'remove-task', id: string): void;
}>();

function formatMinutes(m: number | null) {
  if (!m) return null;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h > 0 ? `~${h}h${min > 0 ? ` ${min}m` : ''}` : `~${min}m`;
}

function isOverdue(dueDate?: string) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function formatDue(dueDate?: string) {
  if (!dueDate) return null;
  return new Date(dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
</script>

<template>
  <li class="task" :class="{ done: task.done }">
    <div class="task-top">
      <button
        class="check"
        :class="{ checked: task.done }"
        @click="$emit('toggle-done', task.id)"
        aria-label="toggle done"
      />
      <div class="task-body">
        <span class="task-title" :class="{ done: task.done }">{{
          task.title
        }}</span>
        <div class="meta">
          <span
            v-if="task.priority"
            class="badge"
            :class="`badge-${task.priority}`"
          >
            {{ task.priority.charAt(0).toUpperCase() + task.priority.slice(1) }}
          </span>
          <span v-if="task.estimatedMinutes" class="badge badge-time">
            {{ formatMinutes(task.estimatedMinutes) }}
          </span>
          <span
            v-if="task.dueDate"
            class="badge badge-due"
            :class="{ overdue: isOverdue(task.dueDate) }"
          >
            Due {{ formatDue(task.dueDate) }}
          </span>
        </div>
      </div>
      <button class="remove-btn" @click="$emit('remove-task', task.id)">
        ✕
      </button>
    </div>
  </li>
</template>

<style scoped>
.task {
  background: white;
  border: 0.5px solid #e8e8e8;
  border-radius: 10px;
  padding: 0.875rem 1rem;
  transition: opacity 0.2s;
}
.task.done {
  opacity: 0.45;
}
.task-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.check {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 2px;
  border: 0.5px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
.check.checked {
  background: #111;
  border-color: #111;
}
.check.checked::after {
  content: '';
  display: block;
  width: 8px;
  height: 8px;
  background: white;
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
}
.task-body {
  flex: 1;
  min-width: 0;
}
.task-title {
  font-size: 14px;
  font-weight: 500;
}
.task-title.done {
  text-decoration: line-through;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}
.badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 7px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}
.badge-high {
  background: #faece7;
  color: #993c1d;
}
.badge-medium {
  background: #faeeda;
  color: #854f0b;
}
.badge-low {
  background: #eaf3de;
  color: #3b6d11;
}
.badge-time {
  background: #f0f0f0;
  color: #666;
}
.badge-due {
  background: #f0f0f0;
  color: #666;
}
.badge-due.overdue {
  background: #fcebeb;
  color: #a32d2d;
}
.remove-btn {
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
  font-size: 13px;
  padding: 4px;
  border-radius: 6px;
  line-height: 1;
}
.remove-btn:hover {
  background: #f5f5f3;
  color: #666;
}
</style>
