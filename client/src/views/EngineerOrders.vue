<template>
  <div class="page-container">
    <Navbar />

    <div class="container mx-auto px-6">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 tracking-tight">My Orders</h1>
          <p class="text-gray-500 mt-1">Orders placed for your assigned projects</p>
        </div>
        <button @click="$router.push('/engineer-order')" class="btn-primary shadow-lg shadow-blue-500/30">
          New Order
        </button>
      </div>

      <div class="space-y-6">
        <div v-for="order in orders" :key="order._id" class="card relative overflow-hidden">
          <div
            class="absolute left-0 top-0 bottom-0 w-2"
            :class="{
              'bg-yellow-400': order.status === 'pending',
              'bg-blue-500': order.status === 'confirmed' || order.status === 'processing',
              'bg-purple-500': order.status === 'ready_for_pickup' || order.status === 'out_for_delivery',
              'bg-green-500': order.status === 'completed',
              'bg-red-500': order.status === 'cancelled'
            }"
          ></div>

          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pl-4">
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wide">Order ID: {{ order._id }}</p>
              <h3 class="text-xl font-bold text-gray-800 flex items-center mt-1">
                <span v-if="order.type === 'pickup'" class="mr-2 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
                <span v-else class="mr-2 text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </span>
                {{ order.type === 'pickup' ? 'Store Pickup' : 'Delivery' }}
              </h3>
              <p class="text-sm text-gray-500 mt-1" v-if="order.project?.name">
                Project: <span class="font-bold text-gray-700">{{ order.project.name }}</span>
              </p>
            </div>
            <div class="mt-2 md:mt-0 flex flex-col items-end">
              <span class="text-sm text-gray-500">{{ new Date(order.createdAt).toLocaleDateString() }}</span>
              <span
                class="mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border"
                :class="{
                  'bg-yellow-50 text-yellow-700 border-yellow-100': order.status === 'pending',
                  'bg-blue-50 text-blue-700 border-blue-100': order.status === 'confirmed' || order.status === 'processing',
                  'bg-purple-50 text-purple-700 border-purple-100': order.status === 'ready_for_pickup' || order.status === 'out_for_delivery',
                  'bg-green-50 text-green-700 border-green-100': order.status === 'completed',
                  'bg-red-50 text-red-700 border-red-100': order.status === 'cancelled'
                }"
              >
                {{ formatStatus(order.status) }}
              </span>
            </div>
          </div>

          <div class="pl-4 border-t border-gray-100 pt-4">
            <div v-for="itemObj in order.items" :key="itemObj._id" class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <span class="font-medium text-gray-700">{{ itemObj.item?.name || 'Unknown Item' }}</span>
              <span class="font-bold text-gray-900">{{ itemObj.quantity }} {{ itemObj.item?.unit }}</span>
            </div>
          </div>

          <div class="pl-4 mt-4 pt-4 border-t border-gray-100 flex flex-col md:flex-row justify-between text-sm text-gray-600">
            <div v-if="order.type === 'delivery'">
              <span class="font-bold">Delivery Address:</span> {{ order.deliveryAddress }}
            </div>
            <div v-if="order.notes">
              <span class="font-bold">Notes:</span> {{ order.notes }}
            </div>
          </div>
        </div>

        <div v-if="orders.length === 0" class="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
          <h3 class="text-lg font-medium text-gray-900">No orders yet</h3>
          <p class="text-gray-500 mt-1 mb-6">Create your first order for an assigned project.</p>
          <button @click="$router.push('/engineer-order')" class="btn-primary">Order Materials</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import Navbar from '../components/Navbar.vue';

const orders = ref([]);

const fetchOrders = async () => {
  try {
    const response = await api.getOrders({ view: 'mine' });
    orders.value = response.data;
  } catch (err) {
    console.error(err);
  }
};

const formatStatus = (status) => {
  const map = {
    pending: 'Pending Approval',
    confirmed: 'Confirmed',
    ready_for_pickup: 'Ready for Pickup',
    out_for_delivery: 'Out for Delivery',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return map[status] || status;
};

onMounted(() => {
  fetchOrders();
});
</script>
