import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, AuthState, LoginCredentials } from '@/types';
import { authApi } from '@/services/api';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
    });

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('adminToken');
        const storedUser = localStorage.getItem('adminUser');

        if (!token) {
            setState(prev => ({ ...prev, isLoading: false }));
            return;
        }

        try {
            // Try to get user from API to verify token is still valid
            const user = await authApi.getMe();

            // Verify user is admin
            if (user.role !== 'admin') {
                throw new Error('Access denied. Admin privileges required.');
            }

            setState({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch {
            // Token invalid or user not admin, clear storage
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            setState({
                user: storedUser ? JSON.parse(storedUser) : null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (credentials: LoginCredentials) => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const { user, token } = await authApi.login(credentials);

            // Verify user is admin
            if (user.role !== 'admin') {
                throw new Error('Access denied. Admin privileges required.');
            }

            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(user));

            setState({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            setState(prev => ({ ...prev, isLoading: false }));
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch {
            // Ignore logout API errors
        }

        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');

        setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
