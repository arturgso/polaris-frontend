<script setup lang="ts">
import { BaseButton, BaseSelect, BaseTextField } from '@/components';
import type {
  ShoppingItemCategory,
  ShoppingItemFormData,
  ShoppingItemStatus,
  ShoppingList,
} from '@/types';

const props = defineProps<{
  modelValue: ShoppingItemFormData;
  categories: ShoppingItemCategory[];
  statuses: ShoppingItemStatus[];
  lists?: ShoppingList[];
  showList?: boolean;
  isSaving: boolean;
  errorMessage: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ShoppingItemFormData];
  submit: [];
  cancel: [];
}>();

function updateField<Key extends keyof ShoppingItemFormData>(key: Key, value: ShoppingItemFormData[Key]) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  });
}

function getOptionValue(items: Array<{ id: number; value: string }>, id: number) {
  return items.find((item) => item.id === id)?.value ?? '';
}

function getOptionId(items: Array<{ id: number; value: string }>, value: string) {
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
      required
      @update:model-value="updateField('link', String($event))"
    />
    <BaseTextField
      :model-value="modelValue.price"
      label="Valor"
      type="number"
      min="0"
      step="0.01"
      required
      @update:model-value="updateField('price', Number($event))"
    />
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <BaseSelect
        :model-value="modelValue.categoryId"
        label="Categoria"
        :options="categories"
        required
        @update:model-value="updateField('categoryId', $event)"
      />
      <BaseSelect
        :model-value="getOptionId(statuses, modelValue.status)"
        label="Status"
        :options="statuses"
        required
        @update:model-value="updateField('status', getOptionValue(statuses, $event))"
      />
    </div>
    <BaseSelect
      v-if="showList"
      :model-value="modelValue.shoppingListId"
      label="Lista de compras"
      :options="[
        { id: 0, name: 'Sem lista' },
        ...(lists ?? []).map((list) => ({ id: list.id, name: list.title })),
      ]"
      @update:model-value="updateField('shoppingListId', $event)"
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
