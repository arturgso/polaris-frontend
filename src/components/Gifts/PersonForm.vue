<script setup lang="ts">
import { BaseButton, BaseTextField } from '@/components';
import type { PersonFormData } from '@/types';

const props = defineProps<{
  modelValue: PersonFormData;
  isSaving: boolean;
  errorMessage: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: PersonFormData];
  submit: [];
  cancel: [];
}>();

function updateField<Key extends keyof PersonFormData>(key: Key, value: PersonFormData[Key]) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  });
}

function normalizeNumber(value: number) {
  return Number.isFinite(value) ? value : '';
}
</script>

<template>
  <form
    class="flex flex-col gap-4"
    @submit.prevent="emit('submit')"
  >
    <BaseTextField
      :model-value="modelValue.name"
      label="Nome"
      required
      @update:model-value="updateField('name', String($event))"
    />
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <BaseTextField
        :model-value="modelValue.birthdayDay"
        label="Dia do aniversario"
        type="number"
        min="1"
        step="1"
        @update:model-value="updateField('birthdayDay', normalizeNumber(Number($event)))"
      />
      <BaseTextField
        :model-value="modelValue.birthdayMonth"
        label="Mes do aniversario"
        type="number"
        min="1"
        step="1"
        @update:model-value="updateField('birthdayMonth', normalizeNumber(Number($event)))"
      />
    </div>
    <p
      v-if="errorMessage"
      class="text-sm text-text-secondary"
    >
      {{ errorMessage }}
    </p>
    <div class="flex flex-wrap justify-end gap-2">
      <BaseButton
        type="button"
        variant="secondary"
        :disabled="isSaving"
        @click="emit('cancel')"
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
</template>
