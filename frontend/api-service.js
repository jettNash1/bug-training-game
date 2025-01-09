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
            console.log('Fetching with admin auth:', { 
                url, 
                hasToken: !!adminToken,
                method: options.method || 'GET'
            });

            if (!adminToken) {
                console.log('No admin token found');
                throw new Error('No admin token found');
            }

            // Handle mock admin token
            if (adminToken.startsWith('admin:')) {
                const timestamp = parseInt(adminToken.split(':')[1]);
                const now = Date.now();
                if ((now - timestamp) >= 24 * 60 * 60 * 1000) {
                    console.log('Mock token expired');
                    throw new Error('Mock token expired');
                }
            } else {
                // Verify real token before making request
                console.log('Verifying admin token before request...');
                const tokenVerification = await this.verifyAdminToken();
                console.log('Token verification result:', tokenVerification);
                
                if (!tokenVerification.valid) {
                    throw new Error(`Invalid admin token: ${tokenVerification.reason}`);
                }
            }

            console.log('Token verified, making request...');
            const headers = {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json',
                ...options.headers
            };

            const response = await fetch(url, {
                ...options,
                credentials: 'include',
                headers
            });

            // Try to parse response as JSON
            try {
                const text = await response.text();
                console.log('Response text:', text);
                
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error('Failed to parse response as JSON:', text);
                    throw new Error('Invalid response from server');
                }

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`API endpoint not found: ${url}`);
                    } else if (response.status === 401) {
                        throw new Error('Admin authentication required');
                    } else {
                        throw new Error(data.message || `Request failed with status ${response.status}`);
                    }
                }

                return data;
            } catch (error) {
                console.error('Request failed:', error);
                throw error;
            }
        } catch (error) {
            console.error('Admin request failed:', error);
            
            // Handle different error types
            if (error.message.includes('No admin token found') || 
                error.message.includes('Invalid admin token') ||
                error.message.includes('Admin authentication required')) {
                localStorage.removeItem('adminToken');
                // Add a small delay to see the error in console
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.replace('/pages/admin-login.html');
            }
            
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

    // Admin-specific methods
    async adminLogin(username, password) {
        try {
            console.log('Attempting admin login:', { username });
            
            // Clear any existing admin token first
            localStorage.removeItem('adminToken');
            
            // Special handling for mock admin - do this before any server calls
            if (username === 'admin' && password === 'admin123') {
                console.log('Using mock admin credentials');
                const mockToken = `admin:${Date.now()}`;
                localStorage.setItem('adminToken', mockToken);
                console.log('Mock admin token stored successfully');
                return { 
                    token: mockToken, 
                    success: true,
                    isAdmin: true
                };
            }

            // Handle normal admin login
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

            // Handle mock admin token
            if (adminToken.startsWith('admin:')) {
                const timestamp = parseInt(adminToken.split(':')[1]);
                const now = Date.now();
                const isValid = (now - timestamp) < 24 * 60 * 60 * 1000;
                console.log('Mock token validation result:', { isValid, timestamp, now });
                return { 
                    valid: isValid,
                    reason: isValid ? 'valid_mock' : 'expired_mock',
                    isAdmin: isValid,
                    success: isValid
                };
            }

            console.log('Verifying admin token with server...');
            const response = await fetch(`${this.baseUrl}/admin/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            // Try to read the response text first
            const text = await response.text();
            console.log('Token verification response:', text);

            // Then parse it as JSON if possible
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse verification response as JSON:', e);
                // Don't remove token on parse error, might be temporary
                return { valid: false, reason: 'invalid_json' };
            }

            const isValid = response.ok && data.success && data.isAdmin;
            console.log('Token verification result:', { 
                isValid, 
                status: response.status,
                success: data.success,
                isAdmin: data.isAdmin 
            });

            // Only remove token if we get a clear invalid response
            if (response.status === 401 || (response.ok && !data.isAdmin)) {
                console.log('Removing invalid token');
                localStorage.removeItem('adminToken');
            }

            return { 
                valid: isValid,
                reason: isValid ? 'valid' : 'invalid',
                isAdmin: data.isAdmin,
                success: data.success
            };
        } catch (error) {
            console.error('Admin token verification error:', error);
            // Don't remove token on network errors, might be temporary
            return { 
                valid: false, 
                reason: 'error',
                error: error.message 
            };
        }
    }

    async getAllUsers() {
        try {
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/users`);
            return {
                success: true,
                data: Array.isArray(response) ? response : response.users || []
            };
        } catch (error) {
            console.error('Failed to fetch users:', error);
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
} 