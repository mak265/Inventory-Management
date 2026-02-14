<template>
  <div>
    <!-- Mobile Header -->
    <nav class="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white border-b border-slate-800 px-4 h-16 flex items-center justify-between shadow-md">
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <span class="font-bold text-lg tracking-wide">Triogok</span>
      </div>
      <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-lg hover:bg-white/10 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </nav>

    <!-- Sidebar (Desktop & Mobile Drawer) -->
    <aside 
      class="fixed inset-y-0 left-0 z-40 w-64 md:w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-slate-800 shadow-2xl flex flex-col"
      :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Logo Area -->
      <div class="h-20 flex items-center px-6 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h1 class="font-bold text-white text-lg tracking-tight">Aberin MIS</h1>
          <p class="text-xs text-slate-500">Inventory System</p>
        </div>
      </div>

      <!-- User Info -->
      <div v-if="authStore.user" class="px-6 py-6">
        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {{ getInitials(authStore.user.email) }}
          </div>
          <div class="overflow-hidden">
            <p class="text-sm font-bold text-white truncate">{{ authStore.user.email.split('@')[0] }}</p>
            <p class="text-xs text-slate-400 capitalize flex items-center gap-1">
              <span class="w-2 h-2 rounded-full" :class="getRoleColor(authStore.user.role)"></span>
              {{ formatRole(authStore.user.role) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
        <template v-for="(group, index) in navigationGroups" :key="index">
          <div v-if="group.items.some(item => hasPermission(item.roles))" class="mb-6">
            <h3 v-if="group.title" class="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{{ group.title }}</h3>
            <div class="space-y-1">
              <router-link 
                v-for="item in group.items.filter(i => hasPermission(i.roles))" 
                :key="item.path"
                :to="item.path"
                @click="mobileMenuOpen = false"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group"
                :class="$route.path.startsWith(item.path) ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
              >
                <component :is="item.icon" class="h-5 w-5 transition-colors" :class="$route.path.startsWith(item.path) ? 'text-white' : 'text-slate-500 group-hover:text-white'" />
                {{ item.name }}
              </router-link>
            </div>
          </div>
        </template>
      </div>

      <!-- Logout -->
      <div class="p-4 border-t border-slate-800 bg-slate-900">
        <button 
          @click="logout" 
          class="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div 
      v-if="mobileMenuOpen" 
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
      @click="mobileMenuOpen = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Icons components (Functional components for cleaner template)
const IconDashboard = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>` };
const IconCart = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>` };
const IconPackage = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>` };
const IconClipboard = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>` };
const IconLayers = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>` };
const IconBox = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>` };
const IconCreditCard = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>` };
const IconBriefcase = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>` };
const IconTag = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>` };
const IconFileText = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.586l5.414 5.414a1 1 0 01.586 1.414V19a2 2 0 01-2 2z" /></svg>` };
const IconChart = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>` };
const IconUsers = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>` };
const IconTrending = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>` };
const IconEye = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>` };
const IconTruck = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>` }; // Simple placeholder, better icon below

const router = useRouter();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const navigationGroups = [
  {
    title: 'Main',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: IconDashboard, roles: ['admin', 'warehouse_staff'] },
      { name: 'Dashboard', path: '/client-dashboard', icon: IconDashboard, roles: ['client'] },
      { name: 'My Dashboard', path: '/engineer-dashboard', icon: IconDashboard, roles: ['site_engineer'] },
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Order Materials', path: '/order-catalog', icon: IconCart, roles: ['client'] },
      { name: 'My Orders', path: '/my-orders', icon: IconPackage, roles: ['client'] },
      { name: 'Order Materials', path: '/engineer-order', icon: IconCart, roles: ['site_engineer'] },
      { name: 'My Orders', path: '/engineer-orders', icon: IconPackage, roles: ['site_engineer'] },
      { name: 'Manage Orders', path: '/orders-manage', icon: IconClipboard, roles: ['admin'] },
      { name: 'Stock Management', path: '/stock', icon: IconLayers, roles: ['admin'] },
      { name: 'Inventory', path: '/inventory', icon: IconBox, roles: ['admin', 'warehouse_staff'] },
      { name: 'POS System', path: '/pos', icon: IconCreditCard, roles: ['admin'] },
      { name: 'Deliveries', path: '/deliveries', icon: IconTruck, roles: ['delivery', 'admin'] },
      { name: 'Project Deliveries', path: '/project-deliveries', icon: IconTruck, roles: ['site_engineer'] },
    ]
  },
  {
    title: 'Management',
    items: [
      { name: 'Projects', path: '/projects', icon: IconBriefcase, roles: ['admin', 'site_engineer'] },
      { name: 'Categories', path: '/categories', icon: IconTag, roles: ['admin'] },
      { name: 'Users', path: '/users', icon: IconUsers, roles: ['admin'] },
    ]
  },
  {
    title: 'Reports & Data',
    items: [
      { name: 'Records', path: '/transactions', icon: IconFileText, roles: ['admin', 'warehouse_staff'] },
      { name: 'Sales History', path: '/sales-history', icon: IconTrending, roles: ['admin'] },
      { name: 'Reports', path: '/reports', icon: IconChart, roles: ['admin', 'warehouse_staff'] },
      { name: 'Audit Trail', path: '/audit-trail', icon: IconEye, roles: ['admin'] },
    ]
  }
];

const hasPermission = (allowedRoles) => {
  return authStore.user && allowedRoles.includes(authStore.user.role);
};

const getInitials = (email) => {
  return email ? email.substring(0, 2).toUpperCase() : '??';
};

const getRoleColor = (role) => {
  const map = {
    'admin': 'bg-red-500',
    'client': 'bg-blue-500',
    'warehouse_staff': 'bg-purple-500',
    'site_engineer': 'bg-orange-500',
    'delivery': 'bg-yellow-500'
  };
  return map[role] || 'bg-gray-500';
};

const formatRole = (role) => {
  return role.replace('_', ' ');
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.5);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(71, 85, 105, 0.5);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(94, 114, 144, 0.8);
}
</style>
