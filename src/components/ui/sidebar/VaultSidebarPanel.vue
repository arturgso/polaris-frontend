<script setup lang="ts">
import { Flower2, Pencil, Trash2 } from 'lucide-vue-next';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  deleteVaultGiftList,
  getVaultGiftLists,
  updateVaultGiftList,
} from '../../../services';
import type { VaultGiftList } from '../../../types';
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
const lists = ref<VaultGiftList[]>([]);
const isModalOpen = ref(false);
const listToEdit = ref<VaultGiftList | null>(null);
const listName = ref('');

function loadLists() {
  lists.value = getVaultGiftLists();
}

function openEditModal(list: VaultGiftList) {
  listToEdit.value = list;
  listName.value = list.name;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  listToEdit.value = null;
  listName.value = '';
}

function submitList() {
  const name = listName.value.trim();

  if (!name || !listToEdit.value) {
    return;
  }

  updateVaultGiftList(listToEdit.value.id, name);

  loadLists();
  closeModal();
}

function removeList(list: VaultGiftList) {
  deleteVaultGiftList(list.id);
  loadLists();

  if (route.query.listId === String(list.id)) {
    void router.push('/vault');
  }
}

onMounted(() => {
  loadLists();
  window.addEventListener('polaris:vault-changed', loadLists);
});

onUnmounted(() => {
  window.removeEventListener('polaris:vault-changed', loadLists);
});
</script>

<template>
  <SidebarSection
    :enable-title="false"
    :is-sidebar-collapsed="isCollapsed"
  >
    <div :class="['flex flex-col', isCollapsed ? 'gap-2' : 'gap-1']">
      <SidebarButton
        :icon="Flower2"
        title="todos"
        :is-collapsed="isCollapsed"
        route-to="/vault"
        @click="emit('navigate')"
      />
    </div>
  </SidebarSection>

  <Divider />

  <SidebarSection
    :enable-title="true"
    title="Listas de presentes"
    :is-sidebar-collapsed="isCollapsed"
  >
    <div :class="['flex flex-col', isCollapsed ? 'gap-2' : 'gap-1']">
      <div
        v-for="list in lists"
        :key="list.id"
        class="group flex items-center gap-1"
      >
        <SidebarButton
          :title="list.name"
          :use-random-color="true"
          :is-collapsed="isCollapsed"
          :route-to="{ path: '/vault', query: { listId: list.id } }"
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
            aria-label="Deletar lista"
            @click="removeList(list)"
          >
            <Trash2 :size="14" />
          </button>
        </template>
      </div>
    </div>
  </SidebarSection>

  <BaseModal
    :is-open="isModalOpen"
    title="Renomear lista"
    @close="closeModal"
  >
    <form
      class="flex flex-col gap-4"
      @submit.prevent="submitList"
    >
      <BaseTextField
        v-model="listName"
        label="Nome"
        required
      />
      <div class="flex flex-wrap justify-end gap-2">
        <BaseButton
          variant="secondary"
          @click="closeModal"
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
</template>
