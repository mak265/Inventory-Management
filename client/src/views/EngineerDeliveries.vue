<template>
  <div class="page-container">
    <Navbar />

    <div class="container mx-auto px-6">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 tracking-tight">Project Deliveries</h1>
          <p class="text-gray-500 mt-1">Delivery status for your assigned projects</p>
        </div>
        <div class="flex gap-2">
          <button @click="fetchDeliveries" class="btn-secondary">Refresh</button>
          <button @click="$router.push('/engineer-order')" class="btn-primary shadow-lg shadow-blue-500/30">
            Order Materials
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="order in deliveries" :key="order._id" class="card">
          <div class="flex flex-col md:flex-row justify-between gap-4">
            <div class="flex-grow">
              <div class="flex justify-between items-start">
                <div>
                  <div class="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    Order #{{ order._id.slice(-6).toUpperCase() }}
                  </div>
                  <div class="text-lg font-bold text-gray-800">
                    {{ order.project?.name || 'Unassigned Project' }}
                  </div>
                  <div class="text-sm text-gray-500">{{ order.project?.location || '' }}</div>
                </div>
                <div class="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full border"
                  :class="{
                    'bg-yellow-50 text-yellow-700 border-yellow-100': order.status === 'pending',
                    'bg-blue-50 text-blue-700 border-blue-100': order.status === 'confirmed' || order.status === 'out_for_delivery',
                    'bg-purple-50 text-purple-700 border-purple-100': order.status === 'ready_for_pickup',
                    'bg-green-50 text-green-700 border-green-100': order.status === 'completed',
                    'bg-red-50 text-red-700 border-red-100': order.status === 'cancelled'
                  }"
                >
                  {{ formatStatus(order.status) }}
                </div>
              </div>

              <div class="mt-4 text-sm text-gray-600">
                <div v-if="order.deliveryAddress"><span class="font-bold">Address:</span> {{ order.deliveryAddress }}</div>
                <div v-if="order.assignedTo?.email"><span class="font-bold">Delivery Personnel:</span> {{ order.assignedTo.email }}</div>
                <div class="text-xs text-gray-400 mt-1">{{ new Date(order.createdAt).toLocaleString() }}</div>
              </div>
            </div>

            <div class="min-w-[220px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
              <div class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Items</div>
              <div v-for="itemObj in order.items" :key="itemObj._id" class="flex justify-between text-sm py-1">
                <span class="text-gray-700">{{ itemObj.item?.name || 'Unknown Item' }}</span>
                <span class="font-bold text-gray-900">{{ itemObj.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="deliveries.length === 0" class="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-400">
          No delivery orders found for your projects.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import Navbar from '../components/Navbar.vue';

const deliveries = ref([]);

const fetchDeliveries = async () => {
  try {
    const res = await api.getOrders({ view: 'deliveries' });
    deliveries.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const formatStatus = (status) => {
  const map = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    ready_for_pickup: 'Ready for Pickup',
    out_for_delivery: 'Out for Delivery',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return map[status] || status;
};

onMounted(() => {
  fetchDeliveries();
});
</script>
