<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from './ui/sidebar/Sidebar.vue';

const isSidebarCollapsed = ref<boolean>(false);

function handleSidebarCollapse(value: boolean) {
  isSidebarCollapsed.value = value;
}

</script>

<template>
  <main class="min-h-dvh bg-bg">
    <Sidebar @collapse="handleSidebarCollapse" />
    <div
      class="min-h-dvh px-6 py-8 transition-all sm:px-8 lg:px-10 xl:px-12"
      :class="isSidebarCollapsed ? 'ml-16' : 'ml-72'"
    >
      <div class="mx-auto w-full max-w-7xl">
        <slot />
      </div>
    </div>
  </main>
</template>
