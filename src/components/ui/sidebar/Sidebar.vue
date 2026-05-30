<script setup lang="ts">
import { Gift, LayoutDashboard, LogOut, ShoppingCart, Sidebar } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import SidebarButton from './SidebarButton.vue';
import SidebarSection from './SidebarSection.vue';
import Divider from './Divider.vue';
import { eventsButtons } from '../../../mocks/sidebarButtons.mock.ts';
import { getShoppingItemCategories } from '../../../services/shoppingItems';
import type { ShoppingItemCategory } from '../../../types/ShoppingList';

const persons: string[] = ["Beatriz", "Itallo", "Heloisa", "Mauricio", "Brenda", "Carlos"];

const isCollapsed = ref<boolean>(false);
const shoppingCategories = ref<ShoppingItemCategory[]>([]);
const isLoadingCategories = ref<boolean>(false);
const categoriesErrorMessage = ref<string>('');

const emit = defineEmits<{
  collapse: [value: boolean];
}>();

function collapseSidebar() {
  isCollapsed.value = !isCollapsed.value;

  emit('collapse', isCollapsed.value);
}

async function loadShoppingCategories() {
  isLoadingCategories.value = true;
  categoriesErrorMessage.value = '';

  try {
    shoppingCategories.value = await getShoppingItemCategories();
  } catch {
    categoriesErrorMessage.value = 'Nao foi possivel carregar categorias.';
  } finally {
    isLoadingCategories.value = false;
  }
}

onMounted(() => {
  void loadShoppingCategories();
});
</script>

<template>
  <aside
    :class="[
      'fixed flex h-full flex-col justify-between border-r-2 border-border bg-surface transition-all duration-150',
      isCollapsed ? 'w-14' : 'w-64'
    ]"
  >
    <div class="min-h-0 overflow-y-auto">
      <div class="relative p-3">
        <div class="flex items-center justify-between gap-2">
          <h1
            v-if="!isCollapsed"
            class="text-2xl font-bold text-text-secondary"
          >
            Polaris
          </h1>

          <button
            type="button"
            :class="[
              'rounded-md p-1 text-text-muted transition duration-150 hover:bg-card hover:text-accent',
              isCollapsed ? 'mx-auto' : ''
            ]"
            aria-label="Alternar sidebar"
            @click="collapseSidebar"
          >
            <Sidebar :size="20" />
          </button>
        </div>
      </div>

      <Divider :class="[isCollapsed ? 'hidden' : '']" />

      <SidebarSection
        :enable-title="false"
        :is-sidebar-collapsed="isCollapsed"
      >
        <div :class="['flex flex-col', isCollapsed ? 'gap-2' : 'gap-1']">
          <SidebarButton
            :icon="LayoutDashboard"
            title="dashboard"
            :is-collapsed="isCollapsed"
            route-to="/"
          />
          <SidebarButton
            :icon="ShoppingCart"
            title="compras"
            :is-collapsed="isCollapsed"
            route-to="/shopping-list"
          />
          <SidebarButton
            :icon="Gift"
            title="presentes"
            :is-collapsed="isCollapsed"
            route-to="/gifts"
          />
        </div>
      </SidebarSection>

      <Divider />

      <SidebarSection
        :enable-title="true"
        title="Compras"
        :is-sidebar-collapsed="isCollapsed"
      >
        <div :class="['flex flex-col', isCollapsed ? 'gap-2' : 'gap-1']">
          <div
            v-if="isLoadingCategories"
            :class="[
              'text-xs text-text-muted',
              isCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
            ]"
          >
            <span v-if="!isCollapsed">Carregando...</span>
          </div>
          <div
            v-else-if="categoriesErrorMessage"
            :class="[
              'text-xs text-text-muted',
              isCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
            ]"
          >
            <span v-if="!isCollapsed">{{ categoriesErrorMessage }}</span>
          </div>
          <div
            v-else-if="shoppingCategories.length === 0"
            :class="[
              'text-xs text-text-muted',
              isCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
            ]"
          >
            <span v-if="!isCollapsed">Nenhuma categoria</span>
          </div>
          <template v-else>
            <div
              v-for="category in shoppingCategories"
              :key="category.id"
            >
              <SidebarButton
                :title="category.name"
                :color="category.color"
                :is-collapsed="isCollapsed"
                :route-to="{ path: '/shopping-list', query: { categoryId: category.id } }"
              />
            </div>
          </template>
        </div>
      </SidebarSection>

      <Divider />

      <SidebarSection
        :enable-title="true"
        title="Pessoas"
        :is-sidebar-collapsed="isCollapsed"
      >
        <div :class="['flex flex-col', isCollapsed ? 'gap-2' : 'gap-1']">
          <div
            v-for="person in persons"
            :key="person"
          >
            <SidebarButton
              :use-random-color="true"
              :title="person"
              :is-collapsed="isCollapsed"
              :route-to="person"
            />
          </div>
        </div>
      </SidebarSection>

      <Divider />

      <SidebarSection
        :enable-title="true"
        title="Eventos"
        :is-sidebar-collapsed="isCollapsed"
      >
        <div :class="['flex flex-col', isCollapsed ? 'gap-2' : 'gap-1']">
          <div
            v-for="button in eventsButtons"
            :key="button.title"
          >
            <SidebarButton
              :icon="button.icon"
              :title="button.title"
              :is-collapsed="isCollapsed"
              :route-to="button.title"
            />
          </div>
        </div>
      </SidebarSection>
    </div>
    <footer>
      <Divider />
      <div :class="[isCollapsed ? 'p-1' : 'p-3']">
        <button
          type="button"
          :class="[isCollapsed ? 'mb-2 flex w-full items-center justify-center rounded-md p-1 hover:bg-card hover:text-accent' : 'flex w-full flex-row items-center gap-2 rounded-md px-2 py-1 hover:bg-card hover:text-accent']"
        >
          <LogOut :size="18" />
          <span v-if="!isCollapsed">Sair</span>
        </button>
      </div>
    </footer>
  </aside>
</template>
