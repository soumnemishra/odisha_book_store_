// User types
export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    phone?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    createdAt: string;
    updatedAt: string;
}

// Book types
export interface Book {
    _id: string;
    title: string;
    author: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: string;
    isbn?: string;
    publisher?: string;
    publishedDate?: string;
    pages?: number;
    language?: string;
    coverImage?: string;
    images?: string[];
    stock: number;
    rating?: number;
    numReviews?: number;
    isFeatured?: boolean;
    isActive?: boolean;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

// Order types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
    book: string | Book;
    title: string;
    quantity: number;
    price: number;
    coverImage?: string;
}

export interface ShippingAddress {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Order {
    _id: string;
    user: string | User;
    orderItems: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    paymentResult?: {
        id: string;
        status: string;
        updateTime: string;
        emailAddress: string;
    };
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt?: string;
    status: OrderStatus;
    deliveredAt?: string;
    trackingNumber?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Dashboard stats types
export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    revenueChange: number;
    ordersChange: number;
    customersChange: number;
    productsChange: number;
    recentOrders: Order[];
    topProducts: {
        book: Book;
        soldCount: number;
        revenue: number;
    }[];
    salesByCategory: {
        category: string;
        sales: number;
        count: number;
    }[];
    revenueChart: {
        date: string;
        revenue: number;
        orders: number;
    }[];
}

// Analytics types
export interface SalesAnalytics {
    period: string;
    revenue: number;
    orders: number;
    avgOrderValue: number;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// Auth types
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

// Table/Filter types
export interface TableFilter {
    search?: string;
    status?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}
