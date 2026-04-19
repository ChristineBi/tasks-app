<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import TaskForm from './components/TaskForm.vue';
import TaskList from './components/TaskList.vue';
import FilterButton from './components/FilterButton.vue';
import type { Task, TaskFilter } from './types.ts';
import { analyzeTask } from './api/analyzeTask.ts';

const tasks = ref<Task[]>(JSON.parse(localStorage.getItem('tasks') ?? '[]'));

watch(tasks, (v) => localStorage.setItem('tasks', JSON.stringify(v)), {
  deep: true,
});

const filter = ref<TaskFilter>('all');
const isAnalyzing = ref(false);
const analyzeError = ref('');

const totalDone = computed(() =>
  tasks.value.reduce((n, t) => (t.done ? n + 1 : n), 0),
);

const totalMinutes = computed(() =>
  tasks.value.reduce((n, t) => n + (t.estimatedMinutes ?? 0), 0),
);

const formatTime = (mins: number) => {
  if (mins === 0) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
};

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

const filteredTasks = computed(() => {
  switch (filter.value) {
    case 'done':
      return tasks.value.filter((t) => t.done);
    case 'todo':
      return tasks.value.filter((t) => !t.done);
    case 'high':
      return tasks.value.filter((t) => t.priority === 'high');
    default:
      return tasks.value;
  }
});

function addTask(payload: { title: string; dueDate: string }) {
  tasks.value.push({
    id: crypto.randomUUID(),
    title: payload.title,
    done: false,
    dueDate: payload.dueDate || undefined,
    priority: null,
    estimatedMinutes: null,
    aiAnalyzed: false,
  });
}

function toggleDone(id: string) {
  const t = tasks.value.find((t) => t.id === id);
  if (t) t.done = !t.done;
}

function removeTask(id: string) {
  const i = tasks.value.findIndex((t) => t.id === id);
  if (i !== -1) tasks.value.splice(i, 1);
}

function setFilter(v: TaskFilter) {
  filter.value = v;
}

async function runAnalysis() {
  const targets = tasks.value.filter((t) => !t.done);
  if (!targets.length) return;
  isAnalyzing.value = true;
  analyzeError.value = '';
  try {
    const results = await analyzeTask(
      targets.map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate })),
    );
    tasks.value = tasks.value.map((t) => {
      const r = results[t.id];
      if (!r) return t;
      return {
        ...t,
        priority: r.priority,
        estimatedMinutes: r.estimatedMinutes,
        aiAnalyzed: true,
      };
    });
    // sort: high → medium → low → done
    const order = { high: 0, medium: 1, low: 2, null: 3 };
    tasks.value.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return (
        (order[a.priority ?? 'null'] ?? 3) - (order[b.priority ?? 'null'] ?? 3)
      );
    });
  } catch {
    analyzeError.value = 'Analysis failed — check your API key.';
  } finally {
    isAnalyzing.value = false;
  }
}
</script>

<template>
  <main>
    <div class="header">
      <h1>Tasks</h1>
      <p class="date">{{ today }}</p>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-label">Total</div>
        <div class="stat-value">{{ tasks.length }}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Done</div>
        <div class="stat-value">{{ totalDone }}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Est. time</div>
        <div class="stat-value">{{ formatTime(totalMinutes) }}</div>
      </div>
    </div>

    <TaskForm @add-task="addTask" />

    <div class="filters">
      <FilterButton
        :currentFilter="filter"
        filter="all"
        @set-filter="setFilter"
      />
      <FilterButton
        :currentFilter="filter"
        filter="todo"
        @set-filter="setFilter"
      />
      <FilterButton
        :currentFilter="filter"
        filter="done"
        @set-filter="setFilter"
      />
      <FilterButton
        :currentFilter="filter"
        filter="high"
        @set-filter="setFilter"
      />
    </div>

    <div class="ai-bar">
      <span v-if="isAnalyzing" class="ai-status">Analyzing tasks…</span>
      <span v-else-if="analyzeError" class="ai-error">{{ analyzeError }}</span>
      <span v-else class="ai-status"
        >AI — analyze priority + time estimates</span
      >
      <button class="ai-btn" :disabled="isAnalyzing" @click="runAnalysis">
        {{ isAnalyzing ? '…' : 'Analyze ↗' }}
      </button>
    </div>

    <h3 v-if="!tasks.length" class="empty">Add a task to get started.</h3>
    <TaskList
      v-else
      :tasks="filteredTasks"
      @toggle-done="toggleDone"
      @remove-task="removeTask"
    />
  </main>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
main {
  max-width: 640px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  font-family: system-ui, sans-serif;
}
.header {
  margin-bottom: 1.25rem;
}
.header h1 {
  font-size: 20px;
  font-weight: 500;
}
.date {
  font-size: 13px;
  color: #888;
  margin-top: 2px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 1.25rem;
}
.stat {
  background: #f5f5f3;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}
.stat-label {
  font-size: 12px;
  color: #888;
}
.stat-value {
  font-size: 20px;
  font-weight: 500;
  margin-top: 2px;
}
.filters {
  display: flex;
  gap: 6px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.ai-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.875rem;
  background: #f5f5f3;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 0.5px solid #e0e0e0;
}
.ai-status {
  font-size: 13px;
  color: #888;
}
.ai-error {
  font-size: 13px;
  color: #c0392b;
}
.ai-btn {
  height: 28px;
  padding: 0 12px;
  border: 0.5px solid #ccc;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  background: white;
}
.ai-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.empty {
  font-size: 14px;
  color: #888;
  margin-top: 2rem;
  text-align: center;
}
</style>
