import axios from 'axios';
import type {
    ApiResponse,
    LoginCredentials,
    LoginResponse,
    User,
    Book,
    Order,
    DashboardStats,
    TableFilter
} from '@/types';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
        return data.data;
    },

    getMe: async (): Promise<User> => {
        const { data } = await api.get<ApiResponse<{ user: User }>>('/auth/me');
        return data.data.user;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    },
};

// Dashboard API
export const dashboardApi = {
    getStats: async (): Promise<DashboardStats> => {
        const { data } = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
        return data.data;
    },
};

// Books API
export const booksApi = {
    getAll: async (filters?: TableFilter & { language?: string; lowStock?: string }) => {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.category) params.append('category', filters.category);
        if (filters?.language) params.append('language', filters.language);
        if (filters?.lowStock) params.append('lowStock', filters.lowStock);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.sortBy) params.append('sortBy', filters.sortBy);
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

        const { data } = await api.get<ApiResponse<Book[]>>(`/admin/books?${params}`);
        return data;
    },

    getById: async (id: string): Promise<Book> => {
        const { data } = await api.get<ApiResponse<{ book: Book }>>(`/books/${id}`);
        return data.data.book;
    },

    create: async (book: Partial<Book>): Promise<Book> => {
        const { data } = await api.post<ApiResponse<{ book: Book }>>('/books', book);
        return data.data.book;
    },

    update: async (id: string, book: Partial<Book>): Promise<Book> => {
        const { data } = await api.put<ApiResponse<{ book: Book }>>(`/books/${id}`, book);
        return data.data.book;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/books/${id}`);
    },
};

// Orders API
export const ordersApi = {
    getAll: async (filters?: TableFilter) => {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const { data } = await api.get<ApiResponse<Order[]>>(`/admin/orders?${params}`);
        return data;
    },

    getById: async (id: string): Promise<Order> => {
        const { data } = await api.get<ApiResponse<{ order: Order }>>(`/orders/${id}`);
        return data.data.order;
    },

    updateStatus: async (id: string, status: string): Promise<Order> => {
        const { data } = await api.put<ApiResponse<{ order: Order }>>(`/admin/orders/${id}/status`, { status });
        return data.data.order;
    },
};

// Users API
export const usersApi = {
    getAll: async (filters?: TableFilter) => {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const { data } = await api.get<ApiResponse<User[]>>(`/admin/users?${params}`);
        return data;
    },

    getById: async (id: string): Promise<User> => {
        const { data } = await api.get<ApiResponse<{ user: User }>>(`/admin/users/${id}`);
        return data.data.user;
    },

    updateRole: async (id: string, role: 'user' | 'admin'): Promise<User> => {
        const { data } = await api.put<ApiResponse<{ user: User }>>(`/admin/users/${id}/role`, { role });
        return data.data.user;
    },
};

// Analytics API
export const analyticsApi = {
    getSalesData: async (period: string = '7d') => {
        const { data } = await api.get<ApiResponse<unknown>>(`/admin/analytics/sales?period=${period}`);
        return data.data;
    },

    getTopProducts: async (limit: number = 5) => {
        const { data } = await api.get<ApiResponse<unknown>>(`/admin/analytics/top-products?limit=${limit}`);
        return data.data;
    },
};

export default api;
