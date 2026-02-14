<template>
  <div class="page-container">
    <Navbar />

    <div class="container mx-auto px-6">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 tracking-tight">User Management</h1>
          <p class="text-gray-500 mt-1">Manage accounts and permissions</p>
        </div>
      </div>
      
      <!-- Create User Card -->
      <div class="card mb-8">
        <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Create New User
        </h2>
        <form @submit.prevent="createNewUser" class="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
            <input v-model="newUser.email" type="email" class="input-field" required placeholder="user@example.com" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Role</label>
            <select v-model="newUser.role" class="input-field appearance-none bg-white">
              <option value="warehouse_staff">Warehouse Staff</option>
              <option value="site_engineer">Site Engineer</option>
              <option value="admin">Admin</option>
              <option value="client">Client (Suki)</option>
              <option value="delivery">Delivery Personnel</option>
            </select>
          </div>
          <div>
            <button class="btn-primary w-full py-3 shadow-blue-500/30">
              Create User
            </button>
          </div>
        </form>
        <p class="text-xs text-gray-500 mt-3">
          A temporary password will be generated and emailed to the user.
        </p>
        <p v-if="createError" class="text-red-500 text-sm mt-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ createError }}
        </p>
        <p v-if="createSuccess" class="text-green-600 text-sm mt-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ createSuccess }}
        </p>
      </div>

      <div class="card overflow-hidden">
        <div v-if="loading" class="text-center py-12 text-gray-500">
           <svg class="animate-spin h-8 w-8 text-blue-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           Loading users...
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-left text-sm whitespace-nowrap">
            <thead class="uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
              <tr>
                <th scope="col" class="px-6 py-4 font-bold text-gray-500">Email</th>
                <th scope="col" class="px-6 py-4 font-bold text-gray-500">Role</th>
                <th scope="col" class="px-6 py-4 font-bold text-gray-500">Joined</th>
                <th scope="col" class="px-6 py-4 font-bold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="user in users" :key="user._id" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-800 flex items-center gap-3">
                  <div class="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {{ user.email.substring(0, 2).toUpperCase() }}
                  </div>
                  {{ user.email }}
                </td>
                <td class="px-6 py-4">
                  <div class="relative inline-block w-40">
                    <select 
                      v-model="user.role" 
                      @change="updateRole(user)"
                      class="appearance-none w-full pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 transition-all"
                      :class="{
                        'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-400': user.role === 'admin',
                        'bg-purple-100 text-purple-700 hover:bg-purple-200 focus:ring-purple-400': user.role === 'warehouse_staff',
                        'bg-orange-100 text-orange-700 hover:bg-orange-200 focus:ring-orange-400': user.role === 'site_engineer',
                        'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 focus:ring-emerald-400': user.role === 'client',
                        'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 focus:ring-yellow-400': user.role === 'delivery'
                      }"
                    >
                      <option value="admin">Admin</option>
                      <option value="warehouse_staff">Warehouse Staff</option>
                      <option value="site_engineer">Site Engineer</option>
                      <option value="client">Client (Suki)</option>
                      <option value="delivery">Delivery Personnel</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-50">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-gray-500">
                  {{ new Date(user.createdAt).toLocaleDateString() }}
                </td>
                <td class="px-6 py-4 text-right">
                  <button 
                    @click="deleteUser(user)" 
                    class="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                    title="Delete User"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="users.length === 0" class="text-center py-12 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p>No users found.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import Navbar from '../components/Navbar.vue';
import { useAuthStore } from '../stores/auth';

const users = ref([]);
const loading = ref(true);
const authStore = useAuthStore();
const newUser = ref({ email: '', role: 'warehouse_staff' });
const createError = ref('');
const createSuccess = ref('');

const fetchUsers = async () => {
  try {
    const response = await api.getUsers();
    users.value = response.data;
  } catch (err) {
    console.error('Failed to fetch users:', err);
    alert('Failed to fetch users');
  } finally {
    loading.value = false;
  }
};

const updateRole = async (user) => {
  try {
    await api.updateUserRole(user._id, user.role);
    alert(`Role updated for ${user.email}`);
  } catch (err) {
    console.error('Failed to update role:', err);
    alert('Failed to update role: ' + (err.response?.data?.message || err.message));
    // Revert change if failed (optional, would require tracking original state)
    fetchUsers(); 
  }
};

const deleteUser = async (user) => {
  if (confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) {
    try {
      await api.deleteUser(user._id);
      users.value = users.value.filter(u => u._id !== user._id);
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
    }
  }
};

const createNewUser = async () => {
  createError.value = '';
  createSuccess.value = '';
  try {
    const res = await api.createUser(newUser.value);
    createSuccess.value = res.data.message || `User created: ${newUser.value.email}`;
    newUser.value = { email: '', role: 'warehouse_staff' };
    await fetchUsers();
  } catch (err) {
    createError.value = err.response?.data?.message || err.message || 'Failed to create user';
  }
};

onMounted(() => {
  fetchUsers();
});
</script>
