import { Brush, Cake, CircleQuestionMark, Cpu, Heart, Package, TreePine } from "lucide-vue-next";
import type { SidebarButtonsProps } from '@/types';

export const shoppingButtons: SidebarButtonsProps[] = [
    {
        icon: Cpu,
        title: "tech"
    },
    {
        icon: Heart,
        title: "saúde"
    },
    {
        icon: Brush,
        title: "maquiagem"
    },
    {
        icon: Package,
        title: "outros"
    },
];

export const eventsButtons: SidebarButtonsProps[] = [
    {
        icon: TreePine,
        title: "natal"
    },
    {
        icon: Cake,
        title: "Aniversário"
    },
    {
        icon: CircleQuestionMark,
        title: "não especificado"
    },
];
