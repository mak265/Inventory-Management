<template>
  <div class="page-container">
    <Navbar />

    <div class="container mx-auto px-6">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 tracking-tight">Transaction Records</h1>
          <p class="text-gray-500 mt-1">History of all stock movements and adjustments</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Type</label>
            <select v-model="filters.type" class="input-field">
              <option value="">All Types</option>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Start Date</label>
            <input type="date" v-model="filters.startDate" class="input-field" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">End Date</label>
            <input type="date" v-model="filters.endDate" class="input-field" />
          </div>
          <div class="flex gap-2">
            <button @click="fetchTransactions" class="btn-primary flex-1 flex items-center justify-center">
              Filter
            </button>
            <button @click="resetFilters" class="btn-secondary px-3" title="Reset">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="mb-6 relative">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by Item Name, Project, User, or OR Number..." 
          class="input-field pl-10"
        />
      </div>

      <div class="card p-0 overflow-hidden shadow-lg border-0">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="t in filteredTransactions" :key="t._id" class="hover:bg-blue-50/30 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ new Date(t.date).toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide"
                    :class="{
                      'bg-green-100 text-green-800': t.type === 'in',
                      'bg-blue-100 text-blue-800': t.type === 'out',
                      'bg-yellow-100 text-yellow-800': t.type === 'adjustment'
                    }"
                  >
                    {{ t.type === 'in' ? 'Stock In' : t.type === 'out' ? 'Stock Out' : 'Adjustment' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                  {{ t.item?.name || 'Deleted Item' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-bold" :class="t.type === 'in' ? 'text-green-600' : t.type === 'out' ? 'text-blue-600' : 'text-yellow-600'">
                  {{ t.type === 'in' ? '+' : t.type === 'out' ? '-' : '' }}{{ t.quantity }} {{ t.unit }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  <div v-if="t.type === 'in'">
                    Supplier: {{ t.supplier || 'N/A' }}
                  </div>
                  <div v-else-if="t.type === 'out'">
                    Project: <span class="font-medium">{{ t.project?.name || 'N/A' }}</span><br/>
                    <span v-if="t.requestedBy" class="text-xs text-gray-500">Req: {{ t.requestedBy }}</span>
                    <div v-if="t.isPaid" class="mt-1">
                      <span class="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-medium">Paid</span>
                      <span v-if="t.orNumber" class="text-xs ml-1 text-gray-500">OR: {{ t.orNumber }}</span>
                    </div>
                    <div v-else class="mt-1">
                      <span class="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded font-medium">Unpaid</span>
                    </div>
                  </div>
                  <div v-else-if="t.type === 'adjustment'">
                    Reason: {{ t.reason }}<br/>
                    <span class="text-xs text-gray-400">{{ t.previousQuantity }} → {{ t.newQuantity }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ t.user?.email }}
                </td>
              </tr>
              <tr v-if="filteredTransactions.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                  No transactions found matching criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import Navbar from '../components/Navbar.vue';

const transactions = ref([]);
const searchQuery = ref('');
const filters = ref({
  type: '',
  startDate: '',
  endDate: ''
});

const fetchTransactions = async () => {
  try {
    const response = await api.getTransactions({ ...filters.value });
    transactions.value = response.data;
  } catch (err) {
    console.error(err);
    alert('Failed to fetch transactions');
  }
};

const resetFilters = () => {
  filters.value = {
    type: '',
    startDate: '',
    endDate: ''
  };
  searchQuery.value = '';
  fetchTransactions();
};

const filteredTransactions = computed(() => {
  if (!searchQuery.value) return transactions.value;
  const q = searchQuery.value.toLowerCase();
  return transactions.value.filter(t => 
    t.item?.name.toLowerCase().includes(q) ||
    t.project?.name.toLowerCase().includes(q) ||
    t.user?.email.toLowerCase().includes(q) ||
    (t.orNumber && t.orNumber.toLowerCase().includes(q))
  );
});

onMounted(() => {
  fetchTransactions();
});
</script>
