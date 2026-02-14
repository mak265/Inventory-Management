<template>
  <div class="page-container">
    <Navbar />

    <div class="container mx-auto px-6">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 tracking-tight">Projects / Sites</h1>
          <p class="text-gray-500 mt-1">Manage construction sites and allocations</p>
        </div>
        <button 
          v-if="isAdmin"
          @click="openModal" 
          class="btn-primary flex items-center shadow-lg shadow-blue-500/30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Project
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="project in projects" 
          :key="project._id" 
          @click="$router.push(`/projects/${project._id}`)"
          class="card card-hover group relative overflow-hidden border-t-4 border-blue-500 cursor-pointer"
        >
          <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>

          <div class="flex justify-between items-start mb-4 relative z-10">
            <div>
               <h3 class="text-xl font-bold text-gray-800">{{ project.name }}</h3>
               <p class="text-sm text-gray-500 flex items-center mt-1">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
                 {{ project.location }}
               </p>
            </div>
            <span 
              class="px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wide border"
              :class="{
                'bg-green-50 text-green-700 border-green-100': project.status === 'active',
                'bg-blue-50 text-blue-700 border-blue-100': project.status === 'completed',
                'bg-yellow-50 text-yellow-700 border-yellow-100': project.status === 'on-hold'
              }"
            >
              {{ project.status }}
            </span>
          </div>
          
          <div class="mb-6 relative z-10">
            <div class="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
               </svg>
               <span class="text-sm font-medium">{{ project.engineer?.email || project.manager || 'No Engineer Assigned' }}</span>
            </div>
          </div>

          <div v-if="isAdmin" class="flex justify-end space-x-2 pt-4 border-t border-gray-100 relative z-10" @click.stop>
            <!-- Status Toggle (Simple) -->
            <button 
              v-if="project.status === 'active'"
              @click="updateStatus(project, 'on-hold')" 
              class="text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
            >
              Hold
            </button>
            <button 
              v-if="project.status === 'on-hold'"
              @click="updateStatus(project, 'active')" 
              class="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
            >
              Resume
            </button>
            
            <button 
              @click="deleteProject(project._id)" 
              class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        <!-- Add New Card Placeholder -->
        <button 
          v-if="isAdmin"
          @click="showModal = true"
          class="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/30 transition-all duration-200 min-h-[200px]"
        >
          <div class="h-12 w-12 rounded-full bg-gray-100 mb-3 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span class="font-medium">Create New Project</span>
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">
        <div class="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <h2 class="text-xl font-bold text-gray-800">Add New Project</h2>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="createProject" class="p-6 space-y-4 overflow-y-auto">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Project Name</label>
            <input v-model="form.name" required class="input-field" placeholder="e.g. Sky Tower Phase 1" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Location Name</label>
            <input v-model="form.location" required class="input-field" placeholder="e.g. Makati City" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Assign Engineer</label>
            <select v-model="form.engineerId" class="input-field appearance-none bg-white">
              <option value="">Unassigned</option>
              <option v-for="eng in engineers" :key="eng._id" :value="eng._id">
                {{ eng.email }}
              </option>
            </select>
          </div>
          
          <!-- Map -->
          <div>
             <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Pin Location on Map</label>
             <div id="projectMap" class="h-64 w-full rounded-lg border border-gray-300"></div>
             <p class="text-xs text-gray-400 mt-1">Click on the map to set the project site coordinates.</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Manager / Foreman (Optional)</label>
            <input v-model="form.manager" class="input-field" placeholder="e.g. Engr. Juan Dela Cruz" />
          </div>
          
          <div class="pt-2">
            <button type="submit" class="btn-primary w-full shadow-blue-500/30">Create Project</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import api from '../services/api';
import Navbar from '../components/Navbar.vue';
import { useAuthStore } from '../stores/auth';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const projects = ref([]);
const engineers = ref([]);
const showModal = ref(false);
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role === 'admin');
const form = ref({
  name: '',
  location: '',
  coordinates: { lat: 14.5995, lng: 120.9842 }, // Default Manila
  manager: '',
  engineerId: '',
  status: 'active'
});
let map = null;
let marker = null;

const initMap = () => {
  if (map) return;
  
  map = L.map('projectMap').setView([14.5995, 120.9842], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    form.value.coordinates = { lat, lng };
    
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng]).addTo(map);
    }
  });
};

const openModal = async () => {
    showModal.value = true;
    await nextTick();
    // Reset map if needed or just resize
    if (!map) {
        initMap();
    } else {
        map.invalidateSize();
    }
};

const fetchProjects = async () => {
  try {
    const response = await api.getProjects();
    projects.value = response.data;
  } catch (err) {
    console.error(err);
  }
};

const fetchEngineers = async () => {
  if (!isAdmin.value) return;
  try {
    const response = await api.getEngineers();
    engineers.value = response.data;
  } catch (err) {
    console.error('Failed to fetch engineers:', err);
  }
};

const updateStatus = async (project, status) => {
  try {
    await api.updateProject(project._id, { status });
    await fetchProjects();
  } catch (err) {
    alert('Failed to update status');
  }
};

const createProject = async () => {
  try {
    await api.createProject(form.value);
    showModal.value = false;
    form.value = {
      name: '',
      location: '',
      coordinates: { lat: 14.5995, lng: 120.9842 },
      manager: '',
      engineerId: '',
      status: 'active'
    };
    fetchProjects();
  } catch (err) {
    alert('Failed to create project');
  }
};

const deleteProject = async (id) => {
  if (confirm('Are you sure you want to delete this project?')) {
    try {
      await api.deleteProject(id);
      fetchProjects();
    } catch (err) {
      alert('Failed to delete project');
    }
  }
};

onMounted(() => {
  fetchProjects();
  fetchEngineers();
});

watch(
  () => form.value.engineerId,
  (newId) => {
    if (!newId) return;
    const selected = engineers.value.find(e => e._id === newId);
    if (!selected) return;
    if (!form.value.manager) form.value.manager = selected.email;
  }
);
</script>
