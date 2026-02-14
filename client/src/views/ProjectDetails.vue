<template>
  <div class="page-container">
    <Navbar />

    <div class="container mx-auto px-6">
      <div v-if="project">
        <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <div class="flex items-center gap-3">
              <button @click="$router.push('/projects')" class="text-gray-400 hover:text-blue-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 class="text-3xl font-bold text-gray-800 tracking-tight">{{ project.name }}</h1>
            </div>
            <p class="text-gray-500 mt-1 ml-9">
              {{ project.location }} | Engineer: {{ project.engineer?.email || project.manager || 'Unassigned' }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span 
              class="px-3 py-1 text-sm font-bold rounded-full uppercase tracking-wide border"
              :class="{
                'bg-green-50 text-green-700 border-green-100': project.status === 'active',
                'bg-blue-50 text-blue-700 border-blue-100': project.status === 'completed',
                'bg-yellow-50 text-yellow-700 border-yellow-100': project.status === 'on-hold'
              }"
            >
              {{ project.status }}
            </span>
          </div>
        </div>

        <!-- Project Stats -->
        <div v-if="isAdmin" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
              <h3 class="text-blue-100 text-sm font-bold uppercase tracking-wider mb-1">Total Items Issued</h3>
              <p class="text-4xl font-extrabold">{{ totalItemsIssued }}</p>
           </div>
           <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
              <h3 class="text-purple-100 text-sm font-bold uppercase tracking-wider mb-1">Unique Items</h3>
              <p class="text-4xl font-extrabold">{{ uniqueItemsCount }}</p>
           </div>
           <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
              <h3 class="text-green-100 text-sm font-bold uppercase tracking-wider mb-1">Last Activity</h3>
              <p class="text-xl font-bold mt-2">{{ lastActivityDate }}</p>
           </div>
        </div>

        <div v-if="isAdmin" class="card">
          <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
             <span class="bg-gray-100 text-gray-600 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Transaction History
          </h2>

          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Requested By</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="t in transactions" :key="t._id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 text-sm text-gray-600">{{ new Date(t.date).toLocaleString() }}</td>
                  <td class="px-6 py-4 font-medium text-gray-800">{{ t.item?.name || 'Deleted Item' }}</td>
                  <td class="px-6 py-4 font-bold text-blue-600">{{ t.quantity }} {{ t.unit }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ t.requestedBy || 'N/A' }}</td>
                  <td class="px-6 py-4">
                    <div v-if="t.isPaid">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Paid
                      </span>
                      <span v-if="t.paymentMethod" class="text-xs text-gray-600 ml-2 uppercase">{{ t.paymentMethod }}</span>
                      <span v-if="t.orNumber" class="text-xs text-gray-500 ml-2">OR: {{ t.orNumber }}</span>
                    </div>
                    <div v-else>
                      <div class="flex items-center gap-2">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Unpaid
                        </span>
                        <button
                          @click="openPayment(t)"
                          class="text-xs font-bold text-blue-600 hover:text-blue-800"
                        >
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr v-if="transactions.length === 0">
                  <td colspan="5" class="px-6 py-12 text-center text-gray-400 italic">
                    No transactions recorded for this project yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div v-else class="flex items-center justify-center h-64">
         <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </div>

    <div v-if="showPaymentModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div class="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 class="text-lg font-bold text-gray-800">Mark as Paid</h2>
          <button @click="closePayment" class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="savePayment" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Method</label>
            <select v-model="paymentMethod" class="input-field appearance-none bg-white" required>
              <option value="" disabled>Select</option>
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">OR Number (Optional)</label>
            <input v-model="orNumber" class="input-field" placeholder="e.g. 123456" />
          </div>

          <button type="submit" class="btn-primary w-full" :disabled="savingPayment">
            Save
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import Navbar from '../components/Navbar.vue';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role === 'admin');
const project = ref(null);
const transactions = ref([]);
const showPaymentModal = ref(false);
const selectedTxnId = ref('');
const paymentMethod = ref('');
const orNumber = ref('');
const savingPayment = ref(false);

const fetchProjectDetails = async () => {
  try {
    const projRes = await api.getProject(route.params.id);
    project.value = projRes.data;

    if (isAdmin.value) {
      const txnsRes = await api.getTransactions({ project: route.params.id, type: 'out' });
      transactions.value = txnsRes.data;
    } else {
      transactions.value = [];
    }
  } catch (err) {
    console.error(err);
    alert('Failed to load project details');
  }
};

const openPayment = (t) => {
  selectedTxnId.value = t._id;
  paymentMethod.value = '';
  orNumber.value = '';
  showPaymentModal.value = true;
};

const closePayment = () => {
  showPaymentModal.value = false;
  selectedTxnId.value = '';
  paymentMethod.value = '';
  orNumber.value = '';
};

const savePayment = async () => {
  if (!selectedTxnId.value) return;
  savingPayment.value = true;
  try {
    await api.updateTransactionPayment(selectedTxnId.value, {
      isPaid: true,
      paymentMethod: paymentMethod.value,
      orNumber: orNumber.value || undefined
    });
    closePayment();
    await fetchProjectDetails();
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to update payment');
  } finally {
    savingPayment.value = false;
  }
};

const totalItemsIssued = computed(() => {
  return transactions.value.reduce((acc, t) => acc + t.quantity, 0);
});

const uniqueItemsCount = computed(() => {
  const items = new Set(transactions.value.map(t => t.item?._id));
  return items.size;
});

const lastActivityDate = computed(() => {
  if (transactions.value.length === 0) return 'No activity';
  const lastDate = new Date(transactions.value[0].date);
  return lastDate.toLocaleDateString();
});

onMounted(() => {
  fetchProjectDetails();
});
</script>
