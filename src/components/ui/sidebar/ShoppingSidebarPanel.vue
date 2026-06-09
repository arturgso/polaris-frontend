<script setup lang="ts">
import { Pencil, ShoppingCart, Trash2 } from 'lucide-vue-next';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showErrorToast, showSuccessToast } from '../../../composables';
import {
  deleteShoppingList,
  getShoppingItemCategories,
  getShoppingLists,
  updateShoppingList,
} from '../../../services';
import type { ShoppingItemCategory, ShoppingList } from '../../../types';
import BaseButton from '../BaseButton.vue';
import BaseModal from '../BaseModal.vue';
import BaseTextField from '../BaseTextField.vue';
import Divider from './Divider.vue';
import SidebarButton from './SidebarButton.vue';
import SidebarSection from './SidebarSection.vue';

defineProps<{
  isCollapsed: boolean;
}>();

const emit = defineEmits<{
  navigate: [];
}>();

const route = useRoute();
const router = useRouter();
const lists = ref<ShoppingList[]>([]);
const categories = ref<ShoppingItemCategory[]>([]);
const listsError = ref('');
const categoriesError = ref('');
const isLoadingCategories = ref(false);
const listToEdit = ref<ShoppingList | null>(null);
const listToDelete = ref<ShoppingList | null>(null);
const isListModalOpen = ref(false);
const listTitle = ref('');
const isSaving = ref(false);
const isDeleting = ref(false);

async function loadLists() {
  listsError.value = '';

  try {
    lists.value = await getShoppingLists();
  } catch {
    listsError.value = 'Nao foi possivel carregar listas.';
  }
}

async function loadCategories() {
  isLoadingCategories.value = true;
  categoriesError.value = '';

  try {
    categories.value = await getShoppingItemCategories();
  } catch {
    categoriesError.value = 'Nao foi possivel carregar categorias.';
  } finally {
    isLoadingCategories.value = false;
  }
}

function openEditModal(list: ShoppingList) {
  listToEdit.value = list;
  listTitle.value = list.title;
  isListModalOpen.value = true;
}

function closeListModal() {
  isListModalOpen.value = false;
  listToEdit.value = null;
  listTitle.value = '';
}

async function submitList() {
  const title = listTitle.value.trim();

  if (!title || !listToEdit.value) {
    return;
  }

  isSaving.value = true;

  try {
    await updateShoppingList(listToEdit.value.id, { title });

    await loadLists();
    window.dispatchEvent(new Event('polaris:shopping-lists-changed'));
    closeListModal();
    showSuccessToast('Lista renomeada.');
  } catch {
    showErrorToast('Nao foi possivel salvar a lista.');
  } finally {
    isSaving.value = false;
  }
}

async function confirmDelete() {
  if (!listToDelete.value) {
    return;
  }

  const deletedId = listToDelete.value.id;
  isDeleting.value = true;

  try {
    await deleteShoppingList(deletedId);
    await loadLists();
    window.dispatchEvent(new Event('polaris:shopping-lists-changed'));

    if (route.query.listId === String(deletedId)) {
      void router.push('/shopping-list');
    }

    listToDelete.value = null;
    showSuccessToast('Lista excluida. Os itens foram preservados.');
  } catch {
    showErrorToast('Nao foi possivel excluir a lista.');
  } finally {
    isDeleting.value = false;
  }
}

onMounted(() => {
  void loadLists();
  void loadCategories();
  window.addEventListener('polaris:shopping-lists-changed', loadLists);
  window.addEventListener('polaris:shopping-categories-changed', loadCategories);
});

onUnmounted(() => {
  window.removeEventListener('polaris:shopping-lists-changed', loadLists);
  window.removeEventListener('polaris:shopping-categories-changed', loadCategories);
});
</script>

<template>
  <SidebarSection
    :enable-title="true"
    title="Listas"
    :is-sidebar-collapsed="isCollapsed"
  >
    <div :class="['flex flex-col', isCollapsed ? 'gap-2' : 'gap-1']">
      <SidebarButton
        :icon="ShoppingCart"
        title="todos"
        :is-collapsed="isCollapsed"
        route-to="/shopping-list"
        @click="emit('navigate')"
      />
      <SidebarButton
        title="sem lista"
        :use-random-color="true"
        :is-collapsed="isCollapsed"
        :route-to="{ path: '/shopping-list', query: { unlisted: 'true' } }"
        @click="emit('navigate')"
      />
      <p
        v-if="listsError && !isCollapsed"
        class="px-2 py-1 text-xs text-text-muted"
      >
        {{ listsError }}
      </p>
      <div
        v-for="list in lists"
        :key="list.id"
        class="group flex items-center gap-1"
      >
        <SidebarButton
          :title="list.title"
          :use-random-color="true"
          :is-collapsed="isCollapsed"
          :route-to="{ path: '/shopping-list', query: { listId: list.id } }"
          @click="emit('navigate')"
        />
        <template v-if="!isCollapsed">
          <button
            type="button"
            class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-card hover:text-text-primary"
            aria-label="Renomear lista"
            @click="openEditModal(list)"
          >
            <Pencil :size="14" />
          </button>
          <button
            type="button"
            class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-card hover:text-text-primary"
            aria-label="Excluir lista"
            @click="listToDelete = list"
          >
            <Trash2 :size="14" />
          </button>
        </template>
      </div>
    </div>
  </SidebarSection>

  <Divider />

  <SidebarSection
    :enable-title="true"
    title="Categorias"
    :is-sidebar-collapsed="isCollapsed"
  >
    <div :class="['flex flex-col', isCollapsed ? 'gap-2' : 'gap-1']">
      <div
        v-if="isLoadingCategories"
        :class="['text-xs text-text-muted', isCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1']"
      >
        <span v-if="!isCollapsed">Carregando...</span>
      </div>
      <p
        v-else-if="categoriesError && !isCollapsed"
        class="px-2 py-1 text-xs text-text-muted"
      >
        {{ categoriesError }}
      </p>
      <p
        v-else-if="categories.length === 0 && !isCollapsed"
        class="px-2 py-1 text-xs text-text-muted"
      >
        Nenhuma categoria
      </p>
      <SidebarButton
        v-for="category in categories"
        :key="category.id"
        :title="category.name"
        :color="category.color"
        :is-collapsed="isCollapsed"
        :route-to="{
          path: '/shopping-list',
          query: {
            ...(route.path === '/shopping-list' ? route.query : {}),
            tag: category.tag,
          },
        }"
        @click="emit('navigate')"
      />
    </div>
  </SidebarSection>

  <BaseModal
    :is-open="isListModalOpen"
    title="Renomear lista"
    @close="closeListModal"
  >
    <form
      class="flex flex-col gap-4"
      @submit.prevent="submitList"
    >
      <BaseTextField
        v-model="listTitle"
        label="Titulo"
        required
      />
      <div class="flex flex-wrap justify-end gap-2">
        <BaseButton
          variant="secondary"
          :disabled="isSaving"
          @click="closeListModal"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          type="submit"
          variant="primary"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Salvando...' : 'Salvar' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>

  <BaseModal
    :is-open="listToDelete !== null"
    title="Excluir lista"
    @close="listToDelete = null"
  >
    <div class="flex flex-col gap-4">
      <p class="text-sm text-text-secondary">
        A lista <strong class="text-text-primary">{{ listToDelete?.title }}</strong> sera excluida.
        Os itens serao preservados e ficarao disponiveis em Sem lista.
      </p>
      <label class="flex cursor-not-allowed items-start gap-3 rounded-md border-2 border-border bg-bg p-3 opacity-60">
        <input
          type="checkbox"
          disabled
          class="mt-0.5 size-4 accent-accent"
        >
        <span class="flex flex-col gap-1">
          <span class="text-sm font-semibold text-text-secondary">Excluir tambem os itens desta lista</span>
          <span class="text-xs text-text-muted">Em breve</span>
        </span>
      </label>
    </div>
    <template #footer>
      <BaseButton
        variant="secondary"
        :disabled="isDeleting"
        @click="listToDelete = null"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        variant="primary"
        :disabled="isDeleting"
        @click="confirmDelete"
      >
        <template #icon>
          <Trash2 :size="16" />
        </template>
        {{ isDeleting ? 'Excluindo...' : 'Excluir lista' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
