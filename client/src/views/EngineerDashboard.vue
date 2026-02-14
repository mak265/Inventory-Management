<template>
  <div class="page-container">
    <Navbar />

    <div class="container mx-auto px-6">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 tracking-tight">Engineer Dashboard</h1>
          <p class="text-gray-500 mt-1">Projects, orders, and deliveries assigned to you</p>
        </div>
        <div class="flex gap-3">
          <button @click="$router.push('/engineer-order')" class="btn-primary shadow-lg shadow-blue-500/30">
            Order Materials
          </button>
          <button @click="$router.push('/project-deliveries')" class="btn-secondary">
            View Deliveries
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card">
          <div class="text-xs font-bold text-gray-500 uppercase mb-2">Assigned Projects</div>
          <div class="text-4xl font-extrabold text-gray-800">{{ projects.length }}</div>
        </div>
        <div class="card">
          <div class="text-xs font-bold text-gray-500 uppercase mb-2">Active Deliveries</div>
          <div class="text-4xl font-extrabold text-gray-800">{{ activeDeliveriesCount }}</div>
        </div>
        <div class="card">
          <div class="text-xs font-bold text-gray-500 uppercase mb-2">My Recent Orders</div>
          <div class="text-4xl font-extrabold text-gray-800">{{ recentOrdersCount }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-gray-800">My Projects</h2>
            <button @click="fetchData" class="text-sm font-bold text-blue-600 hover:text-blue-800">Refresh</button>
          </div>
          <div class="space-y-3">
            <button
              v-for="p in projects"
              :key="p._id"
              class="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
              @click="$router.push(`/projects/${p._id}`)"
            >
              <div class="font-bold text-gray-800">{{ p.name }}</div>
              <div class="text-sm text-gray-500">{{ p.location }}</div>
            </button>
            <div v-if="projects.length === 0" class="text-gray-400 text-sm text-center py-8">
              No assigned projects yet.
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-gray-800">Latest Deliveries</h2>
            <button @click="$router.push('/project-deliveries')" class="text-sm font-bold text-blue-600 hover:text-blue-800">
              Open
            </button>
          </div>
          <div class="space-y-3">
            <div
              v-for="o in latestDeliveries"
              :key="o._id"
              class="p-4 rounded-xl border border-gray-100"
            >
              <div class="flex justify-between items-start gap-4">
                <div>
                  <div class="font-bold text-gray-800">Order #{{ o._id.slice(-6).toUpperCase() }}</div>
                  <div class="text-sm text-gray-500">{{ o.project?.name || 'Unassigned Project' }}</div>
                  <div class="text-sm text-gray-500" v-if="o.deliveryAddress">{{ o.deliveryAddress }}</div>
                </div>
                <div class="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full border"
                  :class="{
                    'bg-yellow-50 text-yellow-700 border-yellow-100': o.status === 'pending',
                    'bg-blue-50 text-blue-700 border-blue-100': o.status === 'confirmed' || o.status === 'out_for_delivery',
                    'bg-purple-50 text-purple-700 border-purple-100': o.status === 'ready_for_pickup',
                    'bg-green-50 text-green-700 border-green-100': o.status === 'completed',
                    'bg-red-50 text-red-700 border-red-100': o.status === 'cancelled'
                  }"
                >
                  {{ formatStatus(o.status) }}
                </div>
              </div>
            </div>
            <div v-if="latestDeliveries.length === 0" class="text-gray-400 text-sm text-center py-8">
              No deliveries yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import Navbar from '../components/Navbar.vue';

const projects = ref([]);
const deliveries = ref([]);
const orders = ref([]);

const fetchData = async () => {
  try {
    const [projectsRes, deliveriesRes, ordersRes] = await Promise.all([
      api.getProjects(),
      api.getOrders({ view: 'deliveries' }),
      api.getOrders({ view: 'mine' })
    ]);
    projects.value = projectsRes.data;
    deliveries.value = deliveriesRes.data;
    orders.value = ordersRes.data;
  } catch (err) {
    console.error(err);
  }
};

const activeDeliveriesCount = computed(() => {
  return deliveries.value.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
});

const recentOrdersCount = computed(() => {
  return orders.value.slice(0, 5).length;
});

const latestDeliveries = computed(() => {
  return deliveries.value.slice(0, 5);
});

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
  fetchData();
});
</script>
