<template>
  <div class="trade-crypto">
    <h1>Buying and Selling Cryptos</h1>
    <p>Available balance: ${{ balance.toFixed(2) }} USD</p>

    <div v-if="loading">Loading prices...</div>

    <div v-else class="crypto-list">
      <div v-for="crypto in cryptocurrencies" :key="crypto.id" class="crypto-item">
        <h2>{{ crypto.name }} ({{ crypto.id.toUpperCase() }})</h2>
        <p>Current price: ${{ crypto.price.toFixed(2) }}</p>
        <button @click="openTrade(crypto, 'buy')">Buy</button>
        <button @click="openTrade(crypto, 'sell')" :disabled="crypto.quantity <= 0">Sell</button>
        <p v-if="crypto.quantity > 0">You have: {{ crypto.quantity }} {{ crypto.id.toUpperCase() }}</p>
      </div>
    </div>

    <div class="chart-section">
      <h2>📊 Crypto Price Trends</h2>
      <CryptoChart title="Bitcoin (BTC)" :dataPoints="[30000, 30600, 31000, 31200, 31800, 32000]" />
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

<script setup>
import { ref, computed, onMounted } from 'vue';
import CryptoChart from '@/components/CryptoChart.vue';
import axios from 'axios';

const API_URL = "https://laboratorio3-f36a.restdb.io/rest/transactions";
const API_KEY = "60eb09146661365596af552f";

const userId = localStorage.getItem("userId");

const loading = ref(true);
const balance = ref(10000);
const cryptocurrencies = ref([]);

const showModal = ref(false);
const selectedCrypto = ref({});
const selectedAction = ref('');
const selectedQuantity = ref(0);
const message = ref('');

const calculatedTotal = computed(() =>
  (selectedQuantity.value || 0) * (selectedCrypto.value.price || 0)
);

const fetchData = async () => {
  loading.value = true;
  try {
    const priceRes = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,xrp,litecoin&vs_currencies=usd');
    const priceData = priceRes.data;

    const cryptos = [
      { id: 'btc', name: 'Bitcoin', quantity: 0, price: priceData.bitcoin?.usd || 0 },
      { id: 'eth', name: 'Ethereum', quantity: 0, price: priceData.ethereum?.usd || 0 },
      { id: 'ltc', name: 'Litecoin', quantity: 0, price: priceData.litecoin?.usd || 0 },
    ];

    const txRes = await axios.get(`${API_URL}?q={"user_id":"${userId}"}`, {
      headers: { "x-apikey": API_KEY }
    });

    const txs = txRes.data;
    let total = 10000;

    txs.forEach(tx => {
      const id = tx.crypto_code.toLowerCase();
      const crypto = cryptos.find(c => c.id === id);
      if (!crypto) return;

      if (tx.action === 'purchase') {
        crypto.quantity += tx.crypto_amount;
        total -= tx.money;
      } else if (tx.action === 'sale') {
        crypto.quantity -= tx.crypto_amount;
        total += tx.money;
      }
    });

    cryptocurrencies.value = cryptos;
    balance.value = total;
  } catch (error) {
    console.log("Error to load cryptos", error)
  } finally {
    loading.value = false;
  }
};

const openTrade = (crypto, action) => {
  selectedCrypto.value = crypto;
  selectedAction.value = action;
  selectedQuantity.value = 0;
  message.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const confirmTrade = async () => {
  const quantity = parseFloat(selectedQuantity.value);
  const total = quantity * selectedCrypto.value.price;

  if (!userId) {
    message.value = "No user ID found.";
    return;
  }

  if (isNaN(quantity) || quantity <= 0) {
    message.value = "Invalid quantity.";
    return;
  }

  if (selectedAction.value === 'buy' && total > balance.value) {
    message.value = "Insufficient balance.";
    return;
  }

  if (selectedAction.value === 'sell' && quantity > selectedCrypto.value.quantity) {
    message.value = "Insufficient crypto quantity.";
    return;
  }

  const transaction = {
    user_id: userId,
    action: selectedAction.value === "buy" ? "purchase" : "sale",
    crypto_code: selectedCrypto.value.id,
    crypto_amount: quantity,
    money: parseFloat(total.toFixed(2)),
    datetime: new Date().toISOString()
  };

  try {
    await axios.post(API_URL, transaction, {
      headers: {
        "x-apikey": API_KEY,
        "Content-Type": "application/json"
      }
    });
    closeModal();
    await fetchData();
  } catch (err) {
    console.error("Error saving transaction:", err);
    message.value = "Error saving transaction.";
  }
};

onMounted(fetchData);
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
