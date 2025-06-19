<template>
  <div class="portfolio-analysis-wrapper">
    <h1>Portfolio Analysis</h1>
    <div class="portfolio-analysis">
      <h2>MY WALLET</h2>
      <p>Balance: ${{ walletStore.formattedBalance }}</p>

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
          <tr v-for="crypto in walletStore.cryptocurrencies" :key="crypto.id">
            <td>{{ crypto.name }}</td>
            <td>{{ crypto.quantity }}</td>
            <td>${{ crypto.price.toFixed(2) }}</td>
            <td>${{ (crypto.quantity * crypto.price).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useWalletStore } from '@/store/useWalletStore';
import { onMounted } from 'vue';

const walletStore = useWalletStore();

onMounted(() => {
  walletStore.updateCryptoPrices();
});
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
