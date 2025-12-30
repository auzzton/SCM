import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        console.log("Interceptor - Token:", token ? "Present" : "Missing"); // Debugging
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403 || error.response?.status === 401) {
            // Optional: Logout user on 401/403
            // useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);
