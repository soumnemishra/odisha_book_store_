import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      // Extract user and token from response (handle both {data: {user, token}} and {user, token})
      const user = data.data?.user || data.user;
      const token = data.data?.token || data.token || data.data;

      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("token", typeof token === 'string' ? token : data.data);

      set({ token: typeof token === 'string' ? token : data.data, user, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📦 Full backend response:', JSON.stringify(data, null, 2));

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      // Backend returns: { success: true, data: "JWT_TOKEN_STRING" } where data IS the token
      // OR: { success: true, user: {...}, token: "..." }
      // OR: { success: true, data: { user: {...}, token: "..." } }

      let user, token;

      if (typeof data.data === 'string') {
        // data.data is the JWT token string directly
        token = data.data;
        user = data.user; // user might be at top level
      } else if (data.data && typeof data.data === 'object') {
        // data.data is an object with user and token
        user = data.data.user;
        token = data.data.token;
      } else {
        // Flat structure
        user = data.user;
        token = data.token;
      }

      console.log('💾 Extracted:', { hasUser: !!user, hasToken: !!token, tokenLength: token?.length });

      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("token", token);

      set({ token, user, isLoading: false });
      console.log('🎉 Login state updated successfully!');

      return { success: true };
    } catch (error) {
      console.log('❌ Login error:', error);
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");
      const user = (userJson && userJson !== "undefined") ? JSON.parse(userJson) : null;
      set({ token: token || null, user });
    } catch (error) {
      console.log("Auth check failed", error);
      set({ token: null, user: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    set({ token: null, user: null });
  },
}));
