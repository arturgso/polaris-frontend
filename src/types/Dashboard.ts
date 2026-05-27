import type { LucideProps } from "lucide-vue-next";
import type { FunctionalComponent } from "vue";

export interface DashboardCardProps {
    id: number; 
    icon: FunctionalComponent<LucideProps>;
    title: string;
    info: string;
    bottomInfo: string;
}