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
        try {
            const adminToken = localStorage.getItem('adminToken');
            console.log('Fetching with admin auth:', { url, hasToken: !!adminToken });

            if (!adminToken) {
                console.log('No admin token found, redirecting to login');
                window.location.replace('/pages/admin-login.html');
                throw new Error('No admin token found');
            }

            // Verify token before making request
            const verificationResult = await this.verifyAdminToken();
            if (!verificationResult.valid) {
                console.log('Admin token invalid:', verificationResult);
                window.location.replace('/pages/admin-login.html');
                throw new Error('Admin token invalid');
            }

            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            // Handle auth errors first
            if (response.status === 401 || response.status === 403) {
                console.log('Auth error response:', { status: response.status });
                localStorage.removeItem('adminToken');
                window.location.replace('/pages/admin-login.html');
                throw new Error('Authentication failed');
            }

            // Try to parse response as JSON
            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                throw new Error('Invalid JSON response from server');
            }

            // Handle other errors
            if (!response.ok) {
                console.error('Request failed:', { status: response.status, data });
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('fetchWithAdminAuth error:', error);
            throw error;
        }
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
                body: JSON.stringify({ 
                    quizName, 
                    progress: {
                        ...progress,
                        status: progress.status || 'in_progress' // Ensure status is included
                    }
                })
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
                body: JSON.stringify({ 
                    quizName,
                    ...score,
                    status: score.status || 'in_progress'
                })
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

            // Also update quiz progress with the status and question history
            if (score.questionHistory) {
                await this.saveQuizProgress(quizName, {
                    ...score,
                    status: score.status || 'in_progress',
                    lastUpdated: new Date().toISOString()
                });
            }

            return data;
        } catch (error) {
            console.error('Failed to update quiz score:', error);
            throw error;
        }
    }

    // Admin-specific methods
    async adminLogin(username, password) {
        try {
            console.log('Attempting admin login:', { username });
            
            // Clear any existing admin token first
            localStorage.removeItem('adminToken');
            
            // Handle admin login
            const response = await fetch(`${this.baseUrl}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    username: username.trim(), 
                    password: password.trim() 
                })
            });

            // Try to read the response text first
            const text = await response.text();
            console.log('Admin login response text:', text);

            // Then parse it as JSON if possible
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                throw new Error('Invalid response from server');
            }
            
            if (!response.ok) {
                throw new Error(data.message || 'Admin login failed');
            }

            if (!data.token) {
                throw new Error('No token received from server');
            }

            // Store the token
            localStorage.setItem('adminToken', data.token);
            console.log('Admin token stored successfully:', { token: data.token });

            // Return success without immediate verification
            return {
                ...data,
                success: true,
                isAdmin: true
            };
        } catch (error) {
            console.error('Admin login error:', error);
            localStorage.removeItem('adminToken');
            throw error;
        }
    }

    async verifyAdminToken() {
        try {
            const adminToken = localStorage.getItem('adminToken');
            console.log('Verifying admin token:', { hasToken: !!adminToken });
            
            if (!adminToken) {
                console.log('No admin token found in localStorage');
                return { valid: false, reason: 'no_token' };
            }

            console.log('Verifying admin token with server...');
            const response = await fetch(`${this.baseUrl}/admin/verify-token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            // Handle auth errors first
            if (response.status === 401 || response.status === 403) {
                console.log('Auth error response:', { status: response.status });
                localStorage.removeItem('adminToken');
                return { valid: false, reason: 'unauthorized' };
            }

            // Try to parse response as JSON
            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.error('Failed to parse verification response as JSON:', e);
                return { valid: false, reason: 'invalid_json' };
            }

            const isValid = response.ok && data.success && data.valid;
            console.log('Token verification result:', { 
                isValid, 
                status: response.status,
                success: data.success,
                valid: data.valid 
            });

            return { 
                valid: isValid,
                reason: isValid ? 'valid' : 'invalid',
                success: data.success
            };
        } catch (error) {
            console.error('Admin token verification error:', error);
            return { 
                valid: false, 
                reason: 'error',
                error: error.message 
            };
        }
    }

    async getAllUsers() {
        try {
            console.log('Fetching users from API...');
            const data = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/users`);
            console.log('Raw users response:', data);

            if (!data) {
                throw new Error('No data received from server');
            }

            // Validate the response format
            if (typeof data !== 'object') {
                throw new Error('Invalid response format: expected object');
            }

            // The backend returns { success: true, users: [...] }
            if (data.success && Array.isArray(data.users)) {
                console.log('Found users array:', data.users.length);
                
                // Validate each user object
                const validatedUsers = data.users.filter(user => {
                    if (!user || typeof user !== 'object') return false;
                    if (!user.username) return false;
                    return true;
                });

                return {
                    success: true,
                    data: validatedUsers
                };
            }

            throw new Error('Invalid response format from server');
        } catch (error) {
            console.error('Failed to fetch users:', error);
            // Don't redirect on fetch failures, just return error
            return {
                success: false,
                data: [],
                error: error.message
            };
        }
    }

    async getUserProgress(username) {
        try {
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/users/${username}/progress`);
            return {
                success: true,
                data: response.progress || {}
            };
        } catch (error) {
            console.error(`Failed to fetch progress for user ${username}:`, error);
            throw error;
        }
    }

    async adminLogout() {
        try {
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                await fetch(`${this.baseUrl}/admin/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                }).catch(console.error); // Don't throw if server logout fails
            }
        } finally {
            localStorage.removeItem('adminToken');
        }
    }

    async resetQuizProgress(username, quizName) {
        try {
            console.log('Resetting quiz progress:', { username, quizName });
            const data = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/users/${username}/quiz-scores/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quizName })
            });

            console.log('Reset quiz progress response:', data);
            return data;
        } catch (error) {
            console.error('Failed to reset quiz progress:', error);
            throw error;
        }
    }
} 