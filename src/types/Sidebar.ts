import type { LucideProps } from "lucide-vue-next";
import type { FunctionalComponent } from "vue";

export interface SidebarButtonsProps {
    icon: FunctionalComponent<LucideProps>;
    title: string;
}