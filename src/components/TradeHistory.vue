<template>
  <div class="history-container">
    <h1>Transaction History</h1>

    <div v-if="transactions.length === 0">
      <p>You have not made any transactions yet.</p>
    </div>

    <div v-else class="transaction-list">
      <transition-group name="fade" tag="div">
        <div
          v-for="(transaction, index) in transactions"
          :key="transaction._id"
          class="transaction-card"
          :class="transaction.action === 'purchase' ? 'buy' : 'sell'"
          @click="selectTransaction(transaction)"
        >
          <div class="transaction-info">
            <h3>{{ transaction.crypto_code }}</h3>
            <p>{{ transaction.crypto_amount }} units</p>
            <p>Total: ${{ transaction.money.toFixed(2) }}</p>
            <p class="date-time">📅 {{ new Date(transaction.datetime).toLocaleString() }}</p>
            <span class="type-label">{{ transaction.action === 'purchase' ? '🟢 Buy' : '🔴 Sell' }}</span>
          </div>

          <div class="actions">
            <button @click.stop="startEdit(index)" class="btn edit">✏️Edit</button>
            <button @click.stop="askDeleteConfirmation(transaction, index)" class="btn delete">🗑️Delete</button>
          </div>
        </div>
      </transition-group>
    </div>

    <div v-if="editingTransaction" class="edit-section">
      <h3>EDIT TRANSACTION</h3>
      <p><strong>Crypto:</strong> {{ editingTransaction.crypto_code }}</p>
      <label>Amount:</label>
      <input v-model.number="editQuantity" type="number" min="0.0001" step="0.0001" />
      <p>Total: ${{ newTotal.toFixed(2) }}</p>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <button class="btn save" @click="saveEdit">💾 Save</button>
      <button class="btn cancel" @click="cancelEdit">❌ Cancel</button>
    </div>
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal">
        <p>Are you sure you want to delete this transaction?</p>
        <div class="modal-buttons">
          <button @click="confirmDelete" class="btn delete">Yes, Delete</button>
          <button @click="cancelDelete" class="btn cancel">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const API_URL = "https://laboratorio3-f36a.restdb.io/rest/transactions";
const API_KEY = "60eb09146661365596af552f";
const userId = localStorage.getItem("userId");

const transactions = ref([]);
const prices = ref({});
const editingTransaction = ref(null);
const editQuantity = ref(0);
const errorMessage = ref(null);
const selectedTransaction = ref(null);

const showConfirmModal = ref(false);
const transactionToDelete = ref(null);
const deleteIndex = ref(null);

const symbolToId = {
  btc: 'bitcoin',
  eth: 'ethereum',
  ltc: 'litecoin',
};

const newTotal = computed(() => {
  if (!editingTransaction.value) return 0;
  const cryptoId = symbolToId[editingTransaction.value.crypto_code.toLowerCase()];
  return editQuantity.value * (prices.value[cryptoId]?.usd || 0);
});

const cargarHistorial = async () => {
  try {
    const res = await axios.get(`${API_URL}?q={"user_id":"${userId}"}`, {
      headers: { 'x-apikey': API_KEY }
    });
    transactions.value = res.data;
  } catch (err) {
    console.error("Error cargando historial:", err);
  }
};

const obtenerPrecios = async () => {
  try {
    const res = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,xrp,litecoin&vs_currencies=usd");
    prices.value = res.data;
  } catch (err) {
    console.error("Error to get prices:", err);
  }
};

const selectTransaction = (tx) => {
  selectedTransaction.value = tx;
  editingTransaction.value = null;
};

const startEdit = (index) => {
  const tx = transactions.value[index];
  const cryptoId = tx.crypto_code.toLowerCase();
  const precio = prices.value[cryptoId]?.usd || 0;

  editingTransaction.value = { ...tx };
  editQuantity.value = tx.crypto_amount;
  errorMessage.value = null;
};

const saveEdit = async () => {
  if (!editingTransaction.value) return;

  const symbol = editingTransaction.value.crypto_code.toLowerCase();
  const action = editingTransaction.value.action;
  const newAmount = parseFloat(editQuantity.value);
  const newMoney = parseFloat(newTotal.value.toFixed(2));

  let tempBalance = 10000;
  const tempHoldings = { btc: 0, eth: 0, ltc: 0, xrp: 0 };

  transactions.value.forEach(tx => {
    if (tx._id === editingTransaction.value._id) return;

    const sym = tx.crypto_code.toLowerCase();
    const amount = parseFloat(tx.crypto_amount);
    const money = parseFloat(tx.money);

    if (tx.action === 'purchase') {
      tempHoldings[sym] += amount;
      tempBalance -= money;
    } else {
      tempHoldings[sym] -= amount;
      tempBalance += money;
    }
  });

  if (action === 'purchase' && newMoney > tempBalance) {
    errorMessage.value = "❌ Insufficient balance for this purchase.";
    return;
  }

  if (action === 'sale' && newAmount > tempHoldings[symbol]) {
    errorMessage.value = "❌ You don't have enough crypto to sell.";
    return;
  }

  const updated = {
    ...editingTransaction.value,
    crypto_amount: newAmount,
    money: newMoney
  };

  try {
    await axios.put(`${API_URL}/${updated._id}`, updated, {
      headers: {
        'x-apikey': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const index = transactions.value.findIndex(t => t._id === updated._id);
    if (index !== -1) transactions.value[index] = updated;

    editingTransaction.value = null;
    errorMessage.value = null;
  } catch (err) {
    console.error('Error save edit:', err);
    errorMessage.value = "Error updating transaction.";
  }
};


const cancelEdit = () => {
  editingTransaction.value = null;
  errorMessage.value = null;
};

const askDeleteConfirmation = (tx, index) => {
  transactionToDelete.value = tx;
  deleteIndex.value = index;
  showConfirmModal.value = true;
};

const confirmDelete = async () => {
  try {
    await axios.delete(`${API_URL}/${transactionToDelete.value._id}`, {
      headers: { 'x-apikey': API_KEY }
    });
    transactions.value.splice(deleteIndex.value, 1);
  } catch (err) {
    console.error('Error al eliminar:', err);
  } finally {
    showConfirmModal.value = false;
    transactionToDelete.value = null;
  }
};

const cancelDelete = () => {
  showConfirmModal.value = false;
  transactionToDelete.value = null;
};

onMounted(async () => {
  await obtenerPrecios();
  await cargarHistorial();
});
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(20, 20, 30, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: #2a2a3f;
  padding: 20px 30px;
  border-radius: 12px;
  text-align: center;
  color: #fff;
}

.modal-buttons {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn.cancel {
  background-color: #777;
  color: white;
}
</style>