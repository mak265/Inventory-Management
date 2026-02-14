<template>
  <div class="page-container">
    <Navbar />
    <div class="container mx-auto px-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-2 tracking-tight">Sales History</h1>
      <p class="text-gray-500 mb-8">Review and export past transactions</p>

      <div class="card mb-6">
        <div class="flex gap-2">
          <button @click="activeTab = 'pos'" class="flex-1 py-2 rounded-lg font-bold"
            :class="activeTab === 'pos' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
            POS Sales
          </button>
          <button @click="activeTab = 'project'" class="flex-1 py-2 rounded-lg font-bold"
            :class="activeTab === 'project' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
            Project Sales
          </button>
        </div>
      </div>

      <div class="card mb-8">
        <div v-if="activeTab === 'pos'" class="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Start Date</label>
            <input type="date" v-model="filters.startDate" class="input-field" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">End Date</label>
            <input type="date" v-model="filters.endDate" class="input-field" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Payment Method</label>
            <select v-model="filters.paymentMethod" class="input-field">
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="flex items-center">
            <button @click="fetchSales" class="btn-primary w-full flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
          </div>
          <div class="flex gap-2 justify-end md:col-span-1">
            <button @click="exportCSV" class="btn-secondary flex-1 flex items-center justify-center text-sm px-3" title="Export CSV">
              CSV
            </button>
            <button @click="exportPDF" class="btn-secondary flex-1 flex items-center justify-center text-sm px-3" title="Export PDF">
              PDF
            </button>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Start Date</label>
            <input type="date" v-model="projectFilters.startDate" class="input-field" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">End Date</label>
            <input type="date" v-model="projectFilters.endDate" class="input-field" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Payment</label>
            <select v-model="projectFilters.paymentStatus" class="input-field">
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Method</label>
            <select v-model="projectFilters.paymentMethod" class="input-field">
              <option value="">All</option>
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Project</label>
            <select v-model="projectFilters.projectId" class="input-field appearance-none bg-white">
              <option value="">All Projects</option>
              <option v-for="p in projects" :key="p._id" :value="p._id">
                {{ p.name }}
              </option>
            </select>
          </div>
          <div class="flex items-center">
            <button @click="fetchProjectSales" class="btn-primary w-full flex items-center justify-center">
              Filter
            </button>
          </div>
        </div>
      </div>

      <div class="card p-0 overflow-hidden shadow-lg border-0">
        <div class="overflow-x-auto">
          <table v-if="activeTab === 'pos'" class="min-w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Txn ID</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Items Summary</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Paid</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cashier</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="s in sales" :key="s._id" class="hover:bg-blue-50/30 transition-colors">
                <td class="px-6 py-4">
                   <span class="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{{ s.transactionId }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ new Date(s.date).toLocaleString() }}</td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-700 max-w-md">
                     <div v-for="(i, idx) in s.items" :key="idx" class="flex justify-between border-b border-dashed border-gray-100 last:border-0 py-1">
                        <span>{{ i.name }} <span class="text-gray-400">x{{ i.quantity }}</span></span>
                        <span class="font-medium">₱{{ i.lineTotal.toFixed(2) }}</span>
                     </div>
                  </div>
                </td>
                <td class="px-6 py-4 font-bold text-gray-800">₱{{ s.totalAmount.toFixed(2) }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">₱{{ s.amountPaid.toFixed(2) }}</td>
                <td class="px-6 py-4">
                   <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide"
                     :class="{
                       'bg-green-100 text-green-800': s.paymentMethod === 'cash',
                       'bg-blue-100 text-blue-800': s.paymentMethod === 'gcash',
                       'bg-purple-100 text-purple-800': s.paymentMethod === 'bank_transfer',
                       'bg-gray-100 text-gray-800': s.paymentMethod === 'other'
                     }">
                     {{ s.paymentMethod }}
                   </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ s.user?.email || '—' }}</td>
              </tr>
              <tr v-if="sales.length === 0">
                <td colspan="8" class="px-6 py-12 text-center text-gray-400">
                  <div class="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <p>No sales records found for the selected period.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <table v-else class="min-w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Project</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="t in projectSales" :key="t._id" class="hover:bg-blue-50/30 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ new Date(t.date).toLocaleString() }}</td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  <div class="font-bold text-gray-800">{{ t.project?.name || 'N/A' }}</div>
                  <div class="text-xs text-gray-500">{{ t.project?.location || '' }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-800">{{ t.item?.name || 'Deleted Item' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{{ t.quantity }} {{ t.unit }}</td>
                <td class="px-6 py-4 whitespace-nowrap font-bold text-gray-800">₱{{ getTxnAmount(t).toFixed(2) }}</td>
                <td class="px-6 py-4 text-sm">
                  <div v-if="t.isPaid">
                    <span class="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-medium">Paid</span>
                    <span v-if="t.paymentMethod" class="text-xs ml-2 text-gray-600 uppercase">{{ t.paymentMethod }}</span>
                    <span v-if="t.orNumber" class="text-xs ml-2 text-gray-500">OR: {{ t.orNumber }}</span>
                  </div>
                  <div v-else>
                    <span class="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded font-medium">Unpaid</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ t.user?.email || '—' }}</td>
              </tr>
              <tr v-if="projectSales.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-gray-400">
                  No project transactions found for the selected filters.
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
import { ref, onMounted, watch } from 'vue';
import Navbar from '../components/Navbar.vue';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const sales = ref([]);
const activeTab = ref('pos');
const projectSales = ref([]);
const projects = ref([]);
const filters = ref({
  startDate: '',
  endDate: '',
  paymentMethod: ''
});
const projectFilters = ref({
  startDate: '',
  endDate: '',
  paymentStatus: '',
  paymentMethod: '',
  projectId: ''
});

const fetchSales = async () => {
  try {
    const res = await api.getSales({ ...filters.value });
    if (res.data && Array.isArray(res.data)) {
      sales.value = res.data;
    } else {
      sales.value = [];
    }
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || 'Failed to fetch sales');
  }
};

const fetchProjects = async () => {
  try {
    const res = await api.getProjects();
    projects.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const fetchProjectSales = async () => {
  try {
    const params = {
      type: 'out',
      startDate: projectFilters.value.startDate || undefined,
      endDate: projectFilters.value.endDate || undefined,
      project: projectFilters.value.projectId || undefined,
      paymentMethod: projectFilters.value.paymentMethod || undefined
    };
    if (projectFilters.value.paymentStatus === 'paid') params.isPaid = 'true';
    if (projectFilters.value.paymentStatus === 'unpaid') params.isPaid = 'false';
    const res = await api.getTransactions(params);
    projectSales.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || 'Failed to fetch project sales');
  }
};

const getTxnAmount = (t) => {
  const unitPrice = Number(t.unitPrice ?? t.item?.price ?? 0);
  const qty = Number(t.quantity ?? 0);
  return unitPrice * qty;
};

const exportCSV = async () => {
  try {
    const res = await api.getSalesCsv({ ...filters.value });
    const blob = new Blob([res.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales_history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to export CSV');
  }
};

const exportPDF = () => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for more width
  doc.setFontSize(16);
  doc.text('Sales History Report', 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
  
  if (filters.value.startDate || filters.value.endDate) {
    doc.text(`Period: ${filters.value.startDate || 'Start'} to ${filters.value.endDate || 'Now'}`, 14, 28);
  }

  const columns = [
    { header: 'Txn ID', dataKey: 'id' },
    { header: 'Date', dataKey: 'date' },
    { header: 'Items Summary', dataKey: 'items' },
    { header: 'Total', dataKey: 'total' },
    { header: 'Paid', dataKey: 'paid' },
    { header: 'Method', dataKey: 'method' },
    { header: 'Cashier', dataKey: 'cashier' }
  ];

  const rows = sales.value.map(s => ({
    id: s.transactionId,
    date: new Date(s.date).toLocaleDateString(),
    items: s.items.map(i => `${i.name} (${i.quantity})`).join(', '),
    total: `P${s.totalAmount.toFixed(2)}`,
    paid: `P${s.amountPaid.toFixed(2)}`,
    method: s.paymentMethod.toUpperCase(),
    cashier: s.user?.email || 'N/A'
  }));

  autoTable(doc, {
    columns: columns,
    body: rows,
    startY: 35,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      items: { cellWidth: 80 }, // Wider column for items
      total: { halign: 'right', fontStyle: 'bold' },
      paid: { halign: 'right' }
    }
  });

  doc.save(`Sales_History_${new Date().toISOString().slice(0,10)}.pdf`);
};

onMounted(() => {
  fetchSales();
  fetchProjects();
});

watch(activeTab, (tab) => {
  if (tab === 'project' && projectSales.value.length === 0) {
    fetchProjectSales();
  }
});
</script>
