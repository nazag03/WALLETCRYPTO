import { createRouter, createWebHistory } from 'vue-router';
import { useWalletStore } from '@/store/useWalletStore'; 
import LoginForm from '@/components/LoginForm.vue';
import TradeCypto from '@/components/TradeCypto.vue';
import TradeHistory from '@/components/TradeHistory.vue';
import PortfolioAnalysis from '@/components/PortfolioAnalysis.vue';


const routes = [
  { path: '/', component: LoginForm },
  { path: '/trade', component: TradeCypto, meta: { requiresAuth: true } },
  { path: '/history', component: TradeHistory, meta: { requiresAuth: true } },
  { path: '/analysis', component: PortfolioAnalysis, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const store = useWalletStore(); 
  store.loadUserData();
  console.log("Verificando Usuario:", store.currentUser); 

  if (to.meta.requiresAuth && !store.currentUser) {
    console.warn("Acceso denegado. Redirigiendo al login...");
    next('/'); 
  } else {
    next(); 
  }
});

export default router;
