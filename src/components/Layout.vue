<script setup lang="ts">
import Sidebar from './ui/sidebar/Sidebar.vue';

</script>

<template>
    <main>
        <Sidebar />
        <div class="container mx-auto p-4">
            <slot />
        </div>
    </main>
</template>