<script setup lang="ts">
import { Calendar, Dot, Link, Pen, Pin, Trash, User } from 'lucide-vue-next';
import type { Gift } from '../../types/Gifts';
import GiftCardInfo from './GiftCardInfo.vue';

const props = defineProps<{
    gift: Gift
}>()

</script>

<template>
    <div class="bg-card border border-border p-2 rounded-md flex flex-col gap-2 relative">

        <div class="flex flex-row gap-4 absolute right-3 top-3">
            <Pen size="20"/>
            <Trash size="20"/>
        </div>

        <div class="flex items-center mb-4">
            <h1 class="text-xl  font-bold">{{ gift.title }}</h1>
            <Dot />
            <a :href="gift.link" target="_blank" rel="noopener noreferrer">
                <Link  class="cursor-pointer hover:text-accent-hover" size="20" />
            </a>
        </div>

        <div>
            <GiftCardInfo title="para" :info="gift.giftFor" :icon="User" />

            <div class="border-2 border-border my-2 rounded-full border-dashed" />

            <GiftCardInfo title="evento" :info="gift.event" :icon="Calendar" />

            <div class="border-2 border-border my-2 rounded-full border-dashed" />

            <GiftCardInfo title="status" :info="gift.status" :icon="Pin" />
        </div>
    </div>
</template>

