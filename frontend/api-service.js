import { config } from './config.js';
import { getAuthToken, setAuthToken, clearTokens } from './auth.js';

export class APIService {
    constructor() {
        this.baseUrl = config.apiUrl;
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.baseUrl}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(username, password) {
        try {
            const response = await fetch(`${this.baseUrl}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async verifyToken() {
        try {
            const token = getAuthToken();
            if (!token) {
                return { valid: false };
            }

            const response = await fetch(`${this.baseUrl}/users/verify-token`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Token verification error:', error);
            return { valid: false };
        }
    }

    async refreshToken(refreshToken) {
        try {
            const response = await fetch(`${this.baseUrl}/users/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Token refresh failed');
            }

            setAuthToken(data.token);
            return data;
        } catch (error) {
            console.error('Token refresh error:', error);
            clearTokens();
            throw error;
        }
    }

    async fetchWithAuth(url, options = {}) {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No auth token available');
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            // Token expired, try to refresh
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const refreshData = await this.refreshToken(refreshToken);
                if (!refreshData.token) {
                    throw new Error('Failed to refresh token');
                }

                // Retry original request with new token
                return await this.fetchWithAuth(url, options);
            } catch (error) {
                clearTokens();
                window.location.href = '/login.html';
                throw error;
            }
        }

        return response;
    }
} 