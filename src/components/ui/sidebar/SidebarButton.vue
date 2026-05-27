<script setup lang="ts">
import type { LucideProps } from 'lucide-vue-next';
import type { FunctionalComponent } from 'vue';
import { useRoute } from 'vue-router';

defineProps<{
    icon?: FunctionalComponent<LucideProps>;
    title: string;
    useRandomColor?: boolean;
    isCollapsed: boolean;
    routeTo: string;
}>();

const route = useRoute();

let lastHue = -1;

function generateRandomColor(): string {
    let hue = Math.floor(Math.random() * 360);

    if (lastHue !== -1 && Math.abs(hue - lastHue) < 30) {
        hue = (hue + 60) % 360;
    }

    lastHue = hue;

    const saturation = 70 + Math.random() * 30;
    const lightness = 45 + Math.random() * 70;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;

}
</script>

<template>
  <router-link
    :to="routeTo"
    class="group flex items-center gap-2 capitalize text-text-secondary cursor-pointer px-2 py-1 hover:bg-card rounded-md"
    :class="routeTo === route.path ? 'bg-accent text-black font-bold hover:bg-accent-hover' : ''"
  >
    <div
      v-if="useRandomColor"
      :style="{ backgroundColor: generateRandomColor() }"
      class="w-3 h-3 rounded-sm"
    />
    <div
      v-else
      class="group-hover:text-accent"
    >
      <icon :size="isCollapsed ? '20' : '16'" />
    </div>
    <span
      v-if="!isCollapsed"
      class="text-sm"
    >{{ title }}</span>
  </router-link>
</template>
