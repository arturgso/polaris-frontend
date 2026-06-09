<script setup lang="ts">
import { Gift, Pencil, Trash2 } from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { BEATRIZ_PERSON_ID } from '../../../constants';
import { showErrorToast, showSuccessToast } from '../../../composables';
import {
  deleteGiftList,
  getEvents,
  getGiftLists,
  getPersons,
  updateGiftList,
} from '../../../services';
import type { Event, GiftList, Person } from '../../../types';
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
const lists = ref<GiftList[]>([]);
const persons = ref<Person[]>([]);
const events = ref<Event[]>([]);
const listsError = ref('');
const personsError = ref('');
const eventsError = ref('');
const listToEdit = ref<GiftList | null>(null);
const listToDelete = ref<GiftList | null>(null);
const isListModalOpen = ref(false);
const listTitle = ref('');
const isSaving = ref(false);
const isDeleting = ref(false);
const visiblePersons = computed(() => persons.value.filter((person) => person.id !== BEATRIZ_PERSON_ID));

async function loadLists() {
  listsError.value = '';
  try {
    lists.value = await getGiftLists();
  } catch {
    listsError.value = 'Nao foi possivel carregar listas.';
  }
}

async function loadPersons() {
  personsError.value = '';
  try {
    persons.value = await getPersons();
  } catch {
    personsError.value = 'Nao foi possivel carregar pessoas.';
  }
}

async function loadEvents() {
  eventsError.value = '';
  try {
    events.value = await getEvents();
  } catch {
    eventsError.value = 'Nao foi possivel carregar eventos.';
  }
}

function openEditModal(list: GiftList) {
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
    await updateGiftList(listToEdit.value.id, { title });

    await loadLists();
    window.dispatchEvent(new Event('polaris:gift-lists-changed'));
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
    await deleteGiftList(deletedId);
    await loadLists();
    window.dispatchEvent(new Event('polaris:gift-lists-changed'));

    if (route.query.listId === String(deletedId)) {
      void router.push('/gifts');
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
  void loadPersons();
  void loadEvents();
  window.addEventListener('polaris:gift-lists-changed', loadLists);
  window.addEventListener('polaris:persons-changed', loadPersons);
  window.addEventListener('polaris:events-changed', loadEvents);
});

onUnmounted(() => {
  window.removeEventListener('polaris:gift-lists-changed', loadLists);
  window.removeEventListener('polaris:persons-changed', loadPersons);
  window.removeEventListener('polaris:events-changed', loadEvents);
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
        :icon="Gift"
        title="todos"
        :is-collapsed="isCollapsed"
        route-to="/gifts"
        @click="emit('navigate')"
      />
      <SidebarButton
        title="sem lista"
        :use-random-color="true"
        :is-collapsed="isCollapsed"
        :route-to="{ path: '/gifts', query: { unlisted: 'true' } }"
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
          :route-to="{ path: '/gifts', query: { listId: list.id } }"
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
    title="Pessoas"
    :is-sidebar-collapsed="isCollapsed"
  >
    <div :class="['flex flex-col', isCollapsed ? 'gap-2' : 'gap-1']">
      <p
        v-if="personsError && !isCollapsed"
        class="px-2 py-1 text-xs text-text-muted"
      >
        {{ personsError }}
      </p>
      <p
        v-else-if="visiblePersons.length === 0 && !isCollapsed"
        class="px-2 py-1 text-xs text-text-muted"
      >
        Nenhuma pessoa
      </p>
      <SidebarButton
        v-for="person in visiblePersons"
        :key="person.id"
        :use-random-color="true"
        :title="person.name"
        :is-collapsed="isCollapsed"
        :route-to="{
          path: '/gifts',
          query: {
            ...(route.path === '/gifts' ? route.query : {}),
            personId: person.id,
          },
        }"
        @click="emit('navigate')"
      />
    </div>
  </SidebarSection>

  <Divider />

  <SidebarSection
    :enable-title="true"
    title="Eventos"
    :is-sidebar-collapsed="isCollapsed"
  >
    <div :class="['flex flex-col', isCollapsed ? 'gap-2' : 'gap-1']">
      <p
        v-if="eventsError && !isCollapsed"
        class="px-2 py-1 text-xs text-text-muted"
      >
        {{ eventsError }}
      </p>
      <p
        v-else-if="events.length === 0 && !isCollapsed"
        class="px-2 py-1 text-xs text-text-muted"
      >
        Nenhum evento
      </p>
      <SidebarButton
        v-for="event in events"
        :key="event.id"
        :title="event.name"
        :color="event.color"
        :is-collapsed="isCollapsed"
        :route-to="{
          path: '/gifts',
          query: {
            ...(route.path === '/gifts' ? route.query : {}),
            event: event.tag,
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
