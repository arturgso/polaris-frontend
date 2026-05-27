import { Gift, ShoppingBag, ShoppingCart, TrendingUp } from "lucide-vue-next";
import type { DashboardCardProps } from "../types/Dashboard";

export const dashboardCardMock: DashboardCardProps[] = [
{
    id: 1,
    icon: ShoppingCart,
    title: "itens em compras",
    info: "8",
    bottomInfo: "total cadastrados"
},
{
    id: 2,
    icon: Gift,
    title: "itens em presentes",
    info: "6",
    bottomInfo: "total cadastrados"
},
{
    id: 3,
    icon: TrendingUp,
    title: "Total Compras",
    info: "R$ 1.900,10",
    bottomInfo: "soma estimada"
},
{
    id: 4,
    icon: ShoppingBag,
    title: "Total presentes",
    info: "R$ 2.780,80",
    bottomInfo: "soma estimada"
},
];