<script setup lang="ts">
import { Check, Filter, Plus, Search, Trash2, X } from 'lucide-vue-next';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ShoppingItemCard from '../components/shoppingList/ShoppingItemCard.vue';
import BaseModal from '../components/ui/BaseModal.vue';
import {
  createShoppingItem,
  deleteShoppingItem,
  getShoppingItemCategories,
  getShoppingItems,
  getShoppingItemStatuses,
  updateShoppingItem,
} from '../services/shoppingItems';
import type { ShoppingItem, ShoppingItemCategory, ShoppingItemStatus } from '../types/ShoppingList';

interface ShoppingItemForm {
  title: string;
  link: string;
  price: number;
  categoryId: number;
  statusId: number;
}

const shoppingItems = ref<ShoppingItem[]>([]);
const categories = ref<ShoppingItemCategory[]>([]);
const statuses = ref<ShoppingItemStatus[]>([]);
const route = useRoute();
const isLoading = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const errorMessage = ref<string>('');
const modalErrorMessage = ref<string>('');
const isAddModalOpen = ref<boolean>(false);
const itemToEdit = ref<ShoppingItem | null>(null);
const itemToDelete = ref<ShoppingItem | null>(null);
const isDeleting = ref<boolean>(false);
const searchTerm = ref<string>('');
const selectedCategoryIds = ref<number[]>([]);
const selectedStatusIds = ref<number[]>([]);
const isCategoryFilterOpen = ref<boolean>(false);
const isStatusFilterOpen = ref<boolean>(false);
const categoryFilterRef = ref<HTMLElement | null>(null);
const statusFilterRef = ref<HTMLElement | null>(null);
const emptyForm: ShoppingItemForm = {
  title: '',
  link: '',
  price: 0,
  categoryId: 0,
  statusId: 0,
};
const itemForm = ref<ShoppingItemForm>({ ...emptyForm });

const filteredShoppingItems = computed(() => {
  const normalizedSearch = searchTerm.value.trim().toLowerCase();

  return shoppingItems.value.filter((item) => {
    const matchesSearch = normalizedSearch.length === 0
      || item.title.toLowerCase().includes(normalizedSearch)
      || item.link.toLowerCase().includes(normalizedSearch)
      || item.category.name.toLowerCase().includes(normalizedSearch)
      || item.status.name.toLowerCase().includes(normalizedSearch);
    const matchesCategory = selectedCategoryIds.value.length === 0
      || selectedCategoryIds.value.includes(item.category.id);
    const matchesStatus = selectedStatusIds.value.length === 0
      || selectedStatusIds.value.includes(item.status.id);

    return matchesSearch && matchesCategory && matchesStatus;
  });
});

const activeFilterCount = computed(() => selectedCategoryIds.value.length + selectedStatusIds.value.length);

function getSelectedCategoryId() {
  const categoryId = route.query.categoryId;
  const normalizedCategoryId = Array.isArray(categoryId) ? categoryId[0] : categoryId;
  const parsedCategoryId = Number(normalizedCategoryId);

  return Number.isFinite(parsedCategoryId) && parsedCategoryId > 0 ? parsedCategoryId : undefined;
}

async function loadShoppingItems() {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    shoppingItems.value = await getShoppingItems();
  } catch {
    errorMessage.value = 'Nao foi possivel carregar a lista de compras.';
  } finally {
    isLoading.value = false;
  }
}

function toggleFilter(filterValues: number[], value: number) {
  const currentIndex = filterValues.indexOf(value);

  if (currentIndex >= 0) {
    filterValues.splice(currentIndex, 1);
    return;
  }

  filterValues.push(value);
}

function toggleCategoryFilter(categoryId: number) {
  toggleFilter(selectedCategoryIds.value, categoryId);
}

function toggleStatusFilter(statusId: number) {
  toggleFilter(selectedStatusIds.value, statusId);
}

function clearFilters() {
  selectedCategoryIds.value = [];
  selectedStatusIds.value = [];
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target;

  if (!(target instanceof Node)) {
    return;
  }

  if (categoryFilterRef.value && !categoryFilterRef.value.contains(target)) {
    isCategoryFilterOpen.value = false;
  }

  if (statusFilterRef.value && !statusFilterRef.value.contains(target)) {
    isStatusFilterOpen.value = false;
  }
}

async function loadShoppingItemOptions() {
  const [loadedCategories, loadedStatuses] = await Promise.all([
    getShoppingItemCategories(),
    getShoppingItemStatuses(),
  ]);

  categories.value = loadedCategories;
  statuses.value = loadedStatuses;
}

function resetForm() {
  itemForm.value = {
    ...emptyForm,
    categoryId: categories.value[0]?.id ?? 0,
    statusId: statuses.value[0]?.id ?? 0,
  };
  modalErrorMessage.value = '';
}

function openAddModal() {
  resetForm();
  isAddModalOpen.value = true;
}

function openEditModal(item: ShoppingItem) {
  itemForm.value = {
    title: item.title,
    link: item.link,
    price: item.price,
    categoryId: item.category.id,
    statusId: item.status.id,
  };
  modalErrorMessage.value = '';
  itemToEdit.value = item;
}

function openDeleteModal(item: ShoppingItem) {
  modalErrorMessage.value = '';
  itemToDelete.value = item;
}

async function submitNewItem() {
  isSaving.value = true;
  modalErrorMessage.value = '';

  try {
    await createShoppingItem(itemForm.value);
    isAddModalOpen.value = false;
    await loadShoppingItems();
  } catch {
    modalErrorMessage.value = 'Nao foi possivel salvar o item.';
  } finally {
    isSaving.value = false;
  }
}

async function submitEditedItem() {
  if (!itemToEdit.value) {
    return;
  }

  isSaving.value = true;
  modalErrorMessage.value = '';

  try {
    await updateShoppingItem(itemToEdit.value.id, itemForm.value);
    itemToEdit.value = null;
    await loadShoppingItems();
  } catch {
    modalErrorMessage.value = 'Nao foi possivel atualizar o item.';
  } finally {
    isSaving.value = false;
  }
}

async function confirmDeleteItem() {
  if (!itemToDelete.value) {
    return;
  }

  isDeleting.value = true;

  try {
    await deleteShoppingItem(itemToDelete.value.id);
    itemToDelete.value = null;
    await loadShoppingItems();
  } catch {
    modalErrorMessage.value = 'Nao foi possivel deletar o item.';
  } finally {
    isDeleting.value = false;
  }
}

onMounted(() => {
  const categoryId = getSelectedCategoryId();

  if (categoryId) {
    selectedCategoryIds.value = [categoryId];
  }

  void loadShoppingItems();
  void loadShoppingItemOptions();
  document.addEventListener('click', handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
});

watch(
  () => route.query.categoryId,
  () => {
    const categoryId = getSelectedCategoryId();
    selectedCategoryIds.value = categoryId ? [categoryId] : [];
  },
);
</script>

<template>
  <div class="mt-8 flex h-full flex-col items-center">
    <div class="flex w-full flex-col gap-6">
      <div class="flex items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-text-secondary">
          Lista de compras
        </h1>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <label class="relative w-64">
            <Search
              :size="16"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Pesquisar"
              class="h-10 w-full rounded-md border-2 border-border bg-card pl-9 pr-3 text-sm text-text-primary outline-none transition duration-150 placeholder:text-text-muted focus:border-accent"
            >
          </label>

          <div
            ref="categoryFilterRef"
            class="relative"
          >
            <button
              type="button"
              class="flex h-10 items-center gap-2 rounded-md border-2 border-border bg-card px-3 text-sm font-semibold text-text-secondary transition duration-150 hover:border-accent hover:text-text-primary"
              :class="selectedCategoryIds.length > 0 ? 'border-accent text-text-primary' : ''"
              @click="isCategoryFilterOpen = !isCategoryFilterOpen"
            >
              <Filter :size="16" />
              Categorias
              <span
                v-if="selectedCategoryIds.length > 0"
                class="rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-bold text-bg"
              >
                {{ selectedCategoryIds.length }}
              </span>
            </button>

            <div
              v-if="isCategoryFilterOpen"
              class="absolute right-0 top-12 z-20 flex w-48 flex-col gap-1 rounded-md border-2 border-border bg-surface p-2 shadow-xl"
            >
              <button
                v-for="category in categories"
                :key="category.id"
                type="button"
                class="flex items-center justify-between gap-2 rounded-sm px-2 py-2 text-left text-sm text-text-secondary transition duration-150 hover:bg-card hover:text-text-primary"
                :class="selectedCategoryIds.includes(category.id) ? 'bg-card text-text-primary' : ''"
                @click="toggleCategoryFilter(category.id)"
              >
                <span class="flex items-center gap-2">
                  <span
                    class="h-3 w-3 rounded-sm"
                    :style="{ backgroundColor: category.color }"
                  />
                  {{ category.name }}
                </span>
                <Check
                  v-if="selectedCategoryIds.includes(category.id)"
                  :size="14"
                />
              </button>
            </div>
          </div>

          <div
            ref="statusFilterRef"
            class="relative"
          >
            <button
              type="button"
              class="flex h-10 items-center gap-2 rounded-md border-2 border-border bg-card px-3 text-sm font-semibold text-text-secondary transition duration-150 hover:border-accent hover:text-text-primary"
              :class="selectedStatusIds.length > 0 ? 'border-accent text-text-primary' : ''"
              @click="isStatusFilterOpen = !isStatusFilterOpen"
            >
              <Filter :size="16" />
              Status
              <span
                v-if="selectedStatusIds.length > 0"
                class="rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-bold text-bg"
              >
                {{ selectedStatusIds.length }}
              </span>
            </button>

            <div
              v-if="isStatusFilterOpen"
              class="absolute right-0 top-12 z-20 flex w-48 flex-col gap-1 rounded-md border-2 border-border bg-surface p-2 shadow-xl"
            >
              <button
                v-for="status in statuses"
                :key="status.id"
                type="button"
                class="flex items-center justify-between gap-2 rounded-sm px-2 py-2 text-left text-sm text-text-secondary transition duration-150 hover:bg-card hover:text-text-primary"
                :class="selectedStatusIds.includes(status.id) ? 'bg-card text-text-primary' : ''"
                @click="toggleStatusFilter(status.id)"
              >
                <span class="flex items-center gap-2">
                  <span
                    class="h-3 w-3 rounded-sm"
                    :style="{ backgroundColor: status.color }"
                  />
                  {{ status.name }}
                </span>
                <Check
                  v-if="selectedStatusIds.includes(status.id)"
                  :size="14"
                />
              </button>
            </div>
          </div>

          <button
            v-if="activeFilterCount > 0"
            type="button"
            class="flex h-10 items-center gap-2 rounded-md border-2 border-border px-3 text-sm font-semibold text-text-secondary transition duration-150 hover:border-accent hover:text-text-primary"
            @click="clearFilters"
          >
            <X :size="16" />
            Limpar
          </button>

          <button
            type="button"
            class="flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-bg transition duration-150 hover:bg-accent-hover"
            @click="openAddModal"
          >
            <Plus :size="18" />
            Novo item
          </button>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="w-full rounded-md border-2 border-border bg-card p-6 text-sm text-text-secondary"
      >
        Carregando lista de compras...
      </div>

      <div
        v-else-if="errorMessage"
        class="flex w-full items-center justify-between gap-4 rounded-md border-2 border-border bg-card p-6"
      >
        <p class="text-sm text-text-secondary">
          {{ errorMessage }}
        </p>
        <button
          type="button"
          class="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition duration-150 hover:bg-accent-hover"
          @click="loadShoppingItems"
        >
          Tentar novamente
        </button>
      </div>

      <div
        v-else-if="shoppingItems.length === 0"
        class="w-full rounded-md border-2 border-border bg-card p-6 text-sm text-text-secondary"
      >
        Nenhum item encontrado na lista de compras.
      </div>

      <div
        v-else-if="filteredShoppingItems.length === 0"
        class="w-full rounded-md border-2 border-border bg-card p-6 text-sm text-text-secondary"
      >
        Nenhum item encontrado para os filtros atuais.
      </div>

      <div
        v-else
        class="grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="item in filteredShoppingItems"
          :key="item.id"
        >
          <ShoppingItemCard
            :item="item"
            @edit="openEditModal"
            @delete="openDeleteModal"
          />
        </div>
      </div>
    </div>
  </div>

  <BaseModal
    :is-open="isAddModalOpen"
    title="Novo item"
    @close="isAddModalOpen = false"
  >
    <form
      class="flex flex-col gap-4"
      @submit.prevent="submitNewItem"
    >
      <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
        Titulo
        <input
          v-model="itemForm.title"
          type="text"
          required
          class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
        >
      </label>
      <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
        Link
        <input
          v-model="itemForm.link"
          type="url"
          required
          class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
        >
      </label>
      <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
        Valor
        <input
          v-model.number="itemForm.price"
          type="number"
          min="0"
          step="0.01"
          required
          class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
        >
      </label>
      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
          Categoria
          <select
            v-model.number="itemForm.categoryId"
            required
            class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
          >
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </label>
        <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
          Status
          <select
            v-model.number="itemForm.statusId"
            required
            class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
          >
            <option
              v-for="status in statuses"
              :key="status.id"
              :value="status.id"
            >
              {{ status.name }}
            </option>
          </select>
        </label>
      </div>
      <p
        v-if="modalErrorMessage"
        class="text-sm text-text-secondary"
      >
        {{ modalErrorMessage }}
      </p>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="rounded-md border-2 border-border px-4 py-2 text-sm font-semibold text-text-secondary transition duration-150 hover:border-accent hover:text-text-primary"
          :disabled="isSaving"
          @click="isAddModalOpen = false"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </BaseModal>

  <BaseModal
    :is-open="itemToEdit !== null"
    title="Editar item"
    @close="itemToEdit = null"
  >
    <form
      class="flex flex-col gap-4"
      @submit.prevent="submitEditedItem"
    >
      <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
        Titulo
        <input
          v-model="itemForm.title"
          type="text"
          required
          class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
        >
      </label>
      <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
        Link
        <input
          v-model="itemForm.link"
          type="url"
          required
          class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
        >
      </label>
      <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
        Valor
        <input
          v-model.number="itemForm.price"
          type="number"
          min="0"
          step="0.01"
          required
          class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
        >
      </label>
      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
          Categoria
          <select
            v-model.number="itemForm.categoryId"
            required
            class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
          >
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </label>
        <label class="flex flex-col gap-2 text-sm font-semibold text-text-secondary">
          Status
          <select
            v-model.number="itemForm.statusId"
            required
            class="rounded-md border-2 border-border bg-bg px-3 py-2 text-text-primary outline-none transition duration-150 focus:border-accent"
          >
            <option
              v-for="status in statuses"
              :key="status.id"
              :value="status.id"
            >
              {{ status.name }}
            </option>
          </select>
        </label>
      </div>
      <p
        v-if="modalErrorMessage"
        class="text-sm text-text-secondary"
      >
        {{ modalErrorMessage }}
      </p>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="rounded-md border-2 border-border px-4 py-2 text-sm font-semibold text-text-secondary transition duration-150 hover:border-accent hover:text-text-primary"
          :disabled="isSaving"
          @click="itemToEdit = null"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </BaseModal>

  <BaseModal
    :is-open="itemToDelete !== null"
    title="Deletar item"
    @close="itemToDelete = null"
  >
    <div class="flex flex-col gap-2">
      <p class="text-sm text-text-secondary">
        Tem certeza que deseja deletar este item?
      </p>
      <p class="font-semibold text-text-primary">
        {{ itemToDelete?.title }}
      </p>
      <p
        v-if="modalErrorMessage"
        class="text-sm text-text-secondary"
      >
        {{ modalErrorMessage }}
      </p>
    </div>

    <template #footer>
      <button
        type="button"
        class="rounded-md border-2 border-border px-4 py-2 text-sm font-semibold text-text-secondary transition duration-150 hover:border-accent hover:text-text-primary"
        :disabled="isDeleting"
        @click="itemToDelete = null"
      >
        Cancelar
      </button>
      <button
        type="button"
        class="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isDeleting"
        @click="confirmDeleteItem"
      >
        <Trash2 :size="16" />
        {{ isDeleting ? 'Deletando...' : 'Deletar' }}
      </button>
    </template>
  </BaseModal>
</template>
