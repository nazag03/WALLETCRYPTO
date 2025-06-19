<template>
    <div class="trade-crypto">
      <h1>Buying and Selling Cryptos</h1>
      <p>Available balance: ${{ balance }} USD</p>
  
      <div v-if="loading">Loading prices...</div>
  
      <div v-else class="crypto-list">
        <div v-for="crypto in cryptos" :key="crypto.id" class="crypto-item">
          <h2>{{ crypto.name }} ({{ crypto.id }})</h2>
          <p>Current price: ${{ crypto.price }}</p>
          <button @click="openTrade(crypto, 'buy')">Buy</button>
          <button @click="openTrade(crypto, 'sell')" :disabled="crypto.quantity <= 0">Sell</button>
          <p v-if="crypto.quantity > 0">You have: {{ crypto.quantity }} {{ crypto.id }}</p>
        </div>
      </div>
  
      <div class="chart-section">
        <h2>📊 Crypto Price Trends</h2>
        <CryptoChart title="Bitcoin (BTC)" :dataPoints="[30000, 31200, 31000, 30200, 31500, 32000]" />
        <CryptoChart title="Ethereum (ETH)" :dataPoints="[2000, 2050, 2100, 2080, 2120, 2150]" />
      </div>
  
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <h2>{{ selectedAction === 'buy' ? 'Buy' : 'Sell' }} {{ selectedCrypto.name }}</h2>
          <p>Price: ${{ selectedCrypto.price }}</p>
  
          <input v-model.number="selectedQuantity" type="number" min="0.01" step="0.01" placeholder="Enter quantity" />
          <p><strong>Total:</strong> ${{ calculatedTotal.toFixed(2) }}</p>
          <p v-if="message" class="message">{{ message }}</p>
  
          <div class="modal-buttons">
            <button @click="confirmTrade">Confirm</button>
            <button @click="closeModal">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { useWalletStore } from '@/store/useWalletStore';
  import { fetchCryptoPrices } from '@/api/cryptoApi';
  import CryptoChart from '@/components/CryptoChart.vue';
  
  export default {
    components: {
      CryptoChart
    },
    setup() {
      const store = useWalletStore();
      const cryptos = ref([
        { id: 'BTC', name: 'Bitcoin', price: 0, quantity: 0 },
        { id: 'ETH', name: 'Ethereum', price: 0, quantity: 0 },
        { id: 'XRP', name: 'Ripple', price: 0, quantity: 0 },
        { id: 'LTC', name: 'Litecoin', price: 0, quantity: 0 }
      ]);
  
      const loading = ref(true);
      const balance = computed(() => store.balance);
  
      const showModal = ref(false);
      const selectedCrypto = ref({});
      const selectedAction = ref('');
      const selectedQuantity = ref(0);
      const message = ref('');
  
      const calculatedTotal = computed(() => {
        return (selectedQuantity.value || 0) * (selectedCrypto.value.price || 0);
      });
  
      const fetchPrices = async () => {
        try {
          const prices = await fetchCryptoPrices();
          cryptos.value.forEach(crypto => {
            crypto.price = prices[crypto.id.toLowerCase()] || 0;
            const stored = store.cryptocurrencies.find(c => c.id === crypto.id);
            crypto.quantity = stored ? stored.quantity : 0;
          });
          loading.value = false;
        } catch (err) {
          console.error('Failed to fetch prices:', err);
        }
      };
  
      const openTrade = (crypto, action) => {
        selectedCrypto.value = crypto;
        selectedAction.value = action;
        selectedQuantity.value = 0;
        message.value = '';
        showModal.value = true;
      };
  
      const confirmTrade = () => {
        const quantity = parseFloat(selectedQuantity.value);
        const total = quantity * selectedCrypto.value.price;
  
        if (isNaN(quantity) || quantity <= 0) {
          message.value = 'Invalid quantity.';
          return;
        }
  
        if (selectedAction.value === 'buy') {
          if (total > balance.value) {
            message.value = 'Insufficient balance.';
            return;
          }
        }
  
        if (selectedAction.value === 'sell') {
          const holding = store.cryptocurrencies.find(c => c.id === selectedCrypto.value.id);
          if (!holding || holding.quantity < quantity) {
            message.value = 'Not enough crypto to sell.';
            return;
          }
        }
  
        store.addTransaction({
          type: selectedAction.value,
          cryptoId: selectedCrypto.value.id,
          quantity,
          total
        });
  
        showModal.value = false;
        fetchPrices(); // Update the quantities
      };
  
      const closeModal = () => {
        showModal.value = false;
      };
  
      onMounted(fetchPrices);
  
      return {
        cryptos,
        loading,
        balance,
        showModal,
        selectedCrypto,
        selectedAction,
        selectedQuantity,
        calculatedTotal,
        openTrade,
        confirmTrade,
        closeModal,
        message
      };
    }
  };
  </script>
  
  <style scoped>
  .trade-view {
    text-align: center;
  }
  .crypto-list {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
  }
  .crypto-item {
    border: 1px solid #c9c9c981;
    background-color: #576283;
    padding: 15px;
    margin: 15px;
    border-radius: 10px;
  }
  .chart-section {
    margin-top: 40px;
    padding: 0px;
    background: #1f1f2f;
    border-radius: 10px;
    color: rgb(245, 245, 245);
    margin: 50px;
  }
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal-content {
    background: #8c93b1;
    padding: 20px;
    border-radius: 8px;
    text-align: left;
  }
  .modal-buttons {
    margin-top: 10px;
    display: flex;
    gap: 10px;
  }
  .message {
    color: red;
  }
  button {
    background-color: #475272;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  button:disabled {
    background-color: #aaa;
  }
  </style>
  