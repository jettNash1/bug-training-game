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
            let text;
            try {
                text = await response.text();
                console.log('Response text:', text);
                
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error('Failed to parse response as JSON:', text);
                    throw new Error('Invalid response from server');
                }

                // If we get a 500 error, it's likely a server issue
                if (response.status === 500) {
                    console.error('Server error:', data);
                    return {
                        success: false,
                        error: data.error || data.message || 'Internal server error',
                        data: data.data || []
                    };
                }

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`API endpoint not found: ${url}`);
                    } else if (response.status === 401) {
                        // Check if we need to refresh the token or re-verify
                        const verificationResult = await this.verifyAdminToken();
                        if (!verificationResult.valid) {
                            throw new Error('Admin authentication required');
                        }
                        // If verification succeeded but we still got 401, throw error
                        throw new Error('Admin authentication failed: ' + (data.message || 'Unauthorized'));
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
            
            // Only redirect on authentication errors
            if (error.message.includes('Admin authentication required') || 
                error.message.includes('Admin authentication failed')) {
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
            const data = await response.json();
            
            // If data is missing status, determine it based on the progress
            if (data.data && !data.data.status) {
                const progress = data.data;
                if (progress.questionsAnswered >= 15) {
                    progress.status = progress.experience >= 300 ? 'completed' : 'failed';
                } else if (progress.questionsAnswered >= 10 && progress.experience < 150) {
                    progress.status = 'failed';
                } else if (progress.questionsAnswered >= 5 && progress.experience < 50) {
                    progress.status = 'failed';
                } else if (progress.questionsAnswered > 0) {
                    progress.status = 'in-progress';
                }
            }
            
            console.log('Quiz progress received from API:', { quizName, data });
            return data;
        } catch (error) {
            console.error('Failed to get quiz progress:', error);
            return null;
        }
    }

    async saveQuizProgress(quizName, progress) {
        try {
            // Ensure status is set before saving
            if (!progress.status) {
                if (progress.questionsAnswered >= 15) {
                    progress.status = progress.experience >= 300 ? 'completed' : 'failed';
                } else if (progress.questionsAnswered >= 10 && progress.experience < 150) {
                    progress.status = 'failed';
                } else if (progress.questionsAnswered >= 5 && progress.experience < 50) {
                    progress.status = 'failed';
                } else if (progress.questionsAnswered > 0) {
                    progress.status = 'in-progress';
                }
            }

            console.log('Saving quiz progress to API:', { quizName, progress });
            const response = await this.fetchWithAuth(`${this.baseUrl}/users/quiz-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    quizName, 
                    progress: {
                        ...progress,
                        status: progress.status // Ensure status is included
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save quiz progress');
            }
            const data = await response.json();
            console.log('Quiz progress saved successfully:', { quizName, data });
            return data;
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

            const isValid = response.ok && data.success && data.valid;
            console.log('Token verification result:', { 
                isValid, 
                status: response.status,
                success: data.success,
                valid: data.valid 
            });

            // Only remove token if we get a clear invalid response
            if (response.status === 401 || (response.ok && !data.valid)) {
                console.log('Removing invalid token');
                localStorage.removeItem('adminToken');
            }

            return { 
                valid: isValid,
                reason: isValid ? 'valid' : 'invalid',
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
            // Fetch real data from MongoDB through the API
            const data = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/users`);
            console.log('Raw users response:', JSON.stringify(data, null, 2));

            // Check if data is valid
            if (!data) {
                console.warn('No data received from server');
                return {
                    success: false,
                    data: [],
                    error: 'No data received from server'
                };
            }

            // If we got an error response, return it directly
            if (!data.success) {
                return data; // This will include error message and empty data array
            }

            // At this point, we should have valid data
            // If users array is missing, return empty array
            if (!data.users) {
                console.warn('No users array in response:', data);
                return {
                    success: true,
                    data: [],
                    message: 'No users found'
                };
            }

            // Ensure users is an array
            const users = Array.isArray(data.users) ? data.users : [];
            console.log('Processing users array:', JSON.stringify(users, null, 2));

            // Process each user's data
            const processedUsers = users.map(user => {
                if (!user || typeof user !== 'object') return null;

                try {
                // Ensure required fields exist
                const processedUser = {
                    username: user.username || 'Unknown User',
                    quizResults: [],
                    quizProgress: {},
                    lastLogin: user.lastLogin || null
                };

                    // Safely process quiz results
                    if (user.quizResults) {
                        processedUser.quizResults = Array.isArray(user.quizResults) 
                            ? user.quizResults
                                .filter(result => result && typeof result === 'object')
                                .map(result => ({
                                    quizName: String(result.quizName || '').toLowerCase(),
                            score: Number(result.score) || 0,
                            experience: Number(result.experience) || 0,
                            questionsAnswered: Number(result.questionsAnswered) || 0,
                            lastActive: result.lastActive || result.completedAt || null
                                }))
                            : [];
                }

                    // Safely process quiz progress
                if (user.quizProgress && typeof user.quizProgress === 'object') {
                        processedUser.quizProgress = Object.entries(user.quizProgress)
                            .reduce((acc, [key, value]) => {
                        if (value && typeof value === 'object') {
                                    acc[String(key).toLowerCase()] = {
                                experience: Number(value.experience) || 0,
                                questionsAnswered: Number(value.questionsAnswered) || 0,
                                lastUpdated: value.lastUpdated || null
                            };
                        }
                        return acc;
                    }, {});
                }

                return processedUser;
                } catch (error) {
                    console.error('Error processing user:', user, error);
                    return null;
                }
            }).filter(Boolean); // Remove null entries

            console.log('Processed users:', JSON.stringify(processedUsers, null, 2));

            return {
                success: true,
                data: processedUsers
            };
        } catch (error) {
            console.error('Failed to fetch users:', error);
            return {
                success: false,
                data: [],
                error: error.message || 'Failed to fetch users'
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

    async getQuizQuestions(username, quizName) {
        try {
            console.log(`Fetching quiz questions for ${username}/${quizName}`);
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/users/${username}/quiz-questions/${quizName}`);
            console.log('Raw quiz questions response:', response);
            
            // If the response itself is not successful
            if (!response.success) {
                console.error('Failed to fetch quiz questions:', response);
                throw new Error(response.message || 'Failed to fetch quiz questions');
            }

            // If there's no data or no question history
            if (!response.data) {
                console.warn('No data found in response:', response);
                return {
                    success: true,
                    data: {
                        questionHistory: [],
                        totalQuestions: 0,
                        score: 0,
                        experience: 0,
                        lastActive: null
                    }
                };
            }

            // Ensure questionHistory is an array
            if (!Array.isArray(response.data.questionHistory)) {
                console.warn('Question history is not an array:', response.data);
                response.data.questionHistory = [];
            }

            return {
                success: true,
                data: {
                    questionHistory: response.data.questionHistory || [],
                    totalQuestions: response.data.totalQuestions || 0,
                    score: response.data.score || 0,
                    experience: response.data.experience || 0,
                    lastActive: response.data.lastActive || null
                }
            };
        } catch (error) {
            console.error(`Failed to fetch quiz questions for ${username}/${quizName}:`, error);
            throw error;
        }
    }

    // Add resetUserPassword method
    async resetUserPassword(username, newPassword) {
        try {
            const response = await this.fetchWithAdminAuth(
                `${this.baseUrl}/admin/users/${username}/reset-password`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ password: newPassword })
                }
            );

            return response;
        } catch (error) {
            console.error('Failed to reset password:', error);
            throw error;
        }
    }

    async getUserData() {
        try {
            const response = await this.fetchWithAuth(`${this.baseUrl}/users/data`);
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to get user data');
            }
            return {
                success: true,
                data: {
                    username: data.username,
                    userType: data.userType,
                    allowedQuizzes: data.allowedQuizzes,
                    hiddenQuizzes: data.hiddenQuizzes,
                    quizResults: data.quizResults || [],
                    quizProgress: data.quizProgress || {}
                }
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }
} 