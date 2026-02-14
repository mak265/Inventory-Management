import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
    emailForVerification: localStorage.getItem('emailForVerification') || null, // Persist for page refresh
  }),
  actions: {
    async login(email, password) {
      const response = await api.login({ email, password });
      if (response.data.requiresPasswordChange) {
        return response.data;
      }
      this.token = response.data.token;
      this.user = response.data.user;
      localStorage.setItem('token', this.token);
      return response.data;
    },
    async activateAccount(email, currentPassword, newPassword) {
      const response = await api.activateAccount({ email, currentPassword, newPassword });
      this.token = response.data.token;
      this.user = response.data.user;
      localStorage.setItem('token', this.token);
      return response.data;
    },
    async fetchUser() {
      if (!this.token) return;
      try {
        const response = await api.getMe();
        this.user = response.data;
      } catch (err) {
        this.logout();
      }
    },
    async register(email, password) {
      await api.register({ email, password });
      this.emailForVerification = email;
      localStorage.setItem('emailForVerification', email);
    },
    async verifyOtp(otp) {
      if (!this.emailForVerification) throw new Error("Email not found");
      await api.verifyOtp({ email: this.emailForVerification, otp });
      this.emailForVerification = null;
      localStorage.removeItem('emailForVerification');
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
    }
  }
});
