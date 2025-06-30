import { ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = "https://laboratorio3-f36a.restdb.io/rest/transactions";
const API_KEY = "60eb09146661365596af552f";

export const useWalletStore = defineStore('wallet', () => {
  const currentUser = ref(null);
  const transactions = ref([]);
  const errorMessage = ref('');

  function setUser(userId) {
    currentUser.value = userId;
    localStorage.setItem("userId", userId); 
    loadUserData();
  }

async function loadUserData() {
  if (!currentUser.value) {
    transactions.value = [];
    return;
  }

  try {
    const response = await axios.get(`${API_URL}?q={"user_id":"${currentUser.value}"}`, {
      headers: {
        "x-apikey": API_KEY
      }
    });
    transactions.value = response.data;
  } catch (error) {
    console.error("Error al cargar transacciones desde la API:", error);
    transactions.value = [];
  }
}


  async function addTransaction(transaction) {
  try {
    const response = await axios.post(API_URL, transaction, {
      headers: {
        "Content-Type": "application/json",
        "x-apikey": API_KEY
      }
    });

    const saved = response.data;
    transactions.value.push(saved);
  } catch (error) {
    console.error("Error to save transaction in API", error);
    errorMessage.value = "Error to save transaction";
  }
}
  function logout() {
    currentUser.value = null;
    transactions.value = [];
    localStorage.removeItem("userId"); 
  }

  return {
    currentUser,
    transactions,
    errorMessage,
    setUser,
    loadUserData,
    addTransaction,
    logout
  };
});
