<template>
    <div class="modal-overlay">
      <div class="modal">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <button @click="$emit('close')">Acept</button>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps(['title', 'message']);
  </script>
  
  <style scoped>
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
  
  .modal h3 {
    margin-bottom: 10px;
  }
  
  .modal p {
    margin-bottom: 20px;
  }
  
  .modal button {
    padding: 10px 20px;
    background-color: #3c79e4;
    color: rgb(255, 255, 255);
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  
  .modal button:hover {
    background-color: #255bb8;
  }
  </style>
  