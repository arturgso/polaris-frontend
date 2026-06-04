<script setup lang="ts">
import { computed, ref } from 'vue';
import { LogIn } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { BaseButton, BaseTextField } from '../components';
import { login, saveAuthSession } from '../services';

const router = useRouter();

const username = ref<string>('');
const password = ref<string>('');
const errorMessage = ref<string>('');
const isLoading = ref<boolean>(false);

const isSubmitDisabled = computed(() => username.value.trim() === '' || password.value === '' || isLoading.value);

async function handleSubmit() {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    const response = await login({
      username: username.value.trim(),
      password: password.value,
    });
    saveAuthSession(response);
    void router.push('/');
  } catch {
    errorMessage.value = 'Usuario ou senha invalidos.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <main class="flex min-h-dvh items-center justify-center bg-bg px-4 py-8">
    <section class="w-full max-w-sm rounded-md border-2 border-border bg-card p-6 shadow-2xl">
      <div class="mb-6 flex flex-col gap-2">
        <p class="text-sm font-semibold uppercase text-accent">
          Polaris
        </p>
        <h1 class="text-2xl font-bold text-text-primary">
          Entrar
        </h1>
        <p class="text-sm text-text-secondary">
          Acesse o painel com seu usuario Polaris.
        </p>
      </div>

      <form
        class="flex flex-col gap-4"
        @submit.prevent="handleSubmit"
      >
        <BaseTextField
          v-model="username"
          label="Usuario"
          placeholder="usuario"
          required
        />

        <BaseTextField
          v-model="password"
          label="Senha"
          type="password"
          placeholder="admin"
          required
        />

        <p
          v-if="errorMessage"
          class="rounded-md border-2 border-border bg-surface px-3 py-2 text-sm font-semibold text-warning"
          role="alert"
        >
          {{ errorMessage }}
        </p>

        <BaseButton
          type="submit"
          variant="primary"
          :disabled="isSubmitDisabled"
          class="mt-2 w-full justify-center"
        >
          <template #icon>
            <LogIn :size="18" />
          </template>
          {{ isLoading ? 'Entrando...' : 'Entrar' }}
        </BaseButton>
      </form>
    </section>
  </main>
</template>
