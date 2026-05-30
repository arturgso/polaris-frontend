<script setup lang="ts">
import { EllipsisVertical } from 'lucide-vue-next';
import type { ShoppingItem } from '../../types/ShoppingList';

defineProps<{
  item: ShoppingItem;
}>();

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatName(name: string) {
  return name.replaceAll('_', ' ').toLowerCase();
}

function badgeStyle(color: string) {
  return {
    backgroundColor: `${color}1A`,
    borderColor: color,
    color,
  };
}

function formatPrice(price: number) {
  return currencyFormatter.format(price);
}
</script>

<template>
  <div class="relative flex flex-col gap-6 rounded-md border-2 border-border bg-card p-4 transition duration-150 hover:border-accent">
    <button
      type="button"
      class="absolute right-2 top-3"
    >
      <EllipsisVertical :size="18" />            
    </button>

    <div class="flex flex-col gap-1">
      <a
        :href="item.link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <h1>{{ item.title }}</h1>
      </a>
      <div
        class="w-fit rounded-sm border px-2 py-1 text-[11px] font-semibold capitalize"
        :style="badgeStyle(item.category.color)"
      >
        {{ formatName(item.category.name) }}
      </div>
    </div>
    <div class="flex items-center justify-between">
      <div
        class="rounded-sm border px-2 py-1 text-[10px] font-semibold uppercase"
        :style="badgeStyle(item.status.color)"
      >
        {{ item.status.name }}
      </div>
      <span class="font-bold text-accent">{{ formatPrice(item.price) }}</span>
    </div>
  </div>
</template>
