<script setup lang="ts">
import {
  ArrowLeft,
  Flower2,
  Gift,
  LayoutDashboard,
  LogOut,
  Pencil,
  Plus,
  Settings,
  ShoppingCart,
  Sidebar,
  Trash2,
} from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BEATRIZ_PERSON_ID } from '../../../constants';
import { showErrorToast, showSuccessToast } from '../../../composables';
import {
  clearAuthSession,
  createGiftList,
  createShoppingList,
  createVaultGiftList,
  deleteGiftList,
  deleteShoppingList,
  deleteVaultGiftList,
  getEvents,
  getGiftLists,
  getPersons,
  getShoppingItemCategories,
  getShoppingLists,
  getVaultGiftLists,
  hasVaultSession,
  lockVault,
  unlockVault,
  updateGiftList,
  updateShoppingList,
  updateVaultGiftList,
} from '../../../services';
import type {
  Event,
  GiftList,
  Person,
  ShoppingItemCategory,
  ShoppingList,
  VaultGiftList,
} from '../../../types';
import BaseButton from '../BaseButton.vue';
import BaseModal from '../BaseModal.vue';
import BaseTextField from '../BaseTextField.vue';
import { Divider, SidebarButton, SidebarSection } from './index';

const router = useRouter();
const route = useRoute();
const isCollapsed = ref<boolean>(false);
const shoppingCategories = ref<ShoppingItemCategory[]>([]);
const persons = ref<Person[]>([]);
const events = ref<Event[]>([]);
const giftLists = ref<GiftList[]>([]);
const shoppingLists = ref<ShoppingList[]>([]);
const vaultGiftLists = ref<VaultGiftList[]>([]);
const isLoadingCategories = ref<boolean>(false);
const isLoadingPersons = ref<boolean>(false);
const isLoadingEvents = ref<boolean>(false);
const categoriesErrorMessage = ref<string>('');
const personsErrorMessage = ref<string>('');
const eventsErrorMessage = ref<string>('');
const giftListsErrorMessage = ref<string>('');
const shoppingListsErrorMessage = ref<string>('');
const isVaultPasswordModalOpen = ref<boolean>(false);
const vaultPassword = ref<string>('');
const vaultPasswordErrorMessage = ref<string>('');
const isGiftListModalOpen = ref<boolean>(false);
const giftListToEdit = ref<VaultGiftList | null>(null);
const giftListName = ref<string>('');
const listModalKind = ref<'gift' | 'shopping' | null>(null);
const listToEdit = ref<GiftList | ShoppingList | null>(null);
const listToDelete = ref<GiftList | ShoppingList | null>(null);
const listTitle = ref<string>('');
const isSavingList = ref<boolean>(false);
const isDeletingList = ref<boolean>(false);

const props = withDefaults(defineProps<{
  isDrawer?: boolean;
  isDrawerOpen?: boolean;
}>(), {
  isDrawer: false,
  isDrawerOpen: false,
});

const emit = defineEmits<{
  collapse: [value: boolean];
  close: [];
}>();

const isContentCollapsed = computed(() => !props.isDrawer && isCollapsed.value);
const isVaultMode = computed(() => route.path === '/vault');
const visiblePersons = computed(() => persons.value.filter((person) => person.id !== BEATRIZ_PERSON_ID));

function collapseSidebar() {
  if (props.isDrawer) {
    emit('close');
    return;
  }

  isCollapsed.value = !isCollapsed.value;

  emit('collapse', isCollapsed.value);
}

function closeDrawerIfNeeded() {
  if (props.isDrawer) {
    emit('close');
  }
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

async function loadPersons() {
  isLoadingPersons.value = true;
  personsErrorMessage.value = '';

  try {
    persons.value = await getPersons();
  } catch {
    personsErrorMessage.value = 'Nao foi possivel carregar pessoas.';
  } finally {
    isLoadingPersons.value = false;
  }
}

function loadVaultGiftLists() {
  vaultGiftLists.value = getVaultGiftLists();
}

async function loadEvents() {
  isLoadingEvents.value = true;
  eventsErrorMessage.value = '';

  try {
    events.value = await getEvents();
  } catch {
    eventsErrorMessage.value = 'Nao foi possivel carregar eventos.';
  } finally {
    isLoadingEvents.value = false;
  }
}

async function loadGiftLists() {
  giftListsErrorMessage.value = '';

  try {
    giftLists.value = await getGiftLists();
  } catch {
    giftListsErrorMessage.value = 'Nao foi possivel carregar listas.';
  }
}

async function loadShoppingLists() {
  shoppingListsErrorMessage.value = '';

  try {
    shoppingLists.value = await getShoppingLists();
  } catch {
    shoppingListsErrorMessage.value = 'Nao foi possivel carregar listas.';
  }
}

function handleLogout() {
  clearAuthSession();
  lockVault();
  void router.push('/login');
}

function openVaultPasswordModal() {
  if (hasVaultSession()) {
    void router.push('/vault');
    closeDrawerIfNeeded();
    return;
  }

  vaultPassword.value = '';
  vaultPasswordErrorMessage.value = '';
  isVaultPasswordModalOpen.value = true;
}

function submitVaultPassword() {
  if (!unlockVault(vaultPassword.value)) {
    vaultPasswordErrorMessage.value = 'Senha invalida.';
    return;
  }

  isVaultPasswordModalOpen.value = false;
  vaultPassword.value = '';
  void router.push('/vault');
  closeDrawerIfNeeded();
}

function closeVaultPasswordModal() {
  isVaultPasswordModalOpen.value = false;
  vaultPassword.value = '';
  vaultPasswordErrorMessage.value = '';

  if (route.query.vault === 'unlock') {
    void router.replace({ path: '/', query: {} });
  }
}

function leaveVault() {
  lockVault();
  closeDrawerIfNeeded();
  void router.push('/');
}

function openCreateGiftListModal() {
  giftListToEdit.value = null;
  giftListName.value = '';
  isGiftListModalOpen.value = true;
}

function openEditGiftListModal(list: VaultGiftList) {
  giftListToEdit.value = list;
  giftListName.value = list.name;
  isGiftListModalOpen.value = true;
}

function closeGiftListModal() {
  isGiftListModalOpen.value = false;
  giftListToEdit.value = null;
  giftListName.value = '';
}

function submitGiftList() {
  const name = giftListName.value.trim();

  if (!name) {
    return;
  }

  if (giftListToEdit.value) {
    updateVaultGiftList(giftListToEdit.value.id, name);
  } else {
    createVaultGiftList(name);
  }

  loadVaultGiftLists();
  closeGiftListModal();
}

function removeGiftList(list: VaultGiftList) {
  deleteVaultGiftList(list.id);
  loadVaultGiftLists();

  if (route.query.listId === String(list.id)) {
    void router.push('/vault');
  }
}

function openCreateListModal(kind: 'gift' | 'shopping') {
  listModalKind.value = kind;
  listToEdit.value = null;
  listTitle.value = '';
}

function openEditListModal(kind: 'gift' | 'shopping', list: GiftList | ShoppingList) {
  listModalKind.value = kind;
  listToEdit.value = list;
  listTitle.value = list.title;
}

function closeListModal() {
  listModalKind.value = null;
  listToEdit.value = null;
  listTitle.value = '';
}

async function submitList() {
  const title = listTitle.value.trim();
  const kind = listModalKind.value;
  const isEditing = listToEdit.value !== null;

  if (!title || !kind) {
    return;
  }

  isSavingList.value = true;

  try {
    if (kind === 'gift') {
      if (listToEdit.value) {
        await updateGiftList(listToEdit.value.id, { title });
      } else {
        await createGiftList({ title });
      }

      await loadGiftLists();
      window.dispatchEvent(new Event('polaris:gift-lists-changed'));
    } else {
      if (listToEdit.value) {
        await updateShoppingList(listToEdit.value.id, { title });
      } else {
        await createShoppingList({ title });
      }

      await loadShoppingLists();
      window.dispatchEvent(new Event('polaris:shopping-lists-changed'));
    }

    closeListModal();
    showSuccessToast(isEditing ? 'Lista renomeada.' : 'Lista criada.');
  } catch {
    showErrorToast('Nao foi possivel salvar a lista.');
  } finally {
    isSavingList.value = false;
  }
}

function openDeleteListModal(kind: 'gift' | 'shopping', list: GiftList | ShoppingList) {
  listModalKind.value = kind;
  listToDelete.value = list;
}

function closeDeleteListModal() {
  listToDelete.value = null;
  listModalKind.value = null;
}

async function confirmDeleteList() {
  const list = listToDelete.value;
  const kind = listModalKind.value;

  if (!list || !kind) {
    return;
  }

  isDeletingList.value = true;

  try {
    if (kind === 'gift') {
      await deleteGiftList(list.id);
      await loadGiftLists();
      window.dispatchEvent(new Event('polaris:gift-lists-changed'));
    } else {
      await deleteShoppingList(list.id);
      await loadShoppingLists();
      window.dispatchEvent(new Event('polaris:shopping-lists-changed'));
    }

    if (route.query.listId === String(list.id)) {
      void router.push(kind === 'gift' ? '/gifts' : '/shopping-list');
    }

    closeDeleteListModal();
    showSuccessToast('Lista excluida. Os itens foram preservados.');
  } catch {
    showErrorToast('Nao foi possivel excluir a lista.');
  } finally {
    isDeletingList.value = false;
  }
}

onMounted(() => {
  void loadShoppingCategories();
  void loadPersons();
  void loadEvents();
  void loadGiftLists();
  void loadShoppingLists();
  loadVaultGiftLists();
  window.addEventListener('polaris:persons-changed', loadPersons);
  window.addEventListener('polaris:shopping-categories-changed', loadShoppingCategories);
  window.addEventListener('polaris:events-changed', loadEvents);
  window.addEventListener('polaris:vault-changed', loadVaultGiftLists);
  window.addEventListener('polaris:gift-lists-changed', loadGiftLists);
  window.addEventListener('polaris:shopping-lists-changed', loadShoppingLists);
});

onUnmounted(() => {
  window.removeEventListener('polaris:persons-changed', loadPersons);
  window.removeEventListener('polaris:shopping-categories-changed', loadShoppingCategories);
  window.removeEventListener('polaris:events-changed', loadEvents);
  window.removeEventListener('polaris:vault-changed', loadVaultGiftLists);
  window.removeEventListener('polaris:gift-lists-changed', loadGiftLists);
  window.removeEventListener('polaris:shopping-lists-changed', loadShoppingLists);
});

watch(() => route.query.vault, (value) => {
  if (value === 'unlock') {
    openVaultPasswordModal();
  }
}, { immediate: true });
</script>

<template>
  <aside
    :class="[
      'fixed left-0 top-0 z-50 flex h-dvh flex-col justify-between border-r-2 border-border bg-surface transition-all duration-150',
      isDrawer ? 'w-72 max-w-[calc(100vw-2rem)] shadow-2xl lg:hidden' : 'hidden lg:flex',
      isDrawer ? (isDrawerOpen ? 'translate-x-0' : '-translate-x-full') : '',
      !isDrawer ? (isCollapsed ? 'w-14' : 'w-64') : ''
    ]"
  >
    <div class="min-h-0 overflow-y-auto">
      <div class="relative p-3">
        <div class="flex items-center justify-between gap-2">
          <h1
            v-if="!isContentCollapsed"
            class="text-2xl font-bold text-text-secondary"
          >
            {{ isVaultMode ? 'Beatriz' : 'Polaris' }}
          </h1>

          <button
            v-if="isVaultMode"
            type="button"
            :class="[
              'interactive-nudge rounded-md p-1 text-text-muted hover:bg-card hover:text-accent',
              isContentCollapsed ? 'mx-auto' : ''
            ]"
            aria-label="Sair do cofre"
            @click="leaveVault"
          >
            <ArrowLeft :size="20" />
          </button>

          <button
            v-else
            type="button"
            :class="[
              'interactive-nudge rounded-md p-1 text-text-muted hover:bg-card hover:text-accent',
              isContentCollapsed ? 'mx-auto' : ''
            ]"
            aria-label="Alternar sidebar"
            @click="collapseSidebar"
          >
            <Sidebar :size="20" />
          </button>
        </div>
      </div>

      <Divider :class="[isContentCollapsed ? 'hidden' : '']" />

      <template v-if="isVaultMode">
        <SidebarSection
          :enable-title="false"
          :is-sidebar-collapsed="isContentCollapsed"
        >
          <div :class="['flex flex-col', isContentCollapsed ? 'gap-2' : 'gap-1']">
            <SidebarButton
              :icon="Flower2"
              title="todos"
              :is-collapsed="isContentCollapsed"
              route-to="/vault"
            />
          </div>
        </SidebarSection>

        <Divider />

        <SidebarSection
          :enable-title="true"
          title="Listas de presentes"
          :is-sidebar-collapsed="isContentCollapsed"
        >
          <div :class="['flex flex-col', isContentCollapsed ? 'gap-2' : 'gap-1']">
            <button
              type="button"
              :class="[isContentCollapsed ? 'interactive-nudge flex h-8 w-8 items-center justify-center rounded-md hover:bg-card hover:text-accent' : 'interactive-nudge flex min-h-8 items-center gap-2 rounded-md px-2 py-1 text-sm text-text-secondary hover:bg-card hover:text-text-primary']"
              aria-label="Nova lista"
              @click="openCreateGiftListModal"
            >
              <Plus :size="16" />
              <span v-if="!isContentCollapsed">Nova lista</span>
            </button>

            <div
              v-for="list in vaultGiftLists"
              :key="list.id"
              class="group flex items-center gap-1"
            >
              <SidebarButton
                :title="list.name"
                :use-random-color="true"
                :is-collapsed="isContentCollapsed"
                :route-to="{ path: '/vault', query: { listId: list.id } }"
              />
              <template v-if="!isContentCollapsed">
                <button
                  type="button"
                  class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-card hover:text-text-primary"
                  aria-label="Renomear lista"
                  @click="openEditGiftListModal(list)"
                >
                  <Pencil :size="14" />
                </button>
                <button
                  type="button"
                  class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-card hover:text-text-primary"
                  aria-label="Deletar lista"
                  @click="removeGiftList(list)"
                >
                  <Trash2 :size="14" />
                </button>
              </template>
            </div>
          </div>
        </SidebarSection>
      </template>

      <template v-else>
        <SidebarSection
          :enable-title="false"
          :is-sidebar-collapsed="isContentCollapsed"
        >
          <div :class="['flex flex-col', isContentCollapsed ? 'gap-2' : 'gap-1']">
            <SidebarButton
              :icon="LayoutDashboard"
              title="dashboard"
              :is-collapsed="isContentCollapsed"
              route-to="/"
            />
            <SidebarButton
              :icon="ShoppingCart"
              title="compras"
              :is-collapsed="isContentCollapsed"
              route-to="/shopping-list"
            />
            <SidebarButton
              :icon="Gift"
              title="presentes"
              :is-collapsed="isContentCollapsed"
              route-to="/gifts"
            />
            <button
              type="button"
              :class="[
                'interactive-nudge group flex min-h-8 items-center gap-2 rounded-md px-2 py-1 text-text-secondary hover:bg-card hover:text-text-primary',
                isContentCollapsed ? 'justify-center' : ''
              ]"
              @click="openVaultPasswordModal"
            >
              <div class="flex shrink-0 items-center group-hover:text-accent">
                <Flower2 :size="isContentCollapsed ? 20 : 16" />
              </div>
              <span
                v-if="!isContentCollapsed"
                class="truncate text-sm capitalize"
              >Beatriz</span>
            </button>
          </div>
        </SidebarSection>

        <Divider />

        <SidebarSection
          :enable-title="true"
          title="Listas de compras"
          :is-sidebar-collapsed="isContentCollapsed"
        >
          <div :class="['flex flex-col', isContentCollapsed ? 'gap-2' : 'gap-1']">
            <SidebarButton
              :icon="ShoppingCart"
              title="todos"
              :is-collapsed="isContentCollapsed"
              route-to="/shopping-list"
            />
            <SidebarButton
              title="sem lista"
              :use-random-color="true"
              :is-collapsed="isContentCollapsed"
              :route-to="{ path: '/shopping-list', query: { unlisted: 'true' } }"
            />
            <button
              type="button"
              :class="[isContentCollapsed ? 'interactive-nudge flex h-8 w-8 items-center justify-center rounded-md hover:bg-card hover:text-accent' : 'interactive-nudge flex min-h-8 items-center gap-2 rounded-md px-2 py-1 text-sm text-text-secondary hover:bg-card hover:text-text-primary']"
              aria-label="Nova lista de compras"
              @click="openCreateListModal('shopping')"
            >
              <Plus :size="16" />
              <span v-if="!isContentCollapsed">Nova lista</span>
            </button>
            <p
              v-if="shoppingListsErrorMessage && !isContentCollapsed"
              class="px-2 py-1 text-xs text-text-muted"
            >
              {{ shoppingListsErrorMessage }}
            </p>
            <div
              v-for="list in shoppingLists"
              :key="list.id"
              class="group flex items-center gap-1"
            >
              <SidebarButton
                :title="list.title"
                :use-random-color="true"
                :is-collapsed="isContentCollapsed"
                :route-to="{ path: '/shopping-list', query: { listId: list.id } }"
              />
              <template v-if="!isContentCollapsed">
                <button
                  type="button"
                  class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-card hover:text-text-primary"
                  aria-label="Renomear lista de compras"
                  @click="openEditListModal('shopping', list)"
                >
                  <Pencil :size="14" />
                </button>
                <button
                  type="button"
                  class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-card hover:text-text-primary"
                  aria-label="Excluir lista de compras"
                  @click="openDeleteListModal('shopping', list)"
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
          title="Compras"
          :is-sidebar-collapsed="isContentCollapsed"
        >
          <div :class="['flex flex-col', isContentCollapsed ? 'gap-2' : 'gap-1']">
            <div
              v-if="isLoadingCategories"
              :class="[
                'text-xs text-text-muted',
                isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
              ]"
            >
              <span v-if="!isContentCollapsed">Carregando...</span>
            </div>
            <div
              v-else-if="categoriesErrorMessage"
              :class="[
                'text-xs text-text-muted',
                isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
              ]"
            >
              <span v-if="!isContentCollapsed">{{ categoriesErrorMessage }}</span>
            </div>
            <div
              v-else-if="shoppingCategories.length === 0"
              :class="[
                'text-xs text-text-muted',
                isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
              ]"
            >
              <span v-if="!isContentCollapsed">Nenhuma categoria</span>
            </div>
            <template v-else>
              <div
                v-for="category in shoppingCategories"
                :key="category.id"
              >
                <SidebarButton
                  :title="category.name"
                  :color="category.color"
                  :is-collapsed="isContentCollapsed"
                  :route-to="{
                    path: '/shopping-list',
                    query: {
                      ...(route.path === '/shopping-list' ? route.query : {}),
                      tag: category.tag,
                    },
                  }"
                />
              </div>
            </template>
          </div>
        </SidebarSection>

        <Divider />

        <SidebarSection
          :enable-title="true"
          title="Listas de presentes"
          :is-sidebar-collapsed="isContentCollapsed"
        >
          <div :class="['flex flex-col', isContentCollapsed ? 'gap-2' : 'gap-1']">
            <SidebarButton
              :icon="Gift"
              title="todos"
              :is-collapsed="isContentCollapsed"
              route-to="/gifts"
            />
            <SidebarButton
              title="sem lista"
              :use-random-color="true"
              :is-collapsed="isContentCollapsed"
              :route-to="{ path: '/gifts', query: { unlisted: 'true' } }"
            />
            <button
              type="button"
              :class="[isContentCollapsed ? 'interactive-nudge flex h-8 w-8 items-center justify-center rounded-md hover:bg-card hover:text-accent' : 'interactive-nudge flex min-h-8 items-center gap-2 rounded-md px-2 py-1 text-sm text-text-secondary hover:bg-card hover:text-text-primary']"
              aria-label="Nova lista de presentes"
              @click="openCreateListModal('gift')"
            >
              <Plus :size="16" />
              <span v-if="!isContentCollapsed">Nova lista</span>
            </button>
            <p
              v-if="giftListsErrorMessage && !isContentCollapsed"
              class="px-2 py-1 text-xs text-text-muted"
            >
              {{ giftListsErrorMessage }}
            </p>
            <div
              v-for="list in giftLists"
              :key="list.id"
              class="group flex items-center gap-1"
            >
              <SidebarButton
                :title="list.title"
                :use-random-color="true"
                :is-collapsed="isContentCollapsed"
                :route-to="{ path: '/gifts', query: { listId: list.id } }"
              />
              <template v-if="!isContentCollapsed">
                <button
                  type="button"
                  class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-card hover:text-text-primary"
                  aria-label="Renomear lista de presentes"
                  @click="openEditListModal('gift', list)"
                >
                  <Pencil :size="14" />
                </button>
                <button
                  type="button"
                  class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-card hover:text-text-primary"
                  aria-label="Excluir lista de presentes"
                  @click="openDeleteListModal('gift', list)"
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
          title="Pessoas"
          :is-sidebar-collapsed="isContentCollapsed"
        >
          <div :class="['flex flex-col', isContentCollapsed ? 'gap-2' : 'gap-1']">
            <div
              v-if="isLoadingPersons"
              :class="[
                'text-xs text-text-muted',
                isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
              ]"
            >
              <span v-if="!isContentCollapsed">Carregando...</span>
            </div>
            <div
              v-else-if="personsErrorMessage"
              :class="[
                'text-xs text-text-muted',
                isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
              ]"
            >
              <span v-if="!isContentCollapsed">{{ personsErrorMessage }}</span>
            </div>
            <div
              v-else-if="visiblePersons.length === 0"
              :class="[
                'text-xs text-text-muted',
                isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
              ]"
            >
              <span v-if="!isContentCollapsed">Nenhuma pessoa</span>
            </div>
            <template v-else>
              <div
                v-for="person in visiblePersons"
                :key="person.id"
              >
                <SidebarButton
                  :use-random-color="true"
                  :title="person.name"
                  :is-collapsed="isContentCollapsed"
                  :route-to="{
                    path: '/gifts',
                    query: {
                      ...(route.path === '/gifts' ? route.query : {}),
                      personId: person.id,
                    },
                  }"
                />
              </div>
            </template>
          </div>
        </SidebarSection>

        <Divider />

        <SidebarSection
          :enable-title="true"
          title="Eventos"
          :is-sidebar-collapsed="isContentCollapsed"
        >
          <div :class="['flex flex-col', isContentCollapsed ? 'gap-2' : 'gap-1']">
            <div
              v-if="isLoadingEvents"
              :class="[
                'text-xs text-text-muted',
                isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
              ]"
            >
              <span v-if="!isContentCollapsed">Carregando...</span>
            </div>
            <div
              v-else-if="eventsErrorMessage"
              :class="[
                'text-xs text-text-muted',
                isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
              ]"
            >
              <span v-if="!isContentCollapsed">{{ eventsErrorMessage }}</span>
            </div>
            <div
              v-else-if="events.length === 0"
              :class="[
                'text-xs text-text-muted',
                isContentCollapsed ? 'h-8 w-8 rounded-md bg-card' : 'px-2 py-1'
              ]"
            >
              <span v-if="!isContentCollapsed">Nenhum evento</span>
            </div>
            <template v-else>
              <div
                v-for="event in events"
                :key="event.id"
              >
                <SidebarButton
                  :title="event.name"
                  :color="event.color"
                  :is-collapsed="isContentCollapsed"
                  :route-to="{
                    path: '/gifts',
                    query: {
                      ...(route.path === '/gifts' ? route.query : {}),
                      event: event.tag,
                    },
                  }"
                />
              </div>
            </template>
          </div>
        </SidebarSection>
      </template>
    </div>
    <footer>
      <Divider />
      <div :class="[isContentCollapsed ? 'p-1' : 'p-3']">
        <SidebarButton
          v-if="!isVaultMode"
          :icon="Settings"
          title="configuracoes"
          :is-collapsed="isContentCollapsed"
          route-to="/settings"
        />
        <button
          type="button"
          :class="[isContentCollapsed ? 'interactive-nudge mb-2 flex w-full items-center justify-center rounded-md p-1 hover:bg-card hover:text-accent' : 'interactive-nudge flex w-full flex-row items-center gap-2 rounded-md px-2 py-1 hover:bg-card hover:text-accent']"
          @click="handleLogout"
        >
          <LogOut :size="18" />
          <span v-if="!isContentCollapsed">Sair</span>
        </button>
      </div>
    </footer>
  </aside>

  <BaseModal
    :is-open="isVaultPasswordModalOpen"
    title="Acessar cofre"
    @close="closeVaultPasswordModal"
  >
    <form
      class="flex flex-col gap-4"
      @submit.prevent="submitVaultPassword"
    >
      <BaseTextField
        v-model="vaultPassword"
        label="Senha"
        type="password"
        required
      />
      <p
        v-if="vaultPasswordErrorMessage"
        class="text-sm text-text-secondary"
      >
        {{ vaultPasswordErrorMessage }}
      </p>
      <div class="flex flex-wrap justify-end gap-2">
        <BaseButton
          type="button"
          variant="secondary"
          @click="closeVaultPasswordModal"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          type="submit"
          variant="primary"
        >
          Entrar
        </BaseButton>
      </div>
    </form>
  </BaseModal>

  <BaseModal
    :is-open="isGiftListModalOpen"
    :title="giftListToEdit ? 'Renomear lista' : 'Nova lista'"
    @close="closeGiftListModal"
  >
    <form
      class="flex flex-col gap-4"
      @submit.prevent="submitGiftList"
    >
      <BaseTextField
        v-model="giftListName"
        label="Nome"
        required
      />
      <div class="flex flex-wrap justify-end gap-2">
        <BaseButton
          type="button"
          variant="secondary"
          @click="closeGiftListModal"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          type="submit"
          variant="primary"
        >
          Salvar
        </BaseButton>
      </div>
    </form>
  </BaseModal>

  <BaseModal
    :is-open="listModalKind !== null && listToDelete === null"
    :title="listToEdit ? 'Renomear lista' : 'Nova lista'"
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
          type="button"
          variant="secondary"
          :disabled="isSavingList"
          @click="closeListModal"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          type="submit"
          variant="primary"
          :disabled="isSavingList"
        >
          {{ isSavingList ? 'Salvando...' : 'Salvar' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>

  <BaseModal
    :is-open="listToDelete !== null"
    title="Excluir lista"
    @close="closeDeleteListModal"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <p class="text-sm text-text-secondary">
          A lista <strong class="text-text-primary">{{ listToDelete?.title }}</strong> sera excluida.
          Os itens serao preservados e ficarao disponiveis em Sem lista.
        </p>
      </div>
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
        :disabled="isDeletingList"
        @click="closeDeleteListModal"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        variant="primary"
        :disabled="isDeletingList"
        @click="confirmDeleteList"
      >
        <template #icon>
          <Trash2 :size="16" />
        </template>
        {{ isDeletingList ? 'Excluindo...' : 'Excluir lista' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
