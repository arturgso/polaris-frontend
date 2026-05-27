<script setup lang="ts">
import type { LucideProps } from 'lucide-vue-next';
import type { FunctionalComponent } from 'vue';


defineProps<{
    title: string
    icon: FunctionalComponent<LucideProps> 
    info: string
}>()

</script>

<template>
    <div class="flex flex-row items-center gap-2">
        <div class="flex flex-row-reverse gap-1 items-center">
        <span class="uppercase font-bold">{{ title }}:</span>
        <icon size="20"/>
        </div>
        <p>{{ info }}</p>
    </div>
</template>