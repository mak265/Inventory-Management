<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
    <div class="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/50">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-800 tracking-tight">Activate Account</h2>
        <p class="text-gray-500 mt-2">Change your password to continue.</p>
      </div>

      <form @submit.prevent="handleActivate" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input v-model="email" type="email" class="input-field" required placeholder="you@company.com" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <div class="relative">
            <input
              v-model="currentPassword"
              :type="showCurrent ? 'text' : 'password'"
              class="input-field pr-14"
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 px-4 text-sm font-bold text-gray-500 hover:text-gray-700"
              @click="showCurrent = !showCurrent"
            >
              {{ showCurrent ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <div class="relative">
            <input
              v-model="newPassword"
              :type="showNew ? 'text' : 'password'"
              class="input-field pr-14"
              required
              minlength="6"
              placeholder="••••••••"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 px-4 text-sm font-bold text-gray-500 hover:text-gray-700"
              @click="showNew = !showNew"
            >
              {{ showNew ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <div class="relative">
            <input
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              class="input-field pr-14"
              required
              minlength="6"
              placeholder="••••••••"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 px-4 text-sm font-bold text-gray-500 hover:text-gray-700"
              @click="showConfirm = !showConfirm"
            >
              {{ showConfirm ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <button type="submit" class="btn-primary w-full py-3 text-lg shadow-lg shadow-blue-500/30" :disabled="loading">
          {{ loading ? 'Saving...' : 'Continue' }}
        </button>
      </form>

      <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
        {{ error }}
      </div>

      <div class="mt-6 text-center">
        <router-link to="/login" class="text-sm text-blue-600 hover:underline">Back to Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);

const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

onMounted(() => {
  if (typeof route.query.email === 'string') {
    email.value = route.query.email;
  }
});

const handleActivate = async () => {
  error.value = '';
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }
  loading.value = true;
  try {
    await authStore.activateAccount(email.value, currentPassword.value, newPassword.value);

    const role = authStore.user?.role;
    if (role === 'client') router.push('/client-dashboard');
    else if (role === 'delivery') router.push('/deliveries');
    else if (role === 'site_engineer') router.push('/engineer-dashboard');
    else router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.message || 'Activation failed';
  } finally {
    loading.value = false;
  }
};
</script>
