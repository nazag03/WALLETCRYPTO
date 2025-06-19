import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { fetchCryptoPrices } from '@/api/cryptoApi';

export const useWalletStore = defineStore('wallet', () => {
  const currentUser = ref(null);
  const balance = ref(10000);
  const transactions = ref([]);
  const errorMessage = ref('');
  const cryptocurrencies = ref([
    { id: 'BTC', name: 'Bitcoin', quantity: 0, price: 30000 },
    { id: 'ETH', name: 'Ethereum', quantity: 0, price: 2000 },
    { id: 'XRP', name: 'Ripple', quantity: 0, price: 0.5 },
    { id: 'LTC', name: 'Litecoin', quantity: 0, price: 150 },
  ]);

  const setErrorMessage = (msg) => {
    errorMessage.value = msg;
    setTimeout(() => {
      errorMessage.value = '';
    }, 3000);
  };

  const updateCryptoPrices = async () => {
    const prices = await fetchCryptoPrices();
    cryptocurrencies.value = cryptocurrencies.value.map(crypto => {
      return { ...crypto, price: prices[crypto.id.toLowerCase()] || crypto.price };
    });
  };

  function setUser(userId) {
    currentUser.value = userId;
    loadUserData();
  }

  function loadUserData() {
    if (!currentUser.value) {
      resetStoreData();
      return;
    }

    transactions.value = JSON.parse(localStorage.getItem(`transactions_${currentUser.value}`)) || [];
    balance.value = parseFloat(localStorage.getItem(`balance_${currentUser.value}`)) || 10000;

    const storedCryptos = localStorage.getItem(`cryptos_${currentUser.value}`);
    if (storedCryptos) {
      const parsedCryptos = JSON.parse(storedCryptos);
      cryptocurrencies.value = cryptocurrencies.value.map(crypto => ({
        ...crypto,
        quantity: parsedCryptos.find(c => c.id === crypto.id)?.quantity || 0
      }));
    }
  }

  function saveUserData() {
    if (!currentUser.value) return;
    localStorage.setItem(`transactions_${currentUser.value}`, JSON.stringify(transactions.value));
    localStorage.setItem(`balance_${currentUser.value}`, balance.value.toString());
    localStorage.setItem(`cryptos_${currentUser.value}`, JSON.stringify(cryptocurrencies.value));
  }

  function resetStoreData() {
    balance.value = 10000;
    transactions.value = [];
    cryptocurrencies.value.forEach(crypto => {
      crypto.quantity = 0;
    });
  }

  function logout() {
    currentUser.value = null;
    resetStoreData();
  }

  function addTransaction(transaction) {
    const crypto = cryptocurrencies.value.find(c => c.id === transaction.cryptoId);
    if (!crypto) {
      setErrorMessage('Crypto not found');
      return;
    }

    if (transaction.type === 'buy') {
      if (balance.value < transaction.total) {
        setErrorMessage('Insufficient balance');
        return;
      }
      balance.value -= transaction.total;
      crypto.quantity += transaction.quantity;
    } else if (transaction.type === 'sell') {
      if (crypto.quantity < transaction.quantity) {
        setErrorMessage('Insufficient quantity');
        return;
      }
      balance.value += transaction.total;
      crypto.quantity -= transaction.quantity;
    }

    transactions.value.push({
      transactionId: Date.now(),
      dateTime: new Date().toLocaleString(),
      cryptoId: transaction.cryptoId,
      cryptoName: crypto.name,
      type: transaction.type,
      quantity: transaction.quantity,
      total: transaction.total,
      price: crypto.price,
    });

    saveUserData();
  }

  function removeTransaction(transactionId) {
    const index = transactions.value.findIndex(t => t.transactionId === transactionId);
    if (index === -1) return;

    const transaction = transactions.value[index];
    const crypto = cryptocurrencies.value.find(c => c.id === transaction.cryptoId);

    if (!crypto) return;

    if (transaction.type === 'buy') {
      balance.value += transaction.total;
      crypto.quantity -= transaction.quantity;
    } else if (transaction.type === 'sell') {
      balance.value -= transaction.total;
      crypto.quantity += transaction.quantity;
    }

    transactions.value.splice(index, 1);
    saveUserData();
  }

  function editTransaction(updatedTransaction) {
    const index = transactions.value.findIndex(t => t.transactionId === updatedTransaction.transactionId);
    if (index === -1) return;

    const oldTransaction = transactions.value[index];
    const crypto = cryptocurrencies.value.find(c => c.id === oldTransaction.cryptoId);
    if (!crypto) return;

    if (oldTransaction.type === 'buy') {
      balance.value += oldTransaction.total;
      crypto.quantity -= oldTransaction.quantity;
    } else if (oldTransaction.type === 'sell') {
      balance.value -= oldTransaction.total;
      crypto.quantity += oldTransaction.quantity;
    }

    if (updatedTransaction.type === 'buy') {
      if (balance.value < updatedTransaction.total) {
        setErrorMessage('Insufficient balance to edit this purchase.');
        balance.value -= oldTransaction.total;
        crypto.quantity += oldTransaction.quantity;
        return;
      }
    } else if (updatedTransaction.type === 'sell') {
      if (crypto.quantity < updatedTransaction.quantity) {
        setErrorMessage('You dont have enough crypto to sell that amount..');
        balance.value += oldTransaction.total;
        crypto.quantity -= oldTransaction.quantity;
        return;
      }
    }

    transactions.value[index] = { ...oldTransaction, ...updatedTransaction };

    if (updatedTransaction.type === 'buy') {
      balance.value -= updatedTransaction.total;
      crypto.quantity += updatedTransaction.quantity;
    } else if (updatedTransaction.type === 'sell') {
      balance.value += updatedTransaction.total;
      crypto.quantity -= updatedTransaction.quantity;
    }

    saveUserData();
  }

  const formattedBalance = computed(() => balance.value.toFixed(2));

  watch(currentUser, (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      loadUserData();
    }
  });

  return {
    currentUser,
    balance,
    transactions,
    cryptocurrencies,
    updateCryptoPrices,
    setUser,
    loadUserData,
    saveUserData,
    resetStoreData,
    logout,
    addTransaction,
    removeTransaction,
    editTransaction,
    formattedBalance,
    errorMessage, 
  };
});
