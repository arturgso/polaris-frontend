<script setup lang="ts">
import { Flower2, Gift, LayoutDashboard, ShoppingCart } from 'lucide-vue-next';
import SidebarButton from './SidebarButton.vue';
import SidebarSection from './SidebarSection.vue';

defineProps<{
  isCollapsed: boolean;
}>();

const emit = defineEmits<{
  openModule: [module: 'shopping' | 'gifts'];
  openVault: [];
  navigate: [];
}>();
</script>

<template>
  <SidebarSection
    :enable-title="false"
    :is-sidebar-collapsed="isCollapsed"
  >
    <div :class="['flex flex-col', isCollapsed ? 'gap-2' : 'gap-1']">
      <SidebarButton
        :icon="LayoutDashboard"
        title="dashboard"
        :is-collapsed="isCollapsed"
        route-to="/"
        @click="emit('navigate')"
      />
      <button
        type="button"
        :class="[
          'interactive-nudge group flex min-h-8 items-center gap-2 rounded-md px-2 py-1 text-text-secondary hover:bg-card hover:text-text-primary',
          isCollapsed ? 'justify-center' : '',
        ]"
        @click="emit('openModule', 'shopping')"
      >
        <ShoppingCart
          :size="isCollapsed ? 20 : 16"
          class="shrink-0 group-hover:text-accent"
        />
        <span
          v-if="!isCollapsed"
          class="truncate text-sm capitalize"
        >compras</span>
      </button>
      <button
        type="button"
        :class="[
          'interactive-nudge group flex min-h-8 items-center gap-2 rounded-md px-2 py-1 text-text-secondary hover:bg-card hover:text-text-primary',
          isCollapsed ? 'justify-center' : '',
        ]"
        @click="emit('openModule', 'gifts')"
      >
        <Gift
          :size="isCollapsed ? 20 : 16"
          class="shrink-0 group-hover:text-accent"
        />
        <span
          v-if="!isCollapsed"
          class="truncate text-sm capitalize"
        >presentes</span>
      </button>
      <button
        type="button"
        :class="[
          'interactive-nudge group flex min-h-8 items-center gap-2 rounded-md px-2 py-1 text-text-secondary hover:bg-card hover:text-text-primary',
          isCollapsed ? 'justify-center' : '',
        ]"
        @click="emit('openVault')"
      >
        <Flower2
          :size="isCollapsed ? 20 : 16"
          class="shrink-0 group-hover:text-accent"
        />
        <span
          v-if="!isCollapsed"
          class="truncate text-sm capitalize"
        >Beatriz</span>
      </button>
    </div>
  </SidebarSection>
</template>
