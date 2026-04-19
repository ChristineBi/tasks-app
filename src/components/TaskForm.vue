<script lang="ts" setup>
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'add-task', payload: { title: string; dueDate: string }): void;
}>();

const title = ref('');
const dueDate = ref('');

function submit() {
  const trimmed = title.value.trim();
  if (!trimmed) return;
  emit('add-task', { title: trimmed, dueDate: dueDate.value });
  title.value = '';
  dueDate.value = '';
}
</script>

<template>
  <div class="form-row">
    <input
      v-model="title"
      type="text"
      placeholder="Add a task…"
      @keydown.enter="submit"
    />
    <input v-model="dueDate" type="date" class="date-input" />
    <button @click="submit">Add</button>
  </div>
</template>

<style scoped>
.form-row {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
}
.form-row input[type='text'] {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  border: 0.5px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
}
.date-input {
  width: 140px;
  height: 36px;
  padding: 0 8px;
  border: 0.5px solid #ccc;
  border-radius: 8px;
  font-size: 13px;
}
.form-row button {
  height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  background: #111;
  color: white;
  font-size: 13px;
  cursor: pointer;
}
</style>
