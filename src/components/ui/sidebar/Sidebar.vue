<script setup lang="ts">
import { ArrowLeft, LogOut, Settings, Sidebar as SidebarIcon } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  clearAuthSession,
  hasVaultSession,
  lockVault,
  unlockVault,
} from '../../../services';
import BaseButton from '../BaseButton.vue';
import BaseModal from '../BaseModal.vue';
import BaseTextField from '../BaseTextField.vue';
import Divider from './Divider.vue';
import GiftsSidebarPanel from './GiftsSidebarPanel.vue';
import MainSidebarPanel from './MainSidebarPanel.vue';
import ShoppingSidebarPanel from './ShoppingSidebarPanel.vue';
import SidebarButton from './SidebarButton.vue';
import VaultSidebarPanel from './VaultSidebarPanel.vue';

type SidebarPanel = 'main' | 'shopping' | 'gifts' | 'vault';

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

const route = useRoute();
const router = useRouter();
const isCollapsed = ref(false);
const activePanel = ref<SidebarPanel>(getRoutePanel());
const keepMainPanel = ref(false);
const isVaultPasswordModalOpen = ref(false);
const vaultPassword = ref('');
const vaultPasswordErrorMessage = ref('');

const isContentCollapsed = computed(() => !props.isDrawer && isCollapsed.value);
const isVaultPanel = computed(() => activePanel.value === 'vault');
const panelTitle = computed(() => {
  if (activePanel.value === 'shopping') {
    return 'Compras';
  }

  if (activePanel.value === 'gifts') {
    return 'Presentes';
  }

  if (activePanel.value === 'vault') {
    return 'Beatriz';
  }

  return 'Polaris';
});

function getRoutePanel(): SidebarPanel {
  if (route.path === '/vault') {
    return 'vault';
  }

  if (route.path === '/shopping-list') {
    return 'shopping';
  }

  if (route.path === '/gifts') {
    return 'gifts';
  }

  return 'main';
}

function collapseSidebar() {
  if (props.isDrawer) {
    emit('close');
    return;
  }

  isCollapsed.value = !isCollapsed.value;
  emit('collapse', isCollapsed.value);
}

function closeDrawer() {
  if (props.isDrawer) {
    emit('close');
  }
}

function openModule(module: 'shopping' | 'gifts') {
  keepMainPanel.value = false;
  activePanel.value = module;
  void router.push(module === 'shopping' ? '/shopping-list' : '/gifts');
}

function showMainPanel() {
  keepMainPanel.value = true;
  activePanel.value = 'main';
}

function openVaultPasswordModal() {
  if (hasVaultSession()) {
    keepMainPanel.value = false;
    activePanel.value = 'vault';
    void router.push('/vault');
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
  keepMainPanel.value = false;
  activePanel.value = 'vault';
  void router.push('/vault');
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
  keepMainPanel.value = false;
  activePanel.value = 'main';
  void router.push('/');
}

function handleLogout() {
  clearAuthSession();
  lockVault();
  void router.push('/login');
}

function handleSettingsClick() {
  if (isVaultPanel.value) {
    lockVault();
  }

  keepMainPanel.value = false;
  activePanel.value = 'main';
  closeDrawer();
}

watch(
  () => route.path,
  () => {
    const routePanel = getRoutePanel();

    if (routePanel === 'vault') {
      keepMainPanel.value = false;
      activePanel.value = 'vault';
      return;
    }

    if (routePanel === 'main') {
      keepMainPanel.value = false;
      activePanel.value = 'main';
      return;
    }

    if (!keepMainPanel.value) {
      activePanel.value = routePanel;
    }
  },
);

watch(
  () => route.query.vault,
  (value) => {
    if (value === 'unlock') {
      openVaultPasswordModal();
    }
  },
  { immediate: true },
);
</script>

<template>
  <aside
    :class="[
      'fixed left-0 top-0 z-50 flex h-dvh flex-col justify-between border-r-2 border-border bg-surface transition-all duration-150',
      isDrawer ? 'w-72 max-w-[calc(100vw-2rem)] shadow-2xl lg:hidden' : 'hidden lg:flex',
      isDrawer ? (isDrawerOpen ? 'translate-x-0' : '-translate-x-full') : '',
      !isDrawer ? (isCollapsed ? 'w-14' : 'w-64') : '',
    ]"
  >
    <div class="min-h-0 overflow-y-auto">
      <div class="relative p-3">
        <div class="flex items-center justify-between gap-2">
          <h1
            v-if="!isContentCollapsed"
            class="truncate text-2xl font-bold text-text-secondary"
          >
            {{ panelTitle }}
          </h1>

          <button
            v-if="activePanel !== 'main'"
            type="button"
            :class="[
              'interactive-nudge rounded-md p-1 text-text-muted hover:bg-card hover:text-accent',
              isContentCollapsed ? 'mx-auto' : '',
            ]"
            :aria-label="isVaultPanel ? 'Sair do cofre' : 'Voltar ao menu principal'"
            @click="isVaultPanel ? leaveVault() : showMainPanel()"
          >
            <ArrowLeft :size="20" />
          </button>

          <button
            v-else
            type="button"
            :class="[
              'interactive-nudge rounded-md p-1 text-text-muted hover:bg-card hover:text-accent',
              isContentCollapsed ? 'mx-auto' : '',
            ]"
            aria-label="Alternar sidebar"
            @click="collapseSidebar"
          >
            <SidebarIcon :size="20" />
          </button>
        </div>
      </div>

      <Divider :class="[isContentCollapsed ? 'hidden' : '']" />

      <Transition
        name="fade-slide"
        mode="out-in"
      >
        <div :key="activePanel">
          <MainSidebarPanel
            v-if="activePanel === 'main'"
            :is-collapsed="isContentCollapsed"
            @open-module="openModule"
            @open-vault="openVaultPasswordModal"
            @navigate="closeDrawer"
          />
          <ShoppingSidebarPanel
            v-else-if="activePanel === 'shopping'"
            :is-collapsed="isContentCollapsed"
            @navigate="closeDrawer"
          />
          <GiftsSidebarPanel
            v-else-if="activePanel === 'gifts'"
            :is-collapsed="isContentCollapsed"
            @navigate="closeDrawer"
          />
          <VaultSidebarPanel
            v-else
            :is-collapsed="isContentCollapsed"
            @navigate="closeDrawer"
          />
        </div>
      </Transition>
    </div>

    <footer>
      <Divider />
      <div :class="[isContentCollapsed ? 'p-1' : 'p-3']">
        <SidebarButton
          :icon="Settings"
          title="configuracoes"
          :is-collapsed="isContentCollapsed"
          route-to="/settings"
          @click="handleSettingsClick"
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
</template>
