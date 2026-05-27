<script setup lang="ts">
import { ShoppingCart } from 'lucide-vue-next';
import DashboardCard from '../components/dashboard/DashboardCard.vue';
import { dashboardCardMock } from '../mocks/dashboardCards.mock';

interface ShoppingListProps {
  id: number;
  title: string;
  categorie: string;
  price: string;
}

const shoppingList: ShoppingListProps[] = [
  {
    id: 1,
    title: "Mouse Logitech MX",
    categorie: "tech",
    price: "549,90"
  },
  {
    id: 2,
    title: "Vitamina D 200Ul",
    categorie: "saude",
    price: "39,50"
  },
  {
    id: 3,
    title: "BT Ice",
    categorie: "Maquiagem",
    price: "78,90"
  },
  {
    id: 4,
    title: "Creme hidratante nivea",
    categorie: "cosmeticos",
    price: "89,00"
  },
  {
    id: 5,
    title: "Pilhas AA",
    categorie: "outros",
    price: "89,00"
  },
];

</script>

<template>
  <div class="flex flex-col mt-8 items-center h-full">
    <div class="flex flex-col gap-10 w-full">
      <h1 class="text-2xl font-bold text-text-secondary">
        Dashboard
      </h1>
      <div class="flex flex-row justify-between">
        <div
          v-for="item in dashboardCardMock"
          :key="item.id"
        >
          <DashboardCard :item="item" />
        </div>
      </div>

      <div class="flex gap-4">
        <div class="bg-card w-1/2 border-2 border-border rounded-md p-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <ShoppingCart class="text-accent" />
              <h1 class="font-bold text-lg">
                Compras recentes
              </h1>
            </div>
            <h1 class="text-text-secondary text-sm uppercase">
              Ultimos 5
            </h1>
          </div>

          <div class="flex flex-col gap-2">
            <div
              v-for="item in shoppingList"
              :key="item.id"
            >
              <div class="flex items-center justify-between border-t border-border py-2">
                <div class="flex gap-2 items-center">
                  <h1 class="text-text-primary">
                    {{ item.title }}
                  </h1>
                  <span class="text-text-secondary capitalize text-[12px] bg-bg p-1 rounded-sm">{{ item.categorie
                  }}</span>
                </div>
                <span class="text-accent font-bold">R$ {{ item.price }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-card w-1/2 border-2 border-border rounded-md p-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <ShoppingCart class="text-accent" />
              <h1 class="font-bold text-lg">
                Compras recentes
              </h1>
            </div>
            <h1 class="text-text-secondary text-sm uppercase">
              Ultimos 5
            </h1>
          </div>

          <div class="flex flex-col gap-2">
            <div
              v-for="item in shoppingList"
              :key="item.id"
            >
              <div class="flex items-center justify-between border-t border-border py-2">
                <div class="flex gap-2 items-center">
                  <h1 class="text-text-primary">
                    {{ item.title }}
                  </h1>
                  <span class="text-text-secondary capitalize text-[12px] bg-bg p-1 rounded-sm">{{ item.categorie
                  }}</span>
                </div>
                <span class="text-accent font-bold">R$ {{ item.price }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>