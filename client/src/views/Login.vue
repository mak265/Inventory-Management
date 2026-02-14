<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
    <!-- Decorative background blobs -->
    <div class="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
    <div class="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-32 left-20 w-96 h-96 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

    <div class="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 relative z-10 mx-4">
      <div class="text-center mb-8">
        <div class="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-800 tracking-tight">Welcome Back</h2>
        <p class="text-gray-500 mt-2">Sign in to access your inventory</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input 
            v-model="email" 
            type="email" 
            class="input-field"
            placeholder="you@company.com"
            required
          />
        </div>
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium text-gray-700">Password</label>
            <router-link to="/forgot-password" class="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot?</router-link>
          </div>
          <div class="relative">
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              class="input-field pr-14"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 px-4 text-sm font-bold text-gray-500 hover:text-gray-700"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>
        
        <button type="submit" class="btn-primary w-full py-3 text-lg shadow-lg shadow-blue-500/30">
          Sign In
        </button>
      </form>

      <div class="mt-8 pt-6 border-t border-gray-100 text-center">
        <p class="text-gray-600">
           Forgot your password? <router-link to="/forgot-password" class="text-blue-600 font-semibold hover:text-blue-700 hover:underline">Reset here</router-link>
        </p>
      </div>

      <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-sm">
        <div class="flex items-center gap-3 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          {{ error }}
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const error = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    const res = await authStore.login(email.value, password.value);
    if (res?.requiresPasswordChange) {
      router.push(`/activate-account?email=${encodeURIComponent(res.email || email.value)}`);
      return;
    }
    
    // Redirect based on role
    const role = authStore.user?.role;
    if (role === 'client') {
      router.push('/client-dashboard');
    } else if (role === 'delivery') {
      router.push('/deliveries');
    } else if (role === 'site_engineer') {
      router.push('/engineer-dashboard');
    } else {
      router.push('/dashboard');
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed';
  }
};
</script>

<style scoped>
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
</style>
