<script setup lang="ts">
import { Brush, Cake, CircleQuestionMark, Cpu, Gift, Heart, LayoutDashboard, LogOut, Package, ShoppingCart, TreePine, type LucideProps } from 'lucide-vue-next';
import type { FunctionalComponent } from 'vue';
import SidebarButton from './SidebarButton.vue';
import SidebarSection from './SidebarSection.vue';
import Divider from './Divider.vue';

interface shoppingButtonsProps {
    icon: FunctionalComponent<LucideProps>
    title: string
}

const shoppingButtons: shoppingButtonsProps[] = [
    {
        icon: Cpu,
        title: "tech"
    },
    {
        icon: Heart,
        title: "saúde"
    },
    {
        icon: Brush,
        title: "maquiagem"
    },
    {
        icon: Package,
        title: "outros"
    },
]

const eventsButtons: shoppingButtonsProps[] = [
    {
        icon: TreePine,
        title: "natal"
    },
    {
        icon: Cake,
        title: "Aniversário"
    },
    {
        icon: CircleQuestionMark,
        title: "não especificado"
    },
]

const persons: string[] = ["Beatriz", "Itallo", "Heloisa", "Mauricio", "Brenda", "Carlos"]
</script>

<template>
    <aside class="bg-surface w-64 fixed h-full border-r-2 border-border flex flex-col justify-between">
        <div>
            <div class="p-3">
                <h1 class="text-2xl font-bold text-text-secondary">Polaris</h1>
            </div>

            <Divider />

            <SidebarSection :enable-title="false">
                <div>
                    <SidebarButton :icon="LayoutDashboard" title="dashboard" />
                    <SidebarButton :icon="ShoppingCart" title="compras" />
                    <SidebarButton :icon="Gift" title="presentes" />
                </div>
            </SidebarSection>

            <Divider />

            <SidebarSection :enable-title="true" title="Compras">
                <div class="flex flex-col gap-1">
                    <div v-for="button in shoppingButtons">
                        <SidebarButton :icon="button.icon" :title="button.title" />
                    </div>
                </div>
            </SidebarSection>

            <Divider />

            <SidebarSection :enable-title="true" title="Pessoas">
                <div class="flex flex-col gap-1">
                    <div v-for="person in persons">
                        <SidebarButton :use-random-color="true" :title="person" />
                    </div>
                </div>
            </SidebarSection>

            <Divider />

            <SidebarSection :enable-title="true" title="Eventos">
                <div class="flex flex-col gap-1">
                    <div v-for="button in eventsButtons">
                        <SidebarButton :icon="button.icon" :title="button.title" />
                    </div>
                </div>
            </SidebarSection>


        </div>
        <footer>
            <Divider />
            <div class="p-3">
                <button type="button"
                    class="flex flex-row gap-2 items-center hover:text-accent px-2 py-1 rounded-md hover:bg-accent-hover/30 w-full">
                    <LogOut size="18" />
                    <span>Sair</span>
                </button>

            </div>
        </footer>
    </aside>
</template>