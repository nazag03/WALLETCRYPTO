<template>
  <div class="login-container">
    <h1>Welcome to CryptoWallet</h1>
    <h2>Invest your money💸</h2>
    <h3>{{ isRegistering ? 'Create account' : 'Login' }}</h3>

    <form @submit.prevent="submitForm">
      <div v-if="isRegistering">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <input v-model="confirmPassword" type="password" placeholder="Confirm Password" required />
        <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
        <p v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</p>
      </div>
      <div v-else>
        <input v-model="userId" type="text" placeholder="User ID" required />
      </div>

      <button type="submit">{{ isRegistering ? 'Register' : 'Login' }}</button>
    </form>

    <p @click="toggleMode" class="toggle">
      {{ isRegistering ? 'Already have an account? Sign in' : 'Don\'t have an account? Sign up' }}
    </p>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ modalTitle }}</h3>
        <p>{{ modalMessage }}</p>
        <button @click="showModal = false">Accept</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useWalletStore } from '@/store/useWalletStore';

export default {
  setup() {
    const router = useRouter();
    const walletStore = useWalletStore();

    const isRegistering = ref(false);
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const userId = ref('');

    const passwordError = ref('');
    const confirmPasswordError = ref('');
    const showModal = ref(false);
    const modalTitle = ref('');
    const modalMessage = ref('');

    const submitForm = () => {
  passwordError.value = '';
  confirmPasswordError.value = '';

  if (isRegistering.value) {
  if (password.value.length < 8) {
    passwordError.value = 'The password must be at least 8 characters long.';
    return;
  }
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match.';
    return;
  }

  const newUserId = crypto.randomUUID();
  const user = {
    email: email.value,
    password: password.value,
    userId: newUserId
  };

  localStorage.setItem(newUserId, JSON.stringify(user));
  localStorage.setItem("userId", newUserId); 
  walletStore.setUser(newUserId);

  const existingIds = JSON.parse(localStorage.getItem("registeredUserIds")) || [];
  existingIds.push(newUserId);
  localStorage.setItem("registeredUserIds", JSON.stringify(existingIds));

  modalTitle.value = 'Successful registration';
  modalMessage.value = `Your ID: ${newUserId}`;
  showModal.value = true;

  isRegistering.value = false;
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
}
 else {
    const storedUser = localStorage.getItem(userId.value);
    if (storedUser) {
      walletStore.setUser(userId.value);
      router.push('/trade');
    } else {
      modalTitle.value = 'Invalid ID';
      modalMessage.value = 'The entered ID does not exist. Please check or register.';
      showModal.value = true;
    }
  }
};


    const toggleMode = () => {
      isRegistering.value = !isRegistering.value;
    };

    return {
      isRegistering,
      email,
      password,
      confirmPassword,
      userId,
      passwordError,
      confirmPasswordError,
      submitForm,
      toggleMode,
      walletStore,
      showModal,
      modalTitle,
      modalMessage
    };
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: auto;
  padding: 30px;
  background-color: #25314f;
  border-radius: 10px;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px 0;
}

input {
  padding: 12px;
  border: 1px solid #f5f2f2;
  border-radius: 6px;
  background-color: transparent;
  color: #fdfdfd;
  font-size: 16px;
  margin-bottom: 10px;
}

input:focus {
  outline: none;
  box-shadow: 0px 0px 5px rgba(7, 2, 2, 0.7);
}

button {
  padding: 12px;
  background-color: #3c79e4;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease-in-out;
}

button:hover {
  background-color: #255bb8;
}

.toggle {
  color: #fafafa;
  cursor: pointer;
  font-size: 14px;
  margin-top: 15px;
  transition: color 0.3s ease-in-out;
}

.toggle:hover {
  color: #e6e6e6;
}

.error-message {
  color: #ff6b6b;
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(60, 63, 80, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background-color: rgb(102, 110, 141);
  padding: 20px 30px;
  border-radius: 10px;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(60, 82, 145, 0.3);
}
</style>
