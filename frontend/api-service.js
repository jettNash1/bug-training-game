import { config } from './config.js';
import { getAuthToken, setAuthToken, clearTokens } from './auth.js';

export class APIService {
    constructor() {
        this.baseUrl = config.apiUrl;
    }

    // Helper method to get admin auth header
    getAdminAuthHeader() {
        const adminToken = localStorage.getItem('adminToken');
        return adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {};
    }

    // Admin-specific fetch method
    async fetchWithAdminAuth(url, options = {}) {
        const headers = {
            ...this.getAdminAuthHeader(),
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // If unauthorized, redirect to admin login
            localStorage.removeItem('adminToken');
            // Use consistent path for admin login
            window.location.href = '/pages/admin-login.html';
            throw new Error('Admin authentication required');
        }

        return response;
    }

    // Regular user authentication methods
    async login(username, password) {
        try {
            console.log('Attempting login:', { username, url: `${this.baseUrl}/users/login` });
            
            const response = await fetch(`${this.baseUrl}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            console.log('Login response status:', response.status);
            
            // Try to read the response text first
            const text = await response.text();
            console.log('Login response text:', text);

            // Then parse it as JSON if possible
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                throw new Error('Invalid response from server');
            }

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
            console.log('Attempting registration:', { username, url: `${this.baseUrl}/users/register` });
            
            const response = await fetch(`${this.baseUrl}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            console.log('Registration response status:', response.status);
            
            // Try to read the response text first
            const text = await response.text();
            console.log('Registration response text:', text);

            // Then parse it as JSON if possible
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                throw new Error('Invalid response from server');
            }

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
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const text = await response.text();
            console.log('Token verification response:', text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse token verification response:', e);
                return { valid: false };
            }

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
                credentials: 'include',
                body: JSON.stringify({ refreshToken })
            });

            const text = await response.text();
            console.log('Token refresh response:', text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse token refresh response:', e);
                throw new Error('Invalid response from server');
            }

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
            credentials: 'include',
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

    async getQuizProgress(quizName) {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/users/quiz-progress/${quizName}`);
            if (!response.ok) {
                throw new Error('Failed to get quiz progress');
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to get quiz progress:', error);
            return null;
        }
    }

    async saveQuizProgress(quizName, progress) {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/users/quiz-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quizName, progress })
            });

            if (!response.ok) {
                throw new Error('Failed to save quiz progress');
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to save quiz progress:', error);
            return null;
        }
    }

    async updateQuizScore(quizName, score) {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/users/quiz-scores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quizName, score })
            });

            const text = await response.text();
            console.log('Update quiz score response:', text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                throw new Error('Invalid response from server');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update quiz score');
            }

            return data;
        } catch (error) {
            console.error('Failed to update quiz score:', error);
            throw error;
        }
    }
} 