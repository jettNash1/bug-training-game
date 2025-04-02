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
            if (!adminToken) {
                throw new Error('No admin token found. Please login again.');
            }
            
            // Ensure we have the correct URL (handle both absolute and relative URLs)
            const fullUrl = url.startsWith('http') ? url : 
                          url.startsWith('/') ? `${this.baseUrl.replace(/\/api$/, '')}${url}` : 
                          `${this.baseUrl}/${url.replace(/^api\//, '')}`;
            
            // Prepare headers with authentication
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
                ...(options.headers || {})
            };
            
            // Merge options
            const mergedOptions = {
                method: 'GET',
                ...options,
                headers,
                credentials: 'include'
            };
            
            console.log('Fetching with admin auth:', {
                url: fullUrl,
                hasToken: !!adminToken,
                method: mergedOptions.method
            });
            
            // Perform the fetch
            const response = await fetch(fullUrl, mergedOptions);
            
            // Check for unauthorized response
            if (response.status === 401) {
                console.error('Admin fetch received 401 Unauthorized', fullUrl);
                localStorage.removeItem('adminToken');
                throw new Error('You have been logged out. Please login again.');
            }
            
            // Better handling of error responses
            if (!response.ok) {
                const statusText = response.statusText || `HTTP error ${response.status}`;
                console.error(`Admin fetch error: ${statusText}`, fullUrl);
                
                try {
                    // Attempt to parse error details from the response
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        throw new Error(errorData.message);
                    }
                } catch (jsonError) {
                    // If JSON parsing fails, throw a generic error with the status
                    throw new Error(`Request failed: ${statusText}`);
                }
                
                // Fallback if no error is thrown above
                throw new Error(`Request failed: ${statusText}`);
            }
            
            try {
                // Try to parse the response as JSON
                const data = await response.json();
                return data;
            } catch (jsonParseError) {
                console.warn('Response is not valid JSON:', fullUrl);
                // For API endpoints that don't return JSON, return the raw response
                return { success: true, message: 'Response received but was not JSON' };
            }
        } catch (error) {
            console.error('Error in fetchWithAdminAuth:', error, url);
            
            // Special handling for network errors
            if (error.name === 'TypeError' && error.message.includes('network')) {
                return { 
                    success: false, 
                    error: 'Network error. Please check your connection.',
                    status: 'network_error'
                };
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
            
            console.log(`[API] Fetching with auth: ${fullUrl}`);
            
            // Add signal to options if not already present
            const fetchOptions = {
                ...options,
                credentials: 'include',
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
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
                
                // Get the error text and try to parse as JSON
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                    throw new Error(errorData.message || `API error (${response.status}): ${response.statusText}`);
                } catch (e) {
                    // If parsing fails, use the raw text
                    throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
                }
            }
            
            // Try to parse the response as JSON
            const responseText = await response.text();
            try {
                const data = JSON.parse(responseText);
                return {
                    success: true,
                    data: data.data || data
                };
            } catch (e) {
                console.warn('[API] Response is not valid JSON:', responseText);
                return {
                    success: true,
                    data: responseText
                };
            }
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
            
            console.error('[API] Request failed:', error);
            throw error;
        }
    }

    async getQuizProgress(quizName) {
        try {
            console.log(`[API] Getting progress for quiz: ${quizName}`);
            
            const response = await this.fetchWithAuth(`${this.baseUrl}/users/quiz-progress/${quizName}`);
            console.log(`[API] Raw quiz progress response:`, response);
            
            // If no data found, return default structure
            if (!response || !response.data) {
                console.log(`[API] No progress found for quiz ${quizName}, returning default`);
                return {
                    success: true,
                    data: {
                        experience: 0,
                        questionsAnswered: 0,
                        status: 'not-started',
                        scorePercentage: 0,
                        tools: [],
                        questionHistory: []
                    }
                };
            }

            // Ensure all required fields are present
            const progress = {
                ...response.data,
                experience: response.data.experience || 0,
                questionsAnswered: response.data.questionsAnswered || 0,
                status: response.data.status || 'not-started',
                scorePercentage: typeof response.data.scorePercentage === 'number' ? response.data.scorePercentage : 0,
                tools: response.data.tools || [],
                questionHistory: response.data.questionHistory || []
            };

            console.log(`[API] Processed quiz progress:`, progress);

            return {
                success: true,
                data: progress
            };
        } catch (error) {
            console.error(`[API] Error getting quiz progress for ${quizName}:`, error);
            return {
                success: false,
                error: error.message,
                data: {
                    experience: 0,
                    questionsAnswered: 0,
                    status: 'not-started',
                    scorePercentage: 0,
                    tools: [],
                    questionHistory: []
                }
            };
        }
    }

    async saveQuizProgress(quizName, progress) {
        try {
            console.log(`[API] Saving progress for quiz ${quizName}:`, progress);
            
            // Ensure all required fields are present
            const progressData = {
                experience: progress.experience || 0,
                questionsAnswered: progress.questionsAnswered || 0,
                status: progress.status || 'in-progress',
                scorePercentage: typeof progress.scorePercentage === 'number' ? progress.scorePercentage : 0,
                tools: progress.tools || [],
                questionHistory: progress.questionHistory || [],
                lastUpdated: new Date().toISOString()
            };

            console.log(`[API] Processed progress data:`, progressData);

            const response = await this.fetchWithAuth(
                `${this.baseUrl}/users/quiz-progress`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        quizName: quizName,
                        progress: progressData
                    })
                }
            );

            if (!response.success) {
                throw new Error(response.message || 'Failed to save quiz progress');
            }

            console.log(`[API] Successfully saved progress for quiz ${quizName}`);
            return {
                success: true,
                data: progressData
            };
        } catch (error) {
            console.error(`[API] Error saving quiz progress:`, error);
            return {
                success: false,
                message: error.message || 'Failed to save quiz progress',
                data: progress // Return original progress in case of error
            };
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
            console.log(`Fetching progress for user: ${username}`);
            
            // Create a controller for the fetch request to implement a timeout
            const controller = new AbortController();
            const signal = controller.signal;
            
            // Set a timeout to abort the fetch after 10 seconds
            const timeoutId = setTimeout(() => {
                controller.abort();
                console.warn(`Fetch for user progress timed out after 10 seconds: ${username}`);
            }, 10000);
            
            try {
                const response = await this.fetchWithAdminAuth(
                    `${this.baseUrl}/admin/users/${username}/progress`,
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
                
                console.log(`Response from getUserProgress for ${username}:`, response);
                
                if (!response) {
                    return {
                        success: false,
                        message: 'Empty response from server',
                        data: {}
                    };
                }
                
                return {
                    success: true,
                    data: response.progress || response || {}
                };
            } catch (fetchError) {
                // Clear the timeout to prevent memory leaks
                clearTimeout(timeoutId);
                
                // Check if this was an abort error
                if (fetchError.name === 'AbortError') {
                    console.error(`Request for user progress timed out: ${username}`);
                    return {
                        success: false,
                        message: 'Request timed out',
                        data: {}
                    };
                }
                
                throw fetchError;
            }
        } catch (error) {
            console.error(`Failed to fetch progress for user ${username}:`, error);
            return {
                success: false,
                message: error.message || 'Failed to fetch user progress',
                data: {}
            };
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

    async getUserBadgesByAdmin(username) {
        try {
            console.log(`Getting badges for user: ${username}`);
            
            // Get user progress data first
            const userProgressResponse = await this.getUserProgress(username);
            console.log('User progress response for badges:', userProgressResponse);
            
            if (!userProgressResponse.success) {
                console.error('Failed to get user progress for badges (success false):', userProgressResponse);
                throw new Error('Failed to get user progress data');
            }
            
            if (!userProgressResponse.data) {
                console.error('Failed to get user progress data (no data):', userProgressResponse);
                return {
                    success: true,
                    data: {
                        badges: [],
                        totalBadges: 0,
                        earnedCount: 0
                    }
                };
            }
            
            // Handle different possible response structures
            let quizProgress = {};
            
            if (userProgressResponse.data.quizProgress) {
                // New structure with nested quizProgress
                quizProgress = userProgressResponse.data.quizProgress;
                console.log('Found quiz progress in data.quizProgress');
            } else if (typeof userProgressResponse.data === 'object' && Object.keys(userProgressResponse.data).length > 0) {
                // Legacy structure where the data itself might be quizProgress
                const possibleQuizzes = Object.keys(userProgressResponse.data)
                    .filter(key => typeof userProgressResponse.data[key] === 'object' && 
                           (userProgressResponse.data[key].questionsAnswered !== undefined ||
                            userProgressResponse.data[key].status !== undefined ||
                            userProgressResponse.data[key].questionHistory !== undefined));
                
                if (possibleQuizzes.length > 0) {
                    quizProgress = userProgressResponse.data;
                    console.log('Found quiz progress directly in data object');
                }
            }
            
            console.log('Quiz progress extracted:', quizProgress);
            
            // Get all quizzes from the progress data
            const allQuizzes = Object.keys(quizProgress).map(quizId => ({
                id: quizId,
                name: this.formatQuizName(quizId)
            }));
            
            console.log(`Found ${allQuizzes.length} quizzes for user ${username}:`, allQuizzes);
            
            if (allQuizzes.length === 0) {
                return {
                    success: true,
                    data: {
                        badges: [],
                        totalBadges: 0,
                        earnedCount: 0
                    }
                };
            }
            
            // Process quiz completion status
            const badges = allQuizzes.map(quiz => {
                const progress = quizProgress[quiz.id] || {};
                console.log(`Processing quiz ${quiz.id}:`, progress);
                
                // Check if quiz is complete based on status or progress
                const isCompleted = progress && (
                    progress.status === 'completed' ||
                    progress.status === 'passed' ||
                    (progress.questionHistory && progress.questionHistory.length >= 15) ||
                    (typeof progress.questionsAnswered === 'number' && progress.questionsAnswered >= 15)
                );
                
                console.log(`Quiz ${quiz.id} completion status:`, isCompleted);
                
                return {
                    id: `quiz-${quiz.id}`,
                    name: `${quiz.name} Master`,
                    description: `Complete the ${quiz.name} quiz`,
                    icon: 'fa-solid fa-check-circle',
                    earned: isCompleted,
                    completionDate: isCompleted ? (progress.lastUpdated || progress.completedAt || null) : null,
                    quizId: quiz.id
                };
            });
            
            // Sort badges: completed first, then alphabetically by name
            badges.sort((a, b) => {
                // First sort by completion status
                if (a.earned && !b.earned) return -1;
                if (!a.earned && b.earned) return 1;
                
                // Then sort alphabetically by name
                return a.name.localeCompare(b.name);
            });
            
            // Count completed badges
            const completedCount = badges.filter(badge => badge.earned).length;
            
            const result = {
                success: true,
                data: {
                    badges,
                    totalBadges: badges.length,
                    earnedCount: completedCount
                }
            };
            
            console.log('Final badges result:', result);
            return result;
        } catch (error) {
            console.error(`Error getting badges for user ${username}:`, error);
            return {
                success: false,
                message: error.message || 'Failed to load badges',
                data: {
                    badges: [],
                    totalBadges: 0,
                    earnedCount: 0
                }
            };
        }
    }

    // Helper method to format quiz names (used by getUserBadgesByAdmin)
    formatQuizName(quizId) {
        if (!quizId) return '';
        return quizId
            .split(/[-_]/) // Split on either hyphen or underscore
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Quiz timer settings methods
    async getQuizTimerSettings() {
        try {
            try {
                // Try to get from API first
                const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/settings/quiz-timer`);
                console.log('Raw timer settings response:', response);
                
                // If response is successful, update localStorage and return the value
                if (response.success && response.data && response.data.value) {
                    const settings = response.data.value;
                    console.log('Timer settings loaded from API:', settings);
                    
                    // Ensure we have valid defaultSeconds and quizTimers
                    const defaultSeconds = typeof settings.defaultSeconds === 'number' ? settings.defaultSeconds : 60;
                    const quizTimers = settings.quizTimers || {};
                    
                    // Store in localStorage for immediate effect on quizzes
                    localStorage.setItem('quizTimerValue', defaultSeconds.toString());
                    localStorage.setItem('perQuizTimerSettings', JSON.stringify(quizTimers));
                    
                    return {
                        success: true,
                        message: 'Timer settings loaded from API',
                        data: {
                            defaultSeconds: defaultSeconds,
                            quizTimers: quizTimers,
                            updatedAt: settings.updatedAt || new Date().toISOString()
                        }
                    };
                }
            } catch (apiError) {
                console.warn('Failed to fetch quiz timer settings from API:', apiError);
            }
            
            // If API call failed or returned no data, use localStorage as fallback
            const storedTimerValue = localStorage.getItem('quizTimerValue');
            const defaultSeconds = storedTimerValue !== null ? parseInt(storedTimerValue, 10) : 60;
            
            // Get quiz-specific timer settings from localStorage
            const perQuizTimersJson = localStorage.getItem('perQuizTimerSettings');
            let quizTimers = {};
            try {
                if (perQuizTimersJson) {
                    quizTimers = JSON.parse(perQuizTimersJson);
                    // Validate each timer value
                    Object.entries(quizTimers).forEach(([quiz, value]) => {
                        if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 300) {
                            delete quizTimers[quiz];
                        }
                    });
                }
            } catch (parseError) {
                console.warn('Error parsing perQuizTimerSettings from localStorage:', parseError);
            }
            
            console.log('Using localStorage fallback for timer settings:', {
                defaultSeconds,
                quizTimers
            });
            
            return {
                success: true,
                message: 'Timer settings retrieved from localStorage',
                data: {
                    defaultSeconds: defaultSeconds,
                    quizTimers: quizTimers,
                    updatedAt: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Failed to fetch quiz timer settings:', error);
            return {
                success: true,
                data: {
                    defaultSeconds: 60,
                    quizTimers: {},
                    updatedAt: new Date().toISOString()
                }
            };
        }
    }
    
    async updateQuizTimerSettings(defaultSeconds, quizTimers = {}) {
        try {
            // Validate input for default timer (allow 0 to disable the timer)
            const defaultValue = Number(defaultSeconds);
            console.log(`Updating timer settings with value: ${defaultValue}, type: ${typeof defaultValue}`);
            
            if (isNaN(defaultValue) || defaultValue < 0 || defaultValue > 300) {
                throw new Error('Timer value must be between 0 and 300 seconds');
            }
            
            // Validate per-quiz timer values
            const validatedQuizTimers = {};
            for (const [quizName, seconds] of Object.entries(quizTimers)) {
                const value = Number(seconds);
                if (!isNaN(value) && value >= 0 && value <= 300) {
                    validatedQuizTimers[quizName] = value;
                } else {
                    console.warn(`Invalid timer value for quiz ${quizName}: ${seconds}. Skipping.`);
                }
            }
            
            try {
                // Try to save to the API first using the API's expected format
                console.log('Sending to API with secondsPerQuestion format:', {
                    secondsPerQuestion: defaultValue
                });
                
                const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/settings/quiz-timer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        secondsPerQuestion: defaultValue
                    })
                });
                
                // If successful, update localStorage and return formatted response
                if (response.success) {
                    localStorage.setItem('quizTimerValue', defaultValue.toString());
                    localStorage.setItem('perQuizTimerSettings', JSON.stringify(validatedQuizTimers));
                    console.log('Timer settings saved to API:', response.data);
                    
                    // Return in our application's expected format
                    return {
                        success: true,
                        message: response.message || 'Timer settings updated successfully',
                        data: {
                            defaultSeconds: defaultValue,
                            quizTimers: validatedQuizTimers
                        }
                    };
                }
                
                return response;
            } catch (apiError) {
                console.warn('Failed to save timer settings to API, using localStorage fallback:', apiError);
                
                // API likely doesn't exist yet, so just use localStorage as a fallback
                // Store in localStorage directly
                localStorage.setItem('quizTimerValue', defaultValue.toString());
                localStorage.setItem('perQuizTimerSettings', JSON.stringify(validatedQuizTimers));
                
                // Create a mock successful response
                const fallbackResponse = {
                    success: true,
                    message: 'Timer settings saved to localStorage (API not available)',
                    data: {
                        defaultSeconds: defaultValue,
                        quizTimers: validatedQuizTimers
                    }
                };
                
                // Log the fallback
                console.log('Using localStorage fallback for timer settings:', fallbackResponse.data);
                
                // Return the mock response to indicate success
                return fallbackResponse;
            }
        } catch (error) {
            console.error('Failed to update quiz timer settings:', error);
            throw error;
        }
    }
    
    async getQuizTimerValue(quizName) {
        try {
            // Get all timer settings
            const response = await this.getQuizTimerSettings();
            console.log('Retrieved timer settings:', response);
            
            if (response.success && response.data) {
                const { defaultSeconds, quizTimers } = response.data;
                
                // Check if this quiz has a specific timer setting
                if (quizTimers && quizName && quizTimers[quizName] !== undefined) {
                    const quizSpecificTimer = Number(quizTimers[quizName]);
                    console.log(`Using specific timer for ${quizName}: ${quizSpecificTimer} seconds`);
                    return quizSpecificTimer;
                }
                
                // Otherwise return the default
                const defaultTimer = Number(defaultSeconds);
                console.log(`Using default timer for ${quizName}: ${defaultTimer} seconds`);
                return defaultTimer;
            }
            
            // Fallback to localStorage if API response is invalid
            const perQuizTimersJson = localStorage.getItem('perQuizTimerSettings');
            if (perQuizTimersJson) {
                try {
                    const perQuizTimers = JSON.parse(perQuizTimersJson);
                    if (perQuizTimers[quizName] !== undefined) {
                        const storedQuizTimer = Number(perQuizTimers[quizName]);
                        console.log(`Using localStorage quiz-specific timer for ${quizName}: ${storedQuizTimer} seconds`);
                        return storedQuizTimer;
                    }
                } catch (e) {
                    console.warn('Error parsing perQuizTimerSettings from localStorage:', e);
                }
            }
            
            // Final fallback to default timer value
            const storedValue = localStorage.getItem('quizTimerValue');
            const defaultValue = storedValue !== null ? parseInt(storedValue, 10) : 60;
            console.log(`Using fallback timer value for ${quizName}: ${defaultValue} seconds`);
            return defaultValue;
        } catch (error) {
            console.error(`Failed to get timer value for quiz ${quizName}:`, error);
            return 60; // Default fallback
        }
    }
    
    async updateSingleQuizTimer(quizName, seconds) {
        try {
            if (!quizName) {
                throw new Error('Quiz name is required');
            }

            // Validate input and log values for debugging
            console.log(`Setting timer for ${quizName} to ${seconds} seconds (raw value)`);
            
            // Ensure we're working with a number
            const value = typeof seconds === 'string' ? parseInt(seconds, 10) : Number(seconds);
            console.log(`Parsed value: ${value}, isNaN: ${isNaN(value)}, type: ${typeof value}`);
            
            if (isNaN(value) || value < 0 || value > 300) {
                throw new Error('Timer value must be between 0 and 300 seconds');
            }
            
            // Get current settings
            const settings = await this.getQuizTimerSettings();
            console.log('Current timer settings:', settings.data);
            
            // Create the updated quiz timers object
            const quizTimers = { ...settings.data.quizTimers };
            
            // Only set the timer if it's different from the default
            if (value !== settings.data.defaultSeconds) {
                quizTimers[quizName] = value;
            } else {
                // If the value matches the default, remove the specific timer
                delete quizTimers[quizName];
            }
            
            // Save to localStorage as backup
            localStorage.setItem('perQuizTimerSettings', JSON.stringify(quizTimers));
            
            // Send to API with the format it expects
            try {
                const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/settings/quiz-timer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        secondsPerQuestion: value,
                        quizName: quizName
                    })
                });
                
                if (response.success) {
                    console.log('Timer settings saved to API:', response.data);
                    
                    // Update localStorage with the latest settings from the API
                    if (response.data.value) {
                        localStorage.setItem('quizTimerValue', response.data.value.defaultSeconds.toString());
                        localStorage.setItem('perQuizTimerSettings', JSON.stringify(response.data.value.quizTimers));
                    }
                    
                    return {
                        success: true,
                        message: 'Timer setting saved successfully',
                        data: response.data.value || {
                            defaultSeconds: settings.data.defaultSeconds,
                            quizTimers: quizTimers
                        }
                    };
                }
                
                throw new Error(response.message || 'Failed to save timer settings to API');
            } catch (apiError) {
                console.warn('Failed to save timer settings to API:', apiError);
                
                // Return a mock successful response using localStorage values
                return {
                    success: true,
                    message: 'Quiz timer setting saved to localStorage (API not available)',
                    data: {
                        defaultSeconds: settings.data.defaultSeconds,
                        quizTimers: quizTimers
                    }
                };
            }
        } catch (error) {
            console.error(`Failed to update timer for quiz ${quizName}:`, error);
            throw error;
        }
    }
    
    async resetQuizTimer(quizName) {
        try {
            console.log(`Resetting timer for quiz ${quizName}`);
            
            // Get current settings
            const settings = await this.getQuizTimerSettings();
            console.log('Current timer settings:', settings.data);
            
            // Get the default seconds value as a number
            const defaultSeconds = Number(settings.data.defaultSeconds);
            
            // Remove the specific quiz timer if it exists
            const quizTimers = settings.data.quizTimers || {};
            if (quizTimers[quizName] !== undefined) {
                delete quizTimers[quizName];
                console.log(`Removed timer setting for ${quizName}, updated timers:`, quizTimers);
                
                // Save directly to localStorage
                try {
                    localStorage.setItem('perQuizTimerSettings', JSON.stringify(quizTimers));
                    localStorage.setItem('quizTimerValue', defaultSeconds.toString());
                    console.log('Successfully saved to localStorage as backup');
                } catch (localError) {
                    console.warn('Failed to save to localStorage:', localError);
                }
                
                // Save with direct API call using the format the API expects
                try {
                    console.log('Sending to API with secondsPerQuestion format:', {
                        secondsPerQuestion: defaultSeconds
                    });
                    
                    const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/settings/quiz-timer`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            secondsPerQuestion: defaultSeconds
                        })
                    });
                    
                    // If successful, return a response that matches our expected format
                    if (response.success) {
                        console.log('Updated timer settings saved to API');
                        
                        return {
                            success: true,
                            message: 'Timer reset successfully',
                            data: {
                                defaultSeconds: defaultSeconds,
                                quizTimers: quizTimers
                            }
                        };
                    }
                    
                    return response;
                } catch (apiError) {
                    console.warn('Failed to save updated timer settings to API:', apiError);
                    
                    // Return a mock successful response
                    return {
                        success: true,
                        message: 'Timer settings updated in localStorage (API not available)',
                        data: {
                            defaultSeconds: defaultSeconds,
                            quizTimers: quizTimers
                        }
                    };
                }
            } else {
                console.log(`No custom timer setting found for ${quizName}`);
                // Nothing changed, return current settings
                return settings;
            }
        } catch (error) {
            console.error(`Failed to reset timer for quiz ${quizName}:`, error);
            throw error;
        }
    }

    // Schedule-related methods
    
    async getScheduledResets() {
        try {
            console.log('Fetching scheduled resets from API');
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/schedules`);
            
            if (response.success) {
                // Validate and process the schedules data
                const schedules = Array.isArray(response.data) ? response.data.map(schedule => ({
                    id: schedule._id || schedule.id,
                    username: schedule.username || '',
                    quizName: schedule.quizName || '',
                    resetDateTime: schedule.resetDateTime || new Date().toISOString(),
                    createdAt: schedule.createdAt || new Date().toISOString()
                })) : [];
                
                console.log('Successfully fetched scheduled resets from API:', schedules);
                return {
                    success: true,
                    data: schedules
                };
            } else {
                throw new Error(response.message || 'Failed to fetch scheduled resets');
            }
        } catch (error) {
            console.error('Error fetching scheduled resets:', error);
            
            // Use localStorage as fallback with validation
            console.warn('Using localStorage fallback for scheduled resets');
            try {
                const schedulesJson = localStorage.getItem('scheduledResets');
                const schedules = schedulesJson ? JSON.parse(schedulesJson) : [];
                
                // Validate and clean up localStorage data
                const validSchedules = schedules.filter(schedule => {
                    return schedule && 
                           typeof schedule.id === 'string' &&
                           typeof schedule.username === 'string' &&
                           typeof schedule.quizName === 'string' &&
                           typeof schedule.resetDateTime === 'string' &&
                           typeof schedule.createdAt === 'string';
                });
                
                return {
                    success: true,
                    fallback: true,
                    message: 'Using localStorage fallback for scheduled resets',
                    data: validSchedules
                };
            } catch (localError) {
                console.error('Error processing localStorage fallback:', localError);
                return {
                    success: false,
                    message: 'Failed to fetch scheduled resets',
                    error: error.message
                };
            }
        }
    }
    
    async createScheduledReset(username, quizName, resetDateTime) {
        try {
            // Validate inputs
            if (!username || !quizName || !resetDateTime) {
                throw new Error('Missing required fields: username, quizName, and resetDateTime are required');
            }

            // Validate resetDateTime is in the future
            const resetTime = new Date(resetDateTime);
            const now = new Date();
            if (resetTime <= now) {
                throw new Error('Reset time must be in the future');
            }

            console.log(`Creating scheduled reset for ${username}'s ${quizName} at ${resetDateTime}`);
            
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/schedules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    quizName,
                    resetDateTime
                })
            });
            
            if (response.success) {
                const schedule = response.data;
                console.log('Successfully created scheduled reset through API:', schedule);
                
                // Also save to localStorage as a backup/fallback
                try {
                    const schedulesJson = localStorage.getItem('scheduledResets');
                    const schedules = schedulesJson ? JSON.parse(schedulesJson) : [];
                    
                    // Only add if not already present (check for matching username, quiz, and datetime)
                    const exists = schedules.some(s => 
                        s.username === username && 
                        s.quizName === quizName && 
                        s.resetDateTime === resetDateTime
                    );
                    
                    if (!exists) {
                        const newSchedule = {
                            id: schedule._id || schedule.id || Date.now().toString(),
                            username,
                            quizName,
                            resetDateTime,
                            createdAt: new Date().toISOString()
                        };
                        
                        schedules.push(newSchedule);
                        localStorage.setItem('scheduledResets', JSON.stringify(schedules));
                    }
                } catch (localError) {
                    console.warn('Error saving to localStorage:', localError);
                }
                
                return response;
            } else {
                throw new Error(response.message || 'Failed to create scheduled reset');
            }
        } catch (error) {
            console.error('Error creating scheduled reset:', error);
            
            // Use localStorage as fallback with validation
            console.warn('Using localStorage fallback for creating scheduled reset');
            try {
                const schedulesJson = localStorage.getItem('scheduledResets');
                const schedules = schedulesJson ? JSON.parse(schedulesJson) : [];
                
                const newSchedule = {
                    id: Date.now().toString(),
                    username,
                    quizName,
                    resetDateTime,
                    createdAt: new Date().toISOString()
                };
                
                // Validate the new schedule before adding
                if (newSchedule.username && newSchedule.quizName && newSchedule.resetDateTime) {
                    schedules.push(newSchedule);
                    localStorage.setItem('scheduledResets', JSON.stringify(schedules));
                    
                    return {
                        success: true,
                        fallback: true,
                        message: 'Scheduled reset created in localStorage (API not available)',
                        data: newSchedule
                    };
                } else {
                    throw new Error('Invalid schedule data');
                }
            } catch (localError) {
                console.error('Error creating scheduled reset in localStorage:', localError);
                throw error;
            }
        }
    }
    
    async cancelScheduledReset(scheduleId) {
        try {
            if (!scheduleId) {
                throw new Error('Schedule ID is required');
            }

            console.log(`Cancelling scheduled reset with ID: ${scheduleId}`);
            
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/schedules/${scheduleId}`, {
                method: 'DELETE'
            });
            
            if (response.success) {
                console.log('Successfully cancelled scheduled reset through API:', response);
                
                // Also remove from localStorage
                try {
                    const schedulesJson = localStorage.getItem('scheduledResets');
                    if (schedulesJson) {
                        const schedules = JSON.parse(schedulesJson);
                        const updatedSchedules = schedules.filter(s => s.id !== scheduleId);
                        localStorage.setItem('scheduledResets', JSON.stringify(updatedSchedules));
                    }
                } catch (localError) {
                    console.warn('Error updating localStorage after cancellation:', localError);
                }
                
                return response;
            } else {
                throw new Error(response.message || 'Failed to cancel scheduled reset');
            }
        } catch (error) {
            console.error('Error cancelling scheduled reset:', error);
            
            // Use localStorage as fallback with validation
            console.warn('Using localStorage fallback for cancelling scheduled reset');
            try {
                const schedulesJson = localStorage.getItem('scheduledResets');
                if (!schedulesJson) {
                    return {
                        success: false,
                        fallback: true,
                        message: 'No scheduled resets found in localStorage'
                    };
                }
                
                const schedules = JSON.parse(schedulesJson);
                const scheduleToCancel = schedules.find(s => s.id === scheduleId);
                
                if (!scheduleToCancel) {
                    return {
                        success: false,
                        fallback: true,
                        message: 'Scheduled reset not found in localStorage'
                    };
                }
                
                const updatedSchedules = schedules.filter(s => s.id !== scheduleId);
                localStorage.setItem('scheduledResets', JSON.stringify(updatedSchedules));
                
                return {
                    success: true,
                    fallback: true,
                    message: 'Scheduled reset cancelled in localStorage (API not available)',
                    data: scheduleToCancel
                };
            } catch (localError) {
                console.error('Error cancelling scheduled reset in localStorage:', localError);
                throw error;
            }
        }
    }
    
    async checkAndProcessScheduledResets() {
        try {
            console.log('Checking scheduled resets');
            
            // First, get all scheduled resets
            const response = await this.getScheduledResets();
            const schedules = response.data || [];
            
            if (!schedules.length) {
                console.log('No scheduled resets found');
                return { success: true, processed: 0, total: 0 };
            }
            
            console.log(`Found ${schedules.length} scheduled resets`);
            
            // Keep track of which schedule IDs were processed
            const processedIds = [];
            // Keep track of which quiz names were reset
            const processedQuizzes = new Set();
            
            const now = new Date();
            
            // Process each scheduled reset
            for (const schedule of schedules) {
                // Convert reset time string to Date object
                const resetTime = new Date(schedule.resetDateTime);
                
                // If the reset time has passed
                if (resetTime <= now) {
                    console.log(`Processing scheduled reset for ${schedule.username}'s ${schedule.quizName} quiz`);
                    
                    try {
                        // Call API to reset the quiz using the correct endpoint
                        const resetResponse = await this.fetchWithAdminAuth(
                            `${this.baseUrl}/admin/users/${schedule.username}/quiz-progress/${schedule.quizName}/reset`,
                            {
                                method: 'POST'
                            }
                        );
                        
                        if (resetResponse.success) {
                            console.log(`Successfully reset ${schedule.username}'s ${schedule.quizName} quiz`);
                            processedIds.push(schedule.id);
                            processedQuizzes.add(schedule.quizName);
                            
                            // Also reset quiz scores
                            try {
                                const scoreResetResponse = await this.fetchWithAdminAuth(
                                    `${this.baseUrl}/admin/users/${schedule.username}/quiz-scores/reset`,
                                    {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ quizName: schedule.quizName })
                                    }
                                );
                                if (scoreResetResponse.success) {
                                    console.log(`Successfully reset scores for ${schedule.username}'s ${schedule.quizName} quiz`);
                                } else {
                                    console.error(`Failed to reset quiz scores:`, scoreResetResponse.message);
                                }
                            } catch (scoreResetError) {
                                console.error('Error resetting quiz scores:', scoreResetError);
                            }
                        } else {
                            console.error(`Failed to reset quiz:`, resetResponse.message);
                        }
                    } catch (resetError) {
                        console.error(`Error resetting quiz:`, resetError);
                    }
                } else {
                    console.log(`Schedule for ${schedule.username}'s ${schedule.quizName} quiz is not due yet. Next reset at ${resetTime}`);
                }
            }
            
            // Update lastReset field for all processed quizzes
            for (const quizName of processedQuizzes) {
                try {
                    await this.updateAutoResetLastResetTime(quizName);
                    console.log(`Updated lastReset time for quiz: ${quizName}`);
                } catch (error) {
                    console.error(`Failed to update lastReset time for quiz ${quizName}:`, error);
                }
            }
            
            // Remove processed schedules
            if (processedIds.length > 0) {
                console.log(`Removing ${processedIds.length} processed schedules`);
                
                // If using the API, delete each processed schedule
                if (!response.fallback) {
                    for (const id of processedIds) {
                        try {
                            await this.cancelScheduledReset(id);
                        } catch (error) {
                            console.error(`Error removing processed schedule ${id}:`, error);
                        }
                    }
                } 
                // If using localStorage, update it directly
                else {
                    try {
                        const schedulesJson = localStorage.getItem('scheduledResets');
                        if (schedulesJson) {
                            const allSchedules = JSON.parse(schedulesJson);
                            const remainingSchedules = allSchedules.filter(s => !processedIds.includes(s.id));
                            localStorage.setItem('scheduledResets', JSON.stringify(remainingSchedules));
                        }
                    } catch (localError) {
                        console.error('Error updating localStorage after processing schedules:', localError);
                    }
                }
            }
            
            return {
                success: true,
                processed: processedIds.length,
                total: schedules.length
            };
        } catch (error) {
            console.error('Error checking and processing scheduled resets:', error);
            throw error;
        }
    }

    // Guide settings methods
    async getGuideSettings() {
        try {
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/guide-settings`);
            
            if (response.success && response.data) {
                // Save to localStorage as a backup - ensure all guide settings are saved
                try {
                    localStorage.setItem('guideSettings', JSON.stringify(response.data));
                    console.log('[API] Saved complete guide settings to localStorage:', response.data);
                    
                    // Log all available quiz guides for debugging
                    this.debugLogGuideSettings();
                } catch (storageError) {
                    console.warn('[API] Failed to save guide settings to localStorage:', storageError);
                }
                
                return {
                    success: true,
                    data: response.data,
                    source: 'api'
                };
            } else {
                throw new Error(response.message || 'Failed to get guide settings');
            }
        } catch (error) {
            console.error('Error fetching guide settings:', error);
            
            // Try to get from localStorage as fallback
            try {
                const localSettings = localStorage.getItem('guideSettings');
                if (localSettings) {
                    const settings = JSON.parse(localSettings);
                    
                    // Log all available quiz guides for debugging
                    this.debugLogGuideSettings();
                    
                    return {
                        success: true,
                        data: settings,
                        source: 'localStorage'
                    };
                }
            } catch (localError) {
                console.warn('Error reading from localStorage:', localError);
            }
            
            // Return empty object if all else fails
            return {
                success: true,
                data: {},
                source: 'default'
            };
        }
    }
    
    // Debug method to log all guide settings stored in localStorage
    debugLogGuideSettings() {
        try {
            const settingsJson = localStorage.getItem('guideSettings');
            if (settingsJson) {
                const settings = JSON.parse(settingsJson);
                console.log('[API] === GUIDE SETTINGS DEBUG ===');
                console.log('[API] All guide settings in localStorage:', settings);
                
                // Log each individual quiz guide
                if (settings && typeof settings === 'object') {
                    console.log('[API] Individual quiz guides:');
                    for (const [quizName, guideSetting] of Object.entries(settings)) {
                        console.log(`[API] - ${quizName}: url=${guideSetting.url}, enabled=${guideSetting.enabled}`);
                    }
                } else {
                    console.log('[API] No valid guide settings found in localStorage');
                }
                console.log('[API] === END GUIDE SETTINGS DEBUG ===');
            } else {
                console.log('[API] No guide settings found in localStorage');
            }
        } catch (e) {
            console.error('[API] Error logging guide settings:', e);
        }
    }

    async saveGuideSetting(quizName, url, enabled) {
        try {
            // Sanitize inputs
            const sanitizedQuiz = quizName.trim().toLowerCase();
            const sanitizedUrl = url.trim();
            
            // Validate URL if provided
            if (sanitizedUrl && !sanitizedUrl.match(/^https?:\/\/.+/)) {
                throw new Error('Invalid URL format. Must start with http:// or https://');
            }
            
            // API call
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/guide-settings/${sanitizedQuiz}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    url: sanitizedUrl, 
                    enabled: Boolean(enabled) 
                })
            });
            
            if (response.success) {
                // Update localStorage with the new settings
                try {
                    const existingSettingsJson = localStorage.getItem('guideSettings');
                    const existingSettings = existingSettingsJson ? JSON.parse(existingSettingsJson) : {};
                    
                    const updatedSettings = {
                        ...existingSettings,
                        [sanitizedQuiz]: { url: sanitizedUrl, enabled: Boolean(enabled) }
                    };
                    
                    localStorage.setItem('guideSettings', JSON.stringify(updatedSettings));
                } catch (storageError) {
                    console.warn('Failed to update localStorage:', storageError);
                }
                
                return {
                    success: true,
                    data: response.data || { [sanitizedQuiz]: { url: sanitizedUrl, enabled: Boolean(enabled) } }
                };
            } else {
                throw new Error(response.message || 'Failed to save guide settings');
            }
        } catch (error) {
            console.error('Error saving guide setting:', error);
            
            // If we get an HTML response, use localStorage as fallback
            if (error.message && (
                error.message.includes('HTML response') || 
                error.message.includes('Server returned HTML')
            )) {
                try {
                    // Update localStorage directly
                    const existingSettingsJson = localStorage.getItem('guideSettings');
                    const existingSettings = existingSettingsJson ? JSON.parse(existingSettingsJson) : {};
                    
                    const updatedSettings = {
                        ...existingSettings,
                        [quizName]: { url, enabled: Boolean(enabled) }
                    };
                    
                    localStorage.setItem('guideSettings', JSON.stringify(updatedSettings));
                    
                    console.warn('API returned HTML, using localStorage fallback for guide settings');
                    return {
                        success: true,
                        data: { [quizName]: { url, enabled: Boolean(enabled) } },
                        source: 'localStorage',
                        warning: 'API unavailable, using localStorage fallback'
                    };
                } catch (localError) {
                    console.error('Failed to use localStorage fallback:', localError);
                }
            }
            
            throw error;
        }
    }

    // Guide settings methods for quiz UI
    async fetchGuideSettings(quizName) {
        console.log(`[API] Fetching guide settings for quiz: ${quizName}`);
        
        if (!quizName) {
            console.error('[API] No quiz name provided for guide settings fetch');
            return {
                success: false,
                data: {
                    url: null,
                    enabled: false
                }
            };
        }
        
        // Normalize quiz name
        const normalizedQuizName = quizName.toLowerCase().trim();
        
        // Check if guide settings exist in localStorage first for any quiz
        try {
            const settingsJson = localStorage.getItem('guideSettings');
            if (settingsJson) {
                const settings = JSON.parse(settingsJson);
                if (settings && settings[normalizedQuizName] && settings[normalizedQuizName].url) {
                    console.log(`[API] Found guide settings in localStorage for ${normalizedQuizName}:`, settings[normalizedQuizName]);
                    return {
                        success: true,
                        data: {
                            url: settings[normalizedQuizName].url,
                            enabled: settings[normalizedQuizName].enabled === true
                        },
                        source: 'localStorage'
                    };
                }
            }
        } catch (e) {
            console.warn(`[API] Error checking localStorage for ${normalizedQuizName} guide:`, e);
        }
        
        try {
            // Construct the URL carefully with proper encoding
            const url = `${this.baseUrl}/guide-settings/${encodeURIComponent(normalizedQuizName)}`;
            console.log(`[API] Guide settings URL: ${url}`);
            
            // Just do a simple fetch without timeout - let the browser handle it
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                console.warn(`[API] Error response from guide settings API: ${response.status}`);
                
                // Try localStorage again as fallback for any quiz
                try {
                    const settingsJson = localStorage.getItem('guideSettings');
                    if (settingsJson) {
                        const settings = JSON.parse(settingsJson);
                        if (settings && settings[normalizedQuizName]) {
                            console.log(`[API] Using localStorage fallback for ${normalizedQuizName} after API error`);
                            return {
                                success: true,
                                data: {
                                    url: settings[normalizedQuizName].url || null,
                                    enabled: settings[normalizedQuizName].enabled === true
                                },
                                source: 'localStorage-fallback'
                            };
                        }
                    }
                } catch (e) {
                    console.warn(`[API] Error checking localStorage fallback for ${normalizedQuizName}:`, e);
                }
                
                return {
                    success: false,
                    data: {
                        url: null,
                        enabled: false
                    }
                };
            }
            
            // Parse the response
            const text = await response.text();
            console.log(`[API] Guide settings raw response:`, text);
            
            try {
                const jsonData = JSON.parse(text);
                console.log(`[API] Guide settings parsed response:`, jsonData);
                
                if (jsonData.success && jsonData.data) {
                    return jsonData;
                } else {
                    console.warn(`[API] Invalid guide settings response:`, jsonData);
                    
                    // Try localStorage once more as final fallback
                    try {
                        const settingsJson = localStorage.getItem('guideSettings');
                        if (settingsJson) {
                            const settings = JSON.parse(settingsJson);
                            if (settings && settings[normalizedQuizName]) {
                                console.log(`[API] Using localStorage fallback for ${normalizedQuizName} after invalid response`);
                                return {
                                    success: true,
                                    data: {
                                        url: settings[normalizedQuizName].url || null,
                                        enabled: settings[normalizedQuizName].enabled === true
                                    },
                                    source: 'localStorage-fallback'
                                };
                            }
                        }
                    } catch (e) {
                        console.warn(`[API] Error checking localStorage fallback for ${normalizedQuizName}:`, e);
                    }
                    
                    return {
                        success: false,
                        data: {
                            url: null,
                            enabled: false
                        }
                    };
                }
            } catch (parseError) {
                console.error(`[API] Error parsing guide settings JSON:`, parseError);
                
                // Final localStorage fallback attempt
                try {
                    const settingsJson = localStorage.getItem('guideSettings');
                    if (settingsJson) {
                        const settings = JSON.parse(settingsJson);
                        if (settings && settings[normalizedQuizName]) {
                            console.log(`[API] Using localStorage fallback for ${normalizedQuizName} after parse error`);
                            return {
                                success: true,
                                data: {
                                    url: settings[normalizedQuizName].url || null,
                                    enabled: settings[normalizedQuizName].enabled === true
                                },
                                source: 'localStorage-fallback'
                            };
                        }
                    }
                } catch (e) {
                    console.warn(`[API] Error checking localStorage after parse error:`, e);
                }
                
                return {
                    success: false,
                    data: {
                        url: null,
                        enabled: false
                    }
                };
            }
        } catch (error) {
            console.error(`[API] Error fetching guide settings for ${normalizedQuizName}:`, error);
            
            // Try localStorage as fallback for any quiz
            try {
                const settingsJson = localStorage.getItem('guideSettings');
                if (settingsJson) {
                    const settings = JSON.parse(settingsJson);
                    if (settings && settings[normalizedQuizName]) {
                        console.log(`[API] Using localStorage fallback for ${normalizedQuizName} after fetch error`);
                        return {
                            success: true,
                            data: {
                                url: settings[normalizedQuizName].url || null,
                                enabled: settings[normalizedQuizName].enabled === true
                            },
                            source: 'localStorage-fallback'
                        };
                    }
                }
            } catch (localError) {
                console.warn(`[API] Error checking localStorage for ${normalizedQuizName} after fetch error:`, localError);
            }
            
            // Return default values with no fallback
            return {
                success: false,
                data: {
                    url: null,
                    enabled: false
                }
            };
        }
    }

    // Auto-reset settings methods
    async getAutoResetSettings() {
        try {
            console.log('Fetching auto-reset settings from API');
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/auto-resets`);
            
            if (response.success) {
                console.log('Successfully fetched auto-reset settings from API:', response.data);
                return {
                    success: true,
                    data: response.data
                };
            } else {
                throw new Error(response.message || 'Failed to fetch auto-reset settings');
            }
        } catch (error) {
            console.error('Error fetching auto-reset settings:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async saveAutoResetSetting(quizName, resetPeriod, enabled = true, nextResetTime = null) {
        try {
            if (!quizName || resetPeriod === undefined) {
                throw new Error('Missing required fields: quizName and resetPeriod are required');
            }

            console.log(`Saving auto-reset setting for ${quizName} with period ${resetPeriod} minutes${nextResetTime ? `, next reset at ${nextResetTime}` : ''}`);
            
            const data = {
                quizName,
                resetPeriod,
                enabled
            };
            
            // Add nextResetTime if provided
            if (nextResetTime) {
                data.nextResetTime = nextResetTime;
            }
            
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/auto-resets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (response.success) {
                console.log('Successfully saved auto-reset setting through API:', response);
                return response;
            } else {
                throw new Error(response.message || 'Failed to save auto-reset setting');
            }
        } catch (error) {
            console.error('Error saving auto-reset setting:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    async deleteAutoResetSetting(quizName) {
        try {
            console.log(`Deleting auto-reset setting for quiz: ${quizName}`);
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/auto-resets/${encodeURIComponent(quizName)}`, {
                method: 'DELETE'
            });
            
            if (response.success) {
                console.log('Successfully deleted auto-reset setting:', response);
                return response;
            } else {
                throw new Error(response.message || 'Failed to delete auto-reset setting');
            }
        } catch (error) {
            console.error('Error deleting auto-reset setting:', error);
            return { success: false, message: error.message };
        }
    }

    async getCompletedUsers(quizName) {
        try {
            console.log(`Getting completed users for quiz: ${quizName}`);
            const response = await fetch(`${this.baseUrl}/admin/completed-users/${encodeURIComponent(quizName)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });
            const data = await response.json();
            return { success: response.ok, data, message: data.message };
        } catch (error) {
            console.error('Error getting completed users:', error);
            return { success: false, message: error.message };
        }
    }

    async updateAutoResetLastResetTime(quizName) {
        try {
            console.log(`Updating lastReset time for quiz: ${quizName}`);
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/auto-resets/${encodeURIComponent(quizName)}/update-last-reset`, {
                method: 'POST'
            });
            
            if (response.success) {
                console.log('Successfully updated lastReset time:', response);
                return response;
            } else {
                throw new Error(response.message || 'Failed to update lastReset time');
            }
        } catch (error) {
            console.error('Error updating lastReset time:', error);
            return { success: false, message: error.message };
        }
    }

    async resetQuizProgress(username, quizName) {
        try {
            console.log(`Resetting quiz progress for ${username}'s ${quizName} quiz`);
            const response = await this.fetchWithAdminAuth(
                `${this.baseUrl}/admin/users/${encodeURIComponent(username)}/quiz-progress/${encodeURIComponent(quizName)}/reset`,
                {
                    method: 'POST'
                }
            );
            
            if (response.success) {
                console.log(`Successfully reset ${username}'s ${quizName} quiz progress`);
                return response;
            } else {
                throw new Error(response.message || 'Failed to reset quiz progress');
            }
        } catch (error) {
            console.error(`Error resetting quiz progress for ${username}'s ${quizName} quiz:`, error);
            return { success: false, message: error.message };
        }
    }

    async getUserQuizProgress(username, quizName) {
        try {
            console.log(`Getting progress for ${username}'s ${quizName} quiz`);
            
            // Create a promise that rejects after 3 seconds
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Request timed out after 3 seconds`)), 3000);
            });
            
            // Create the actual fetch promise
            const fetchPromise = this.fetchWithAdminAuth(
                `${this.baseUrl}/admin/users/${encodeURIComponent(username)}/quiz-progress/${encodeURIComponent(quizName)}`
            );
            
            // Race the two promises - whichever resolves/rejects first wins
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            if (response.success) {
                console.log(`Successfully got progress for ${username}'s ${quizName} quiz:`, response.data);
                return response;
            } else {
                throw new Error(response.message || 'Failed to get quiz progress');
            }
        } catch (error) {
            console.error(`Error getting progress for ${username}'s ${quizName} quiz:`, error);
            return { success: false, message: error.message };
        }
    }
} 