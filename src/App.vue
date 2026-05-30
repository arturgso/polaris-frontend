<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Layout } from '@/components';

const route = useRoute();
const isLoginRoute = computed(() => route.path === '/login');
</script>

<template>
  <router-view v-if="isLoginRoute" />
  <Layout v-else>
    <router-view />
  </Layout>
</template>
