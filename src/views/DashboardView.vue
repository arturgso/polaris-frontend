<script setup lang="ts">
import DashboardCard from '../components/dashboard/DashboardCard.vue';
import { dashboardCardMock } from '../mocks/dashboardCards.mock';
</script>

<template>
  <div class="flex flex-col justify-center items-center h-full">
    <div class="w-full">
      <h1>Dashboard</h1>
      <div class="flex flex-row justify-between">
        <div
          v-for="item in dashboardCardMock"
          :key="item.id"
        >
          <DashboardCard :item="item" />
        </div>
      </div>
    </div>
  </div>
</template>