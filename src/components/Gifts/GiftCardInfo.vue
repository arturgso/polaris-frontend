<script setup lang="ts">
import type { LucideProps } from 'lucide-vue-next';
import type { FunctionalComponent } from 'vue';


defineProps<{
  title: string;
  icon: FunctionalComponent<LucideProps>;
  info: string;
}>();
</script>

<template>
  <div class="flex min-w-0 flex-row items-center gap-2">
    <div class="flex shrink-0 flex-row-reverse items-center gap-1">
      <span class="text-xs font-bold uppercase text-text-muted">{{ title }}:</span>
      <icon
        :size="16"
        class="text-text-muted"
      />
    </div>
    <p class="truncate text-text-secondary">
      {{ info }}
    </p>
  </div>
</template>
