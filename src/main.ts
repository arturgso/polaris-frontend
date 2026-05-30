import { createApp } from 'vue';
import './style.css';
import App from '@/App.vue';
import { initializeThemeSettings } from '@/composables';
import router from '@/router';

initializeThemeSettings();

createApp(App).use(router).mount('#app');
