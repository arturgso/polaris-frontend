<script setup lang="ts">
import { Calendar, ExternalLink, Gift as GiftIcon, Pen, Pin, Trash2, User } from 'lucide-vue-next';
import type { GiftWithPersonId } from '@/types';
import GiftCardInfo from './GiftCardInfo.vue';

defineProps<{
  gift: GiftWithPersonId;
}>();

const emit = defineEmits<{
  edit: [gift: GiftWithPersonId];
  delete: [gift: GiftWithPersonId];
}>();
</script>

<template>
  <article class="relative flex min-h-48 flex-col gap-4 rounded-md border-2 border-border bg-card p-4 transition duration-150 hover:border-accent">
    <div class="flex items-start justify-between gap-3">
      <div class="flex min-w-0 items-center gap-2">
        <GiftIcon
          :size="18"
          class="shrink-0 text-accent"
        />
        <h3 class="truncate text-lg font-bold text-text-primary">
          {{ gift.title }}
        </h3>
      </div>

      <div class="flex shrink-0 items-center gap-1">
        <a
          v-if="gift.link"
          :href="gift.link"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-surface hover:text-accent"
          aria-label="Abrir link do presente"
        >
          <ExternalLink :size="18" />
        </a>
        <button
          type="button"
          class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-surface hover:text-text-primary"
          aria-label="Editar presente"
          @click="emit('edit', gift)"
        >
          <Pen :size="18" />
        </button>
        <button
          type="button"
          class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-surface hover:text-text-primary"
          aria-label="Deletar presente"
          @click="emit('delete', gift)"
        >
          <Trash2 :size="18" />
        </button>
      </div>
    </div>

    <a
      v-if="gift.link"
      :href="gift.link"
      target="_blank"
      rel="noopener noreferrer"
      class="truncate text-sm text-text-muted transition duration-150 hover:text-accent"
    >
      {{ gift.link }}
    </a>

    <div class="flex flex-col gap-3 text-sm text-text-secondary">
      <GiftCardInfo
        title="para"
        :info="gift.giftFor"
        :icon="User"
      />
      <GiftCardInfo
        title="evento"
        :info="gift.event || 'Nao informado'"
        :icon="Calendar"
      />
      <GiftCardInfo
        title="status"
        :info="gift.status || 'Nao informado'"
        :icon="Pin"
      />
    </div>
  </article>
</template>
