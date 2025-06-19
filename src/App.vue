<template>
  <div id="app">
    <nav>
    <router-link to="/"></router-link>
  <template v-if="walletStore.currentUser">
    <button>
      <router-link to="/trade">Trade</router-link>
    </button>
    <button>
      <router-link to="/history">History</router-link>
    </button>
    <button>
      <router-link to="/analysis">Analysis</router-link>
    </button>
    <button @click="logout" class="logout-btn">
      Log Out
    </button>
  </template>
</nav>

    
    <router-view />
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useWalletStore } from '@/store/useWalletStore';
import { useRouter } from 'vue-router';

export default {
  name: "App",
  setup() {
    const walletStore = useWalletStore();
    const router = useRouter();

    onMounted(() => {
      walletStore.loadUserData();
    });

    const logout = () => {
      walletStore.logout();
      router.push('/');
    };

    return {
      walletStore,
      logout
    };
  },
};
</script>

<style scoped>
#app {
  text-align: center;
  padding: 20px;
}
button {
  background-color:#151d33;
  color: rgb(240, 240, 240);
  padding: 12px 20px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}
nav {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
nav a {
  text-decoration: none;
  color: #dad8d8d3;
  font-weight: bold;
}
nav a:hover {
  text-decoration: underline;
}
.logout-btn {
  background-color: #e74c3c;
}
.logout-btn:hover {
  background-color: #c0392b;
}
</style>
