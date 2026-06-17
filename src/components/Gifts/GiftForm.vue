<script setup lang="ts">
import { BaseButton, BaseSelect, BaseTextField } from '@/components';
import type { Event, GiftFormData, GiftList, GiftStatus, Person } from '@/types';

const props = defineProps<{
  modelValue: GiftFormData;
  persons: Person[];
  events: Event[];
  statuses: GiftStatus[];
  lists?: GiftList[];
  showList?: boolean;
  isSaving: boolean;
  errorMessage: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: GiftFormData];
  submit: [];
  cancel: [];
}>();

function updateField<Key extends keyof GiftFormData>(key: Key, value: GiftFormData[Key]) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  });
}

function toSelectOptions(items: Array<{ id: number; name: string }>) {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
  }));
}

function getOptionTag(items: Array<{ id: number; tag: string }>, id: number) {
  return items.find((item) => item.id === id)?.tag ?? '';
}

function getOptionIdByTag(items: Array<{ id: number; tag: string }>, tag: string) {
  return items.find((item) => item.tag === tag)?.id ?? 0;
}

function getOptionValue(items: Array<{ id: number; value: string }>, id: number) {
  return items.find((item) => item.id === id)?.value ?? '';
}

function getOptionIdByValue(items: Array<{ id: number; value: string }>, value: string) {
  return items.find((item) => item.value === value)?.id ?? 0;
}
</script>

<template>
  <form
    class="flex flex-col gap-4"
    @submit.prevent="emit('submit')"
  >
    <BaseTextField
      :model-value="modelValue.title"
      label="Titulo"
      required
      @update:model-value="updateField('title', String($event))"
    />
    <BaseTextField
      :model-value="modelValue.link"
      label="Link"
      type="url"
      @update:model-value="updateField('link', String($event))"
    />
    <BaseSelect
      :model-value="modelValue.personId"
      label="Pessoa"
      :options="toSelectOptions(persons)"
      required
      @update:model-value="updateField('personId', $event)"
    />
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <BaseSelect
        :model-value="getOptionIdByTag(events, modelValue.event)"
        label="Evento"
        :options="toSelectOptions(events)"
        @update:model-value="updateField('event', getOptionTag(events, $event))"
      />
      <BaseSelect
        :model-value="getOptionIdByValue(statuses, modelValue.status)"
        label="Status"
        :options="toSelectOptions(statuses)"
        @update:model-value="updateField('status', getOptionValue(statuses, $event))"
      />
    </div>
    <BaseSelect
      v-if="showList"
      :model-value="modelValue.giftListId"
      label="Lista de presentes"
      :options="[
        { id: 0, name: 'Sem lista' },
        ...(lists ?? []).map((list) => ({ id: list.id, name: list.title })),
      ]"
      @update:model-value="updateField('giftListId', $event)"
    />
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
