<template>
  <div class="portfolio-analysis-wrapper">
    <h1>Portfolio Analysis</h1>
    <div class="portfolio-analysis">
      <h2>MY WALLET</h2>
      <p>Balance: ${{ totalBalance.toFixed(2) }}</p>

      <table>
        <thead>
          <tr>
            <th>Crypto</th>
            <th>Amount</th>
            <th>Current Price (USD)</th>
            <th>Total Value (USD)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(crypto, index) in holdings" :key="index">
            <td>{{ crypto.name }}</td>
            <td>{{ crypto.amount }}</td>
            <td>${{ crypto.price.toFixed(2) }}</td>
            <td>${{ (crypto.amount * crypto.price).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const API_URL = 'https://laboratorio3-f36a.restdb.io/rest/transactions';
const API_KEY = '60eb09146661365596af552f';

const transactions = ref([]);
const prices = ref({});
const holdings = ref([]);

const symbolToId = {
  btc: 'bitcoin',
  eth: 'ethereum',
  ltc: 'litecoin',
};

let codigoUsuarioRaw = localStorage.getItem("userId");
let userId = "";
try {
  userId = JSON.parse(codigoUsuarioRaw)?.id || codigoUsuarioRaw;
} catch {
  userId = codigoUsuarioRaw;
}

onMounted(async () => {
  if (userId) {
    await fetchTransactions();
    await fetchPrices();
    calcularHoldings();
  }
});

async function fetchTransactions() {
  try {
    const res = await axios.get(`${API_URL}?q={"user_id":"${userId}"}`, {
      headers: { "x-apikey": API_KEY }
    });
    transactions.value = res.data;
  } catch (err) {
    console.error('Error to get transactions:', err);
  }
}

async function fetchPrices() {
  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,xrp,litecoin&vs_currencies=usd');
    prices.value = res.data;
  } catch (err) {
    console.error('Error to get prices:', err);
  }
}

function calcularHoldings() {
  const wallet = {};

  for (const tx of transactions.value) {
    const symbol = tx.crypto_code.toLowerCase();
    const apiId = symbolToId[symbol];

    if (!wallet[symbol]) {
      wallet[symbol] = {
        name: symbol.toUpperCase(),
        amount: 0,
        price: prices.value[apiId]?.usd || 0,
      };
    }

    if (tx.action === 'purchase') {
      wallet[symbol].amount += tx.crypto_amount;
    } else if (tx.action === 'sale') {
      wallet[symbol].amount -= tx.crypto_amount;
    }
  }

  holdings.value = Object.values(wallet).filter(c => c.amount > 0);
}

const totalBalance = computed(() =>
  holdings.value.reduce((acc, crypto) => acc + (crypto.amount * crypto.price), 0)
);
</script>

<style scoped>
.portfolio-analysis-wrapper {
  padding: 20px;
  text-align: center;
}

h1 {
  color: #b9bbb7;
}

.portfolio-analysis {
  border: 1px solid #ababad;
  padding: 20px;
  border-radius: 8px;
  background: #2d3c5e;
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  border: 1px solid #babbbeb0;
  padding: 8px;
  text-align: center;
}

th {
  background: #6a7ba0;
}
</style>
