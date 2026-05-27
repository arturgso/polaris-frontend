<script setup lang="ts">
import GiftCard from './components/Gifts/GiftCard.vue';
import Layout from './components/Layout.vue';
import { GiftsMock } from './mocks/gifts.mock';
import type { Gift } from './types/Gifts';

const mocks: Gift[] = GiftsMock;

</script>

<template>
  <Layout>
    <!-- <div class="flex flex-col w-full gap-3">
      <div v-for="gift in mocks" :key="gift.id">
        <GiftCard :gift="gift" />
      </div>
    </div> -->
  </Layout>
</template>
