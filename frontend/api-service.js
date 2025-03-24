import { config } from './config.js';
import { getAuthToken, setAuthToken, clearTokens } from './auth.js';

export class APIService {
    constructor() {
        // Set the base URL with fallback logic
        this.baseUrl = this.getApiBaseUrl();
        console.log('APIService initialized with baseUrl:', this.baseUrl);
    }
    
    // Helper method to get the API base URL with fallback logic
    getApiBaseUrl() {
        try {
            // First try to use the config
            if (config && config.apiUrl) {
                return config.apiUrl;
            }
        } catch (error) {
            console.warn('Error accessing config.apiUrl:', error);
        }
        
        // Fallback logic if config is not available
        if (window.location.hostname.includes('render.com') || 
            window.location.hostname === 'bug-training-game.onrender.com') {
            return 'https://bug-training-game-api.onrender.com/api';
        } 
        else if (window.location.hostname.includes('amazonaws.com') || 
                 window.location.hostname.includes('s3-website') ||
                 window.location.hostname.includes('learning-hub')) {
            return 'http://13.42.151.152/api';
        }
        
        // Local development
        return '/api';
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
            
            // Ensure we have the correct URL (handle both absolute and relative URLs)
            const fullUrl = url.startsWith('http') ? url : url.startsWith('/') ? 
                `${this.baseUrl.replace(/\/api$/, '')}${url}` : 
                `${this.baseUrl}/${url.replace(/^api\//, '')}`;
            
            console.log('Fetching with admin auth:', { 
                url: fullUrl, 
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

            // Create fetch options with headers and any other options
            const fetchOptions = {
                ...options,
                credentials: 'include',
                headers
            };

            // Add signal if provided
            if (options.signal) {
                fetchOptions.signal = options.signal;
            }

            const response = await fetch(fullUrl, fetchOptions);

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
            // If this is an AbortError, just pass it through
            if (error.name === 'AbortError') {
                throw error;
            }
            
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
            throw new Error('No authentication token found');
        }

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        try {
            // Ensure we have the correct URL (handle both absolute and relative URLs)
            const fullUrl = url.startsWith('http') ? url : url.startsWith('/') ? 
                `${this.baseUrl.replace(/\/api$/, '')}${url}` : 
                `${this.baseUrl}/${url.replace(/^api\//, '')}`;
            
            console.log(`Fetching with auth: ${fullUrl}`);
            
            // Add signal to options if not already present
            const fetchOptions = {
                ...options,
                credentials: 'include',
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`
                },
                signal: options.signal || controller.signal
            };
            
            const response = await fetch(fullUrl, fetchOptions);
            
            // Clear timeout since fetch completed
            clearTimeout(timeoutId);
            
            if (!response.ok) {
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
                    } catch (refreshError) {
                        // If refresh fails, clear tokens and redirect to login
                        clearTokens();
                        console.error('Authentication failed. Redirecting to login...');
                        setTimeout(() => {
                            window.location.href = '/login.html';
                        }, 1000);
                        throw new Error('Authentication failed. Please log in again.');
                    }
                }
                
                const errorText = await response.text();
                throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            // Clear timeout in case of error
            clearTimeout(timeoutId);
            
            // Special handling for abort errors (timeouts)
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Server may be busy, please try again later.');
            }
            
            // Network errors
            if (error.message && error.message.includes('Failed to fetch')) {
                throw new Error('Network error. Please check your internet connection and try again.');
            }
            
            console.error('API request failed:', error);
            throw error;
        }
    }

    async getQuizProgress(quizName) {
        try {
            const data = await this.fetchWithAuth(`${this.baseUrl}/users/quiz-progress/${quizName}`);
            
            // If data is missing status, determine it based on the progress
            if (data && data.data && !data.data.status) {
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
            const data = await this.fetchWithAuth(`${this.baseUrl}/users/quiz-progress`, {
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

            console.log('Quiz progress saved successfully:', { quizName, data });
            return data;
        } catch (error) {
            console.error('Failed to save quiz progress:', error);
            return null;
        }
    }

    async updateQuizScore(quizName, score) {
        try {
            const data = await this.fetchWithAuth(`${this.baseUrl}/users/quiz-scores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quizName, score })
            });

            if (!data || !data.success) {
                throw new Error(data?.message || 'Failed to update quiz score');
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
                    lastLogin: user.lastLogin || null,
                    userType: user.userType || null,
                    allowedQuizzes: (user.allowedQuizzes || []).map(q => q.toLowerCase()),
                    hiddenQuizzes: (user.hiddenQuizzes || []).map(q => q.toLowerCase())
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

    async getQuizScenarios(quizName) {
        try {
            console.log(`Fetching scenarios for quiz: ${quizName}`);
            
            // Create a controller for the fetch request
            const controller = new AbortController();
            const signal = controller.signal;
            
            // Set a timeout to abort the fetch after 4 seconds
            const timeoutId = setTimeout(() => {
                controller.abort();
                console.warn(`Fetch for quiz scenarios timed out after 4 seconds: ${quizName}`);
            }, 4000);
            
            try {
                const response = await this.fetchWithAdminAuth(
                    `${this.baseUrl}/admin/quizzes/${quizName}/scenarios`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        signal
                    }
                );
                
                // Clear the timeout since the request completed
                clearTimeout(timeoutId);
                
                if (!response.success) {
                    console.error('Failed to fetch quiz scenarios:', response);
                    throw new Error(response.message || 'Failed to fetch quiz scenarios');
                }

                return {
                    success: true,
                    data: response.data || {
                        basic: [],
                        intermediate: [],
                        advanced: []
                    }
                };
            } catch (fetchError) {
                // Clear the timeout to prevent memory leaks
                clearTimeout(timeoutId);
                
                // Check if this was an abort error
                if (fetchError.name === 'AbortError') {
                    throw new Error(`Request for quiz scenarios timed out: ${quizName}`);
                }
                
                throw fetchError;
            }
        } catch (error) {
            console.error(`Failed to fetch scenarios for quiz ${quizName}:`, error);
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
            console.log('Fetching user data from:', `${this.baseUrl}/users/data`);
            
            const data = await this.fetchWithAuth(`${this.baseUrl}/users/data`);
            console.log('User data response:', data);
            
            if (!data || !data.success || !data.data) {
                console.error('User data response indicates failure:', data);
                throw new Error(data?.message || 'Failed to get user data');
            }

            // Ensure quiz arrays are lowercase for consistent comparison
            const allowedQuizzes = (data.data.allowedQuizzes || []).map(quiz => quiz.toLowerCase());
            const hiddenQuizzes = (data.data.hiddenQuizzes || []).map(quiz => quiz.toLowerCase());

            console.log('User data from API:', {
                username: data.data.username,
                userType: data.data.userType,
                allowedQuizzes,
                hiddenQuizzes
            });

            return {
                success: true,
                data: {
                    username: data.data.username,
                    userType: data.data.userType || 'regular',
                    allowedQuizzes,
                    hiddenQuizzes,
                    quizResults: data.data.quizResults || [],
                    quizProgress: data.data.quizProgress || {}
                }
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            
            // Add fallback behavior for development/testing
            if (window.location.hostname.includes('localhost') || 
                window.location.hostname.includes('127.0.0.1')) {
                console.warn('Using fallback user data for development');
                return {
                    success: true,
                    data: {
                        username: 'test_user',
                        userType: 'regular',
                        allowedQuizzes: [],
                        hiddenQuizzes: [],
                        quizResults: [],
                        quizProgress: {}
                    }
                };
            }
            
            throw error;
        }
    }
    
    // Quiz timer settings methods
    async getQuizTimerSettings() {
        try {
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/settings/quiz-timer`);
            
            // If no timer setting exists yet, return default value (60 seconds)
            if (!response.success || !response.data) {
                return {
                    success: true,
                    data: {
                        secondsPerQuestion: 60
                    }
                };
            }
            
            return response;
        } catch (error) {
            console.error('Failed to fetch quiz timer settings:', error);
            // Return default value on error
            return {
                success: true,
                data: {
                    secondsPerQuestion: 60
                }
            };
        }
    }
    
    async updateQuizTimerSettings(seconds) {
        try {
            // Validate input
            const secondsValue = parseInt(seconds, 10);
            if (isNaN(secondsValue) || secondsValue < 10 || secondsValue > 300) {
                throw new Error('Timer value must be between 10 and 300 seconds');
            }
            
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/settings/quiz-timer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    secondsPerQuestion: secondsValue
                })
            });
            
            return response;
        } catch (error) {
            console.error('Failed to update quiz timer settings:', error);
            throw error;
        }
    }
} 