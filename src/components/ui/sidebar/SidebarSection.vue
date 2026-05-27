<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next';


defineProps<{
    enableTitle: boolean;
    title?: string;
}>();
</script>

<template>
        <div class="flex flex-col p-3 gap-2">
            <div v-if="enableTitle" class="flex justify-between gap-2 uppercase font-bold text-sm text-text-muted items-center">
                <span>{{ title }}</span>
                <ChevronDown size="18" />
            </div>
            <slot />
           <div>
            </div>
        </div>

</template>