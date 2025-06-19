<template>
    <div class="history-container">
      <h1>Transaction History</h1>
  
      <div v-if="walletStore.transactions.length === 0">
        <p>You have not made any transactions yet.</p>
      </div>
  
      <div v-else class="transaction-list">
        <transition-group name="fade" tag="div">
          <div
            v-for="transaction in walletStore.transactions"
            :key="transaction.transactionId"
            class="transaction-card"
            :class="transaction.type"
            @click="selectTransaction(transaction)"
          >
            <div class="transaction-info">
              <h3>{{ transaction.cryptoName }}</h3>
              <p>{{ transaction.quantity }} units</p>
              <p>Total: ${{ transaction.total ? transaction.total.toFixed(2) : '0.00' }}</p>
              <p class="date-time">📅 {{ transaction.dateTime }}</p>
              <span class="type-label">{{ transaction.type === 'buy' ? '🟢 Buy' : '🔴 Sell' }}</span>
            </div>
  
            <div class="actions">
              <button @click.stop="startEdit(transaction)" class="btn edit">✏️Edit</button>
              <button @click.stop="deleteTransaction(transaction)" class="btn delete">🗑️Delete</button>
            </div>
          </div>
        </transition-group>
      </div>
  
      <div v-if="editingTransaction" class="edit-section">
        <h3>EDIT TRANSACTION</h3>
        <p><strong>Crypto:</strong> {{ editingTransaction.cryptoName }}</p>
        <label>Amount:</label>
        <input v-model.number="editQuantity" type="number" min="0.0001" step="0.0001" />
        <p>Total: ${{ newTotal.toFixed(2) }}</p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button class="btn save" @click="saveEdit">💾 Save</button>
        <button class="btn cancel" @click="cancelEdit">❌ Cancel</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { useWalletStore } from '@/store/useWalletStore';
  
  const walletStore = useWalletStore();
  const selectedTransaction = ref(null);
  const editingTransaction = ref(null);
  const editQuantity = ref(0);
  const errorMessage = ref(null);
  
  const newTotal = computed(() => {
    if (!editingTransaction.value) return 0;
    return editQuantity.value * editingTransaction.value.price;
  });
  
  const selectTransaction = (transaction) => {
    selectedTransaction.value = transaction;
    editingTransaction.value = null;
  };
  
  const startEdit = async (transaction) => {
    await walletStore.updateCryptoPrices();
    const crypto = walletStore.cryptocurrencies.find(c => c.name === transaction.cryptoName);
    editingTransaction.value = {
      ...transaction,
      price: crypto ? crypto.price : transaction.price
    };
    editQuantity.value = transaction.quantity;
    selectedTransaction.value = null;
    errorMessage.value = null;
  };
  
  const saveEdit = async () => {
    const result = await walletStore.editTransaction({
      ...editingTransaction.value,
      quantity: editQuantity.value,
      total: newTotal.value
    });
  
    if (result.error) {
      errorMessage.value = result.errorMessage;
    } else {
      editingTransaction.value = null;
    }
  };
  
  const cancelEdit = () => {
    editingTransaction.value = null;
    errorMessage.value = null;
  };
  
  const deleteTransaction = (transaction) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
      walletStore.removeTransaction(transaction.transactionId);
      if (selectedTransaction.value?.transactionId === transaction.transactionId) {
        selectedTransaction.value = null;
      }
    }
  };
  </script>
  
  <style scoped>
  .history-container {
    padding: 20px;
  }
  .transaction-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }
  .transaction-card {
    background-color: #1e1e2f;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    transition: transform 0.3s ease, opacity 0.3s ease;
    cursor: pointer;
  }
  .transaction-card.buy {
    border-left: 5px solid #4caf50;
  }
  .transaction-card.sell {
    border-left: 5px solid #f44336;
  }
  .transaction-info h3 {
    margin: 0;
    font-size: 1.2rem;
  }
  .transaction-info p {
    margin: 4px 0;
  }
  .type-label {
    font-size: 0.9rem;
    font-weight: bold;
    opacity: 0.8;
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .btn {
    padding: 6px 10px;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
    transition: 0.2s;
  }
  .btn.edit {
    background-color: #4caf50;
    color: white;
  }
  .btn.delete {
    background-color: #f44336;
    color: white;
  }
  .btn:hover {
    opacity: 0.85;
  }
  .date-time {
    font-size: 0.85rem;
    opacity: 0.7;
  }
  .edit-section,
  .transaction-details {
    margin-top: 20px;
    padding: 15px;
    background-color: #3a3a5a;
    border-radius: 8px;
    color: white;
  }
  .error-message {
    color: red;
    font-size: 0.9rem;
    margin-top: 10px;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.4s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: scale(0.95);
  }
  </style>
  