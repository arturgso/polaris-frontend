<script setup lang="ts">
import { Edit2, Plus, Search, Trash2, X } from 'lucide-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  BaseButton,
  BaseEmptyState,
  BaseModal,
  BaseTextField,
  GiftCard,
  GiftForm,
  PersonForm,
  ShoppingFilterDropdown,
} from '@/components';
import {
  createGift,
  createPerson,
  deleteGift,
  deletePerson,
  getEvents,
  getGiftsByPerson,
  getGiftStatuses,
  getPerson,
  getPersons,
  updateGift,
  updatePerson,
} from '@/services';
import type {
  Event,
  Gift,
  GiftFormData,
  GiftStatus,
  GiftWithPersonId,
  NewPersonDTO,
  Person,
  PersonFormData,
} from '@/types';

interface PersonGiftColumn {
  person: Person;
  gifts: GiftWithPersonId[];
}

const route = useRoute();
const router = useRouter();
const persons = ref<Person[]>([]);
const selectedPerson = ref<Person | null>(null);
const personGifts = ref<GiftWithPersonId[]>([]);
const giftColumns = ref<PersonGiftColumn[]>([]);
const events = ref<Event[]>([]);
const statuses = ref<GiftStatus[]>([]);
const isLoading = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const isDeleting = ref<boolean>(false);
const errorMessage = ref<string>('');
const modalErrorMessage = ref<string>('');
const searchTerm = ref<string>('');
const selectedEventIds = ref<number[]>([]);
const selectedStatusIds = ref<number[]>([]);
const isGiftModalOpen = ref<boolean>(false);
const giftToEdit = ref<GiftWithPersonId | null>(null);
const giftToDelete = ref<GiftWithPersonId | null>(null);
const isPersonModalOpen = ref<boolean>(false);
const personToEdit = ref<Person | null>(null);
const personToDelete = ref<Person | null>(null);
let requestId = 0;

const emptyGiftForm: GiftFormData = {
  title: '',
  link: '',
  personId: 0,
  event: '',
  status: '',
};

const emptyPersonForm: PersonFormData = {
  name: '',
  birthdayMonth: '',
  birthdayDay: '',
};

const giftForm = ref<GiftFormData>({ ...emptyGiftForm });
const personForm = ref<PersonFormData>({ ...emptyPersonForm });

const currentPersonId = computed(() => {
  const routePersonId = Number(route.params.personId);

  return Number.isFinite(routePersonId) && routePersonId > 0 ? routePersonId : undefined;
});

const isPersonPage = computed(() => currentPersonId.value !== undefined);

const pageTitle = computed(() => {
  if (selectedPerson.value) {
    return `Presentes de ${selectedPerson.value.name}`;
  }

  return 'Presentes';
});

const filteredPersonGifts = computed(() => filterGifts(personGifts.value));

const filteredGiftColumns = computed(() => {
  return giftColumns.value
    .map((column) => ({
      ...column,
      gifts: filterGifts(column.gifts),
    }))
    .filter((column) => column.gifts.length > 0 || searchTerm.value.trim() === '');
});

const hasActiveFilters = computed(() => selectedEventIds.value.length > 0 || selectedStatusIds.value.length > 0);

function getNamesFromIds(items: Array<{ id: number; name: string }>, ids: number[]) {
  return ids
    .map((id) => items.find((item) => item.id === id)?.name)
    .filter((name): name is string => Boolean(name));
}

function filterGifts(gifts: GiftWithPersonId[]) {
  const normalizedSearch = searchTerm.value.trim().toLowerCase();
  const selectedEvents = getNamesFromIds(events.value, selectedEventIds.value);
  const selectedStatuses = getNamesFromIds(statuses.value, selectedStatusIds.value);

  return gifts.filter((gift) => {
    const matchesSearch = normalizedSearch === ''
      || gift.title.toLowerCase().includes(normalizedSearch)
      || (gift.link ?? '').toLowerCase().includes(normalizedSearch);
    const matchesEvent = selectedEvents.length === 0 || selectedEvents.includes(gift.event ?? '');
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(gift.status ?? '');

    return matchesSearch && matchesEvent && matchesStatus;
  });
}

function toGiftWithPersonId(gift: Gift, personId: number): GiftWithPersonId {
  return {
    ...gift,
    personId,
  };
}

function getInitialGiftPersonId() {
  return currentPersonId.value ?? persons.value[0]?.id ?? 0;
}

function resetGiftForm(personId = getInitialGiftPersonId()) {
  giftForm.value = {
    title: '',
    link: '',
    personId,
    event: events.value[0]?.name ?? '',
    status: statuses.value[0]?.name ?? '',
  };
  modalErrorMessage.value = '';
}

function resetPersonForm() {
  personForm.value = { ...emptyPersonForm };
  modalErrorMessage.value = '';
}

function toggleFilter(filterValues: number[], value: number) {
  const currentIndex = filterValues.indexOf(value);

  if (currentIndex >= 0) {
    filterValues.splice(currentIndex, 1);
    return;
  }

  filterValues.push(value);
}

function clearFilters() {
  selectedEventIds.value = [];
  selectedStatusIds.value = [];
}

function openAddGiftModal(personId = getInitialGiftPersonId()) {
  resetGiftForm(personId);
  isGiftModalOpen.value = true;
}

function openEditGiftModal(gift: GiftWithPersonId) {
  giftForm.value = {
    title: gift.title,
    link: gift.link ?? '',
    personId: gift.personId,
    event: gift.event ?? events.value[0]?.name ?? '',
    status: gift.status ?? statuses.value[0]?.name ?? '',
  };
  modalErrorMessage.value = '';
  giftToEdit.value = gift;
}

function openDeleteGiftModal(gift: GiftWithPersonId) {
  modalErrorMessage.value = '';
  giftToDelete.value = gift;
}

function openAddPersonModal() {
  resetPersonForm();
  isPersonModalOpen.value = true;
}

function openEditPersonModal(person: Person) {
  personForm.value = {
    name: person.name,
    birthdayMonth: person.birthdayMonth ?? '',
    birthdayDay: person.birthdayDay ?? '',
  };
  modalErrorMessage.value = '';
  personToEdit.value = person;
}

function openDeletePersonModal(person: Person) {
  modalErrorMessage.value = '';
  personToDelete.value = person;
}

function toPersonPayload(): NewPersonDTO {
  return {
    name: personForm.value.name,
    birthdayMonth: personForm.value.birthdayMonth === '' ? undefined : personForm.value.birthdayMonth,
    birthdayDay: personForm.value.birthdayDay === '' ? undefined : personForm.value.birthdayDay,
  };
}

function notifyPersonsChanged() {
  window.dispatchEvent(new Event('polaris:persons-changed'));
}

async function loadOptions() {
  const [loadedEvents, loadedStatuses] = await Promise.all([
    getEvents(),
    getGiftStatuses(),
  ]);

  events.value = loadedEvents;
  statuses.value = loadedStatuses;
}

async function loadGiftsPage() {
  const currentRequestId = requestId + 1;
  requestId = currentRequestId;
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const loadedPersons = await getPersons();
    const loadedSelectedPerson = currentPersonId.value ? await getPerson(currentPersonId.value) : null;

    persons.value = loadedPersons;
    selectedPerson.value = loadedSelectedPerson;

    if (currentPersonId.value) {
      const gifts = await getGiftsByPerson(currentPersonId.value);

      if (currentRequestId === requestId) {
        personGifts.value = gifts.map((gift) => toGiftWithPersonId(gift, currentPersonId.value as number));
        giftColumns.value = [];
      }

      return;
    }

    const giftsByPerson = await Promise.all(
      loadedPersons.map(async (person) => ({
        person,
        gifts: (await getGiftsByPerson(person.id)).map((gift) => toGiftWithPersonId(gift, person.id)),
      })),
    );

    if (currentRequestId === requestId) {
      giftColumns.value = giftsByPerson;
      personGifts.value = [];
    }
  } catch {
    if (currentRequestId === requestId) {
      errorMessage.value = 'Nao foi possivel carregar presentes.';
      selectedPerson.value = null;
      giftColumns.value = [];
      personGifts.value = [];
    }
  } finally {
    if (currentRequestId === requestId) {
      isLoading.value = false;
    }
  }
}

async function submitGift() {
  if (giftForm.value.personId === 0) {
    modalErrorMessage.value = 'Cadastre uma pessoa antes de salvar o presente.';
    return;
  }

  isSaving.value = true;
  modalErrorMessage.value = '';

  try {
    if (giftToEdit.value) {
      await updateGift(giftToEdit.value.id, {
        title: giftForm.value.title,
        link: giftForm.value.link || undefined,
        giftFor: giftForm.value.personId,
        event: giftForm.value.event || undefined,
        status: giftForm.value.status || undefined,
      });
      giftToEdit.value = null;
    } else {
      await createGift({
        title: giftForm.value.title,
        link: giftForm.value.link || undefined,
        personId: giftForm.value.personId,
        event: giftForm.value.event || undefined,
        status: giftForm.value.status || undefined,
      });
      isGiftModalOpen.value = false;
    }

    await loadGiftsPage();
  } catch {
    modalErrorMessage.value = 'Nao foi possivel salvar o presente.';
  } finally {
    isSaving.value = false;
  }
}

async function confirmDeleteGift() {
  if (!giftToDelete.value) {
    return;
  }

  isDeleting.value = true;
  modalErrorMessage.value = '';

  try {
    await deleteGift(giftToDelete.value.id);
    giftToDelete.value = null;
    await loadGiftsPage();
  } catch {
    modalErrorMessage.value = 'Nao foi possivel deletar o presente.';
  } finally {
    isDeleting.value = false;
  }
}

async function submitPerson() {
  isSaving.value = true;
  modalErrorMessage.value = '';

  try {
    if (personToEdit.value) {
      await updatePerson(personToEdit.value.id, toPersonPayload());
      personToEdit.value = null;
    } else {
      await createPerson(toPersonPayload());
      isPersonModalOpen.value = false;
    }

    notifyPersonsChanged();
    await loadGiftsPage();
  } catch {
    modalErrorMessage.value = 'Nao foi possivel salvar a pessoa.';
  } finally {
    isSaving.value = false;
  }
}

async function confirmDeletePerson() {
  if (!personToDelete.value) {
    return;
  }

  isDeleting.value = true;
  modalErrorMessage.value = '';

  try {
    const deletedPersonId = personToDelete.value.id;

    await deletePerson(deletedPersonId);
    personToDelete.value = null;
    notifyPersonsChanged();

    if (currentPersonId.value === deletedPersonId) {
      void router.push('/gifts');
      return;
    }

    await loadGiftsPage();
  } catch {
    modalErrorMessage.value = 'Nao foi possivel deletar a pessoa.';
  } finally {
    isDeleting.value = false;
  }
}

onMounted(() => {
  void loadOptions();
  void loadGiftsPage();
});

watch(
  () => route.params.personId,
  () => {
    void loadGiftsPage();
  },
);
</script>

<template>
  <div class="flex h-full flex-col gap-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="flex min-w-0 flex-col gap-2">
        <h1 class="text-2xl font-bold text-text-secondary">
          {{ pageTitle }}
        </h1>
        <p
          v-if="selectedPerson?.birthday"
          class="text-sm text-text-muted"
        >
          Aniversario: {{ selectedPerson.birthday }}
        </p>
      </div>

      <div class="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
        <BaseTextField
          v-model="searchTerm"
          type="search"
          placeholder="Pesquisar"
          :icon="Search"
          class="w-full sm:w-64"
        />

        <div class="flex flex-wrap items-center gap-2">
          <ShoppingFilterDropdown
            title="Eventos"
            :items="events"
            :selected-ids="selectedEventIds"
            @toggle="toggleFilter(selectedEventIds, $event)"
          />
          <ShoppingFilterDropdown
            title="Status"
            :items="statuses"
            :selected-ids="selectedStatusIds"
            @toggle="toggleFilter(selectedStatusIds, $event)"
          />
          <BaseButton
            v-if="hasActiveFilters"
            variant="secondary"
            @click="clearFilters"
          >
            <template #icon>
              <X :size="16" />
            </template>
            Limpar
          </BaseButton>
          <BaseButton
            variant="secondary"
            @click="openAddPersonModal"
          >
            <template #icon>
              <Plus :size="16" />
            </template>
            Pessoa
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="openAddGiftModal()"
          >
            <template #icon>
              <Plus :size="18" />
            </template>
            Presente
          </BaseButton>
        </div>
      </div>
    </div>

    <div
      v-if="selectedPerson"
      class="flex flex-wrap items-center gap-2 rounded-md border-2 border-border bg-card p-3"
    >
      <span class="text-sm font-semibold text-text-secondary">{{ selectedPerson.name }}</span>
      <BaseButton
        variant="ghost"
        @click="openEditPersonModal(selectedPerson)"
      >
        <template #icon>
          <Edit2 :size="16" />
        </template>
        Editar
      </BaseButton>
      <BaseButton
        variant="ghost"
        @click="openDeletePersonModal(selectedPerson)"
      >
        <template #icon>
          <Trash2 :size="16" />
        </template>
        Deletar
      </BaseButton>
    </div>

    <BaseEmptyState
      v-if="isLoading"
      message="Carregando presentes..."
    />

    <div
      v-else-if="errorMessage"
      class="flex w-full items-center justify-between gap-4 rounded-md border-2 border-border bg-card p-6"
    >
      <p class="text-sm text-text-secondary">
        {{ errorMessage }}
      </p>
      <BaseButton
        variant="primary"
        @click="loadGiftsPage"
      >
        Tentar novamente
      </BaseButton>
    </div>

    <BaseEmptyState
      v-else-if="persons.length === 0"
      message="Nenhuma pessoa cadastrada."
    />

    <template v-else-if="isPersonPage">
      <BaseEmptyState
        v-if="personGifts.length === 0"
        message="Nenhum presente encontrado para esta pessoa."
      />
      <BaseEmptyState
        v-else-if="filteredPersonGifts.length === 0"
        message="Nenhum presente encontrado para os filtros atuais."
      />
      <div
        v-else
        class="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),24rem))] gap-5"
      >
        <GiftCard
          v-for="gift in filteredPersonGifts"
          :key="gift.id"
          :gift="gift"
          @edit="openEditGiftModal(gift)"
          @delete="openDeleteGiftModal(gift)"
        />
      </div>
    </template>

    <template v-else>
      <BaseEmptyState
        v-if="giftColumns.length === 0"
        message="Nenhum presente encontrado."
      />
      <BaseEmptyState
        v-else-if="filteredGiftColumns.length === 0"
        message="Nenhum presente encontrado para os filtros atuais."
      />
      <div
        v-else
        class="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-5"
      >
        <section
          v-for="column in filteredGiftColumns"
          :key="column.person.id"
          class="flex min-w-0 flex-col gap-3"
        >
          <div class="flex items-center justify-between gap-2 rounded-md border-2 border-border bg-card p-3">
            <button
              type="button"
              class="min-w-0 truncate text-left text-sm font-bold text-text-primary transition duration-150 hover:text-accent"
              @click="router.push(`/gifts/${column.person.id}`)"
            >
              {{ column.person.name }}
            </button>
            <div class="flex shrink-0 items-center gap-1">
              <button
                type="button"
                class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-surface hover:text-text-primary"
                aria-label="Adicionar presente"
                @click="openAddGiftModal(column.person.id)"
              >
                <Plus :size="16" />
              </button>
              <button
                type="button"
                class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-surface hover:text-text-primary"
                aria-label="Editar pessoa"
                @click="openEditPersonModal(column.person)"
              >
                <Edit2 :size="16" />
              </button>
              <button
                type="button"
                class="rounded-md p-1 text-text-muted transition duration-150 hover:bg-surface hover:text-text-primary"
                aria-label="Deletar pessoa"
                @click="openDeletePersonModal(column.person)"
              >
                <Trash2 :size="16" />
              </button>
            </div>
          </div>

          <BaseEmptyState
            v-if="column.gifts.length === 0"
            message="Sem presentes."
          />
          <GiftCard
            v-for="gift in column.gifts"
            :key="gift.id"
            :gift="gift"
            @edit="openEditGiftModal(gift)"
            @delete="openDeleteGiftModal(gift)"
          />
        </section>
      </div>
    </template>
  </div>

  <BaseModal
    :is-open="isGiftModalOpen || giftToEdit !== null"
    :title="giftToEdit ? 'Editar presente' : 'Novo presente'"
    @close="isGiftModalOpen = false; giftToEdit = null"
  >
    <GiftForm
      v-model="giftForm"
      :persons="persons"
      :events="events"
      :statuses="statuses"
      :is-saving="isSaving"
      :error-message="modalErrorMessage"
      @submit="submitGift"
      @cancel="isGiftModalOpen = false; giftToEdit = null"
    />
  </BaseModal>

  <BaseModal
    :is-open="isPersonModalOpen || personToEdit !== null"
    :title="personToEdit ? 'Editar pessoa' : 'Nova pessoa'"
    @close="isPersonModalOpen = false; personToEdit = null"
  >
    <PersonForm
      v-model="personForm"
      :is-saving="isSaving"
      :error-message="modalErrorMessage"
      @submit="submitPerson"
      @cancel="isPersonModalOpen = false; personToEdit = null"
    />
  </BaseModal>

  <BaseModal
    :is-open="giftToDelete !== null"
    title="Deletar presente"
    @close="giftToDelete = null"
  >
    <div class="flex flex-col gap-2">
      <p class="text-sm text-text-secondary">
        Tem certeza que deseja deletar este presente?
      </p>
      <p class="font-semibold text-text-primary">
        {{ giftToDelete?.title }}
      </p>
      <p
        v-if="modalErrorMessage"
        class="text-sm text-text-secondary"
      >
        {{ modalErrorMessage }}
      </p>
    </div>

    <template #footer>
      <BaseButton
        variant="secondary"
        :disabled="isDeleting"
        @click="giftToDelete = null"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        variant="primary"
        :disabled="isDeleting"
        @click="confirmDeleteGift"
      >
        <template #icon>
          <Trash2 :size="16" />
        </template>
        {{ isDeleting ? 'Deletando...' : 'Deletar' }}
      </BaseButton>
    </template>
  </BaseModal>

  <BaseModal
    :is-open="personToDelete !== null"
    title="Deletar pessoa"
    @close="personToDelete = null"
  >
    <div class="flex flex-col gap-2">
      <p class="text-sm text-text-secondary">
        Tem certeza que deseja deletar esta pessoa?
      </p>
      <p class="font-semibold text-text-primary">
        {{ personToDelete?.name }}
      </p>
      <p
        v-if="modalErrorMessage"
        class="text-sm text-text-secondary"
      >
        {{ modalErrorMessage }}
      </p>
    </div>

    <template #footer>
      <BaseButton
        variant="secondary"
        :disabled="isDeleting"
        @click="personToDelete = null"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        variant="primary"
        :disabled="isDeleting"
        @click="confirmDeletePerson"
      >
        <template #icon>
          <Trash2 :size="16" />
        </template>
        {{ isDeleting ? 'Deletando...' : 'Deletar' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
