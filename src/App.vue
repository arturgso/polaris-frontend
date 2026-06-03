<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css';
import { Layout } from '@/components';
import { useThemeSettings } from '@/composables';

const route = useRoute();
const { resolvedTheme } = useThemeSettings();
const isLoginRoute = computed(() => route.path === '/login');
const toastTheme = computed(() => (resolvedTheme.value === 'light' ? 'light' : 'dark'));
</script>

<template>
  <router-view v-if="isLoginRoute" />
  <Layout v-else>
    <router-view />
  </Layout>
  <Toaster
    close-button
    position="top-right"
    :duration="3500"
    :theme="toastTheme"
  />
</template>
