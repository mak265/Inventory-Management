<template>
  <div class="page-container">
    <Navbar />

    <div class="container mx-auto px-6">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 tracking-tight">Order Management</h1>
          <p class="text-gray-500 mt-1">Process and fulfill incoming requests</p>
        </div>
        <div class="flex gap-2">
           <button @click="filter = 'all'" :class="filter === 'all' ? 'btn-primary' : 'btn-secondary'">All</button>
           <button @click="filter = 'pending'" :class="filter === 'pending' ? 'btn-primary' : 'btn-secondary'">Pending</button>
           <button @click="filter = 'active'" :class="filter === 'active' ? 'btn-primary' : 'btn-secondary'">Active</button>
        </div>
      </div>

      <div class="space-y-6">
        <!-- Debug Info (Temporary) -->
        <div v-if="orders.length > 0" class="text-xs text-gray-400 text-center mb-4">
           Showing {{ filteredOrders.length }} of {{ orders.length }} total orders
        </div>

        <div v-for="order in filteredOrders" :key="order._id" class="card border-l-4"
             :class="{
               'border-yellow-400': order.status === 'pending',
               'border-blue-500': order.status === 'confirmed' || order.status === 'processing',
               'border-purple-500': order.status === 'ready_for_pickup' || order.status === 'out_for_delivery',
               'border-green-500': order.status === 'completed',
               'border-red-500': order.status === 'cancelled'
             }"
        >
          <div class="flex flex-col lg:flex-row justify-between gap-6">
             <!-- Order Info -->
             <div class="flex-grow">
               <div class="flex justify-between items-start mb-2">
                 <h3 class="text-lg font-bold text-gray-800">Order #{{ order._id.slice(-6).toUpperCase() }}</h3>
                 <span class="text-sm text-gray-500">{{ new Date(order.createdAt).toLocaleString() }}</span>
               </div>
               <div class="flex items-center gap-4 mb-4 text-sm">
                  <span class="flex items-center text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {{ order.user?.email }}
                  </span>
                  <span v-if="order.project?.name" class="flex items-center text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {{ order.project.name }}
                  </span>
                  <span class="flex items-center" :class="order.type === 'pickup' ? 'text-blue-600' : 'text-green-600'">
                    <svg v-if="order.type === 'pickup'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                    {{ order.type === 'pickup' ? 'Pickup' : 'Delivery' }}
                  </span>
               </div>
               
               <div class="bg-gray-50 rounded-lg p-3 mb-4">
                 <div v-for="itemObj in order.items" :key="itemObj._id" class="flex justify-between text-sm py-1">
                   <span>{{ itemObj.item?.name }}</span>
                   <span class="font-bold">{{ itemObj.quantity }} {{ itemObj.item?.unit }}</span>
                 </div>
               </div>

               <div v-if="order.type === 'delivery'" class="text-sm text-gray-600 mb-2">
                 <span class="font-bold">Address:</span> {{ order.deliveryAddress }}
               </div>
               <div v-if="order.notes" class="text-sm text-gray-600">
                 <span class="font-bold">Notes:</span> {{ order.notes }}
               </div>
             </div>

             <!-- Actions -->
             <div class="flex flex-col gap-2 min-w-[200px] border-l pl-6 border-gray-100 justify-center">
                <div class="mb-2 text-center">
                  <span class="text-xs font-bold uppercase text-gray-400">Current Status</span>
                  <div class="font-bold text-gray-800">{{ formatStatus(order.status) }}</div>
                </div>

                <div v-if="order.status === 'pending'" class="flex flex-col gap-2">
                   <button @click="updateStatus(order._id, 'confirmed')" class="btn-primary w-full bg-blue-600 hover:bg-blue-700 text-sm">Confirm Order</button>
                   <button @click="updateStatus(order._id, 'cancelled')" class="btn-secondary w-full text-red-600 hover:bg-red-50 text-sm">Cancel</button>
                </div>

                <div v-if="order.status === 'confirmed'" class="flex flex-col gap-2">
                   <button v-if="order.type === 'pickup'" @click="updateStatus(order._id, 'ready_for_pickup')" class="btn-primary w-full bg-purple-600 hover:bg-purple-700 text-sm">Ready for Pickup</button>
                   <div v-else class="flex flex-col gap-2">
                       <select v-model="order.selectedDeliveryGuy" class="input-field text-sm p-2">
                           <option value="" disabled selected>Select Delivery Personnel</option>
                           <option v-for="user in deliveryUsers" :key="user._id" :value="user._id">
                               {{ user.email }}
                           </option>
                       </select>
                       <button 
                           @click="assignDelivery(order)" 
                           :disabled="!order.selectedDeliveryGuy"
                           class="btn-primary w-full bg-purple-600 hover:bg-purple-700 text-sm disabled:opacity-50"
                        >
                           Assign & Out for Delivery
                       </button>
                   </div>
                </div>

                <div v-if="order.status === 'ready_for_pickup' || order.status === 'out_for_delivery'" class="flex flex-col gap-2">
                   <button @click="updateStatus(order._id, 'completed')" class="btn-primary w-full bg-green-600 hover:bg-green-700 text-sm">Mark Completed</button>
                </div>
             </div>
          </div>
        </div>
        
        <div v-if="filteredOrders.length === 0" class="text-center py-12 text-gray-400">
          No orders found.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import Navbar from '../components/Navbar.vue';

const orders = ref([]);
const deliveryUsers = ref([]);
const filter = ref('active'); // all, pending, active

const fetchOrders = async () => {
  try {
    const [ordersRes, usersRes] = await Promise.all([
        api.getOrders(),
        api.getUsers() // We need to fetch users to find delivery guys
    ]);
    
    orders.value = ordersRes.data;
    // Filter users to only show delivery personnel
    deliveryUsers.value = usersRes.data.filter(u => u.role === 'delivery');
  } catch (err) {
    console.error(err);
  }
};

const assignDelivery = async (order) => {
    if (!order.selectedDeliveryGuy) return;
    try {
        // Update status to 'out_for_delivery' AND assign the user
        await api.updateOrderStatus(order._id, 'out_for_delivery', order.selectedDeliveryGuy);
        
        // Optimistic update
        order.status = 'out_for_delivery';
        order.assignedTo = deliveryUsers.value.find(u => u._id === order.selectedDeliveryGuy);
        alert('Delivery assigned successfully!');
    } catch (err) {
        console.error(err);
        alert('Failed to assign delivery');
    }
};

const updateStatus = async (id, status) => {
  // Only ask for confirmation for cancellation or completion to avoid friction
  if (['cancelled', 'completed'].includes(status)) {
    if (!confirm(`Are you sure you want to mark this order as ${status}?`)) return;
  }
  
  try {
    await api.updateOrderStatus(id, status);
    // Optimistic update or fetch
    const order = orders.value.find(o => o._id === id);
    if (order) order.status = status;
    // fetchOrders(); // Optional: fetch to be sure
  } catch (err) {
    console.error(err);
    alert('Failed to update status: ' + (err.response?.data?.message || err.message));
  }
};

const searchQuery = ref('');

const filteredOrders = computed(() => {
  let result = orders.value;

  // 1. Status Filter
  if (filter.value === 'pending') {
    result = result.filter(o => o.status === 'pending');
  } else if (filter.value === 'active') {
    result = result.filter(o => !['completed', 'cancelled'].includes(o.status));
  }

  // 2. Search Filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(o => 
      o._id.toLowerCase().includes(q) || 
      (o.user?.email || '').toLowerCase().includes(q) ||
      (o.project?.name || '').toLowerCase().includes(q) ||
      o.items.some(i => (i.item?.name || '').toLowerCase().includes(q))
    );
  }

  return result;
});

const formatStatus = (status) => {
  const map = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'ready_for_pickup': 'Ready for Pickup',
    'out_for_delivery': 'Out for Delivery',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };
  return map[status] || status;
};

onMounted(() => {
  fetchOrders();
});
</script>
