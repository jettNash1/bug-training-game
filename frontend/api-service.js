import { config } from './config.js';
import { getAuthToken, setAuthToken, clearTokens, setRefreshToken } from './auth.js';
import { QUIZ_CATEGORIES } from './quiz-list.js';

export class APIService {
    constructor() {
        this.baseUrl = this.getApiBaseUrl();
        this.scheduledResetInterval = null;
        this.startScheduledResetCheck();
    }
    
    startScheduledResetCheck() {
        // Clear any existing interval
        if (this.scheduledResetInterval) {
            clearInterval(this.scheduledResetInterval);
        }

        // Check for scheduled resets every minute
        this.scheduledResetInterval = setInterval(async () => {
            try {
                console.log('Background check: Checking for scheduled resets...');
                await this.checkAndProcessScheduledResets();
            } catch (error) {
                console.error('Background check: Error checking scheduled resets:', error);
            }
        }, 60000); // Check every minute

        // Run an immediate check
        this.checkAndProcessScheduledResets()
            .catch(error => console.error('Background check: Error in initial scheduled reset check:', error));
    }

    stopScheduledResetCheck() {
        if (this.scheduledResetInterval) {
            clearInterval(this.scheduledResetInterval);
            this.scheduledResetInterval = null;
        }
    }
    
    // Helper method to get the API base URL with fallback logic
    getApiBaseUrl() {
        const currentOrigin = window.location.origin;
        console.log('Current origin:', currentOrigin);
        
        // For S3 website, always use the Render API
        if (currentOrigin === 'http://learning-hub.s3-website.eu-west-2.amazonaws.com') {
            console.log('Using Render API from S3 website');
            return 'https://bug-training-game-api.onrender.com/api';
        }
        
        // For Render website
        if (window.location.hostname.includes('render.com') || 
            window.location.hostname === 'bug-training-game.onrender.com') {
            console.log('Using Render API from Render website');
            return 'https://bug-training-game-api.onrender.com/api';
        }
        
        // Local development
        console.log('Using local API');
        return 'http://localhost:10000/api';
    }

    // Helper method to get admin auth header
    getAdminAuthHeader() {
        const adminToken = localStorage.getItem('adminToken');
        return adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {};
    }

    // Admin-specific fetch method
    async fetchWithAdminAuth(url, options = {}) {
        try {
            // Skip auth check on admin login page
            if (window.location.pathname.includes('admin-login.html')) {
                console.log('On admin login page, skipping admin auth check');
                throw new Error('Cannot fetch with admin auth on login page');
            }
            
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
            const response = await fetch(`${this.baseUrl}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async adminLogin(username, password) {
        try {
            // Get the current API base URL
            const apiBaseUrl = this.baseUrl;
            console.log('Attempting admin login:', { 
                username, 
                url: `${apiBaseUrl}/admin/login`,
                apiBaseUrl
            });
            
            if (!apiBaseUrl) {
                console.error('API base URL is not defined');
                throw new Error('API configuration error. Please check your network connection and try again.');
            }
            
            // Check if the server is reachable before attempting the login
            try {
                const pingResponse = await fetch(`${apiBaseUrl}/health`, { 
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    // Add timeout to prevent hanging requests
                    signal: AbortSignal.timeout(5000) // 5 second timeout
                });
                
                if (!pingResponse.ok) {
                    console.warn('API health check failed before login attempt');
                }
            } catch (pingError) {
                console.warn('Could not connect to API server:', pingError);
                // Continue with login attempt anyway
            }
            
            const response = await fetch(`${apiBaseUrl}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
                // Add timeout to prevent hanging requests
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });

            console.log('Admin login response status:', response.status);
            
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

            // Store the admin token in localStorage
            if (data.token) {
                localStorage.setItem('adminToken', data.token);
                console.log('Admin token stored successfully');
            } else {
                console.warn('No admin token received from server');
            }

            return data;
        } catch (error) {
            // Check if this is a network error
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                console.error('Admin login network error - server may be unreachable:', error);
                throw new Error('Server connection failed. Please check your network connection and try again.');
            }
            
            console.error('Admin login error:', error);
            throw error;
        }
    }

    async getAllUsers() {
        try {
            console.log('Fetching all users');
            const apiBaseUrl = this.baseUrl;
            
            if (!apiBaseUrl) {
                console.error('API base URL is not defined');
                return { 
                    success: false, 
                    message: 'API configuration error',
                    data: []
                };
            }
            
            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) {
                console.error('No admin token found when trying to fetch users');
                return { 
                    success: false, 
                    message: 'Authentication required',
                    data: []
                };
            }

            const response = await fetch(`${this.baseUrl}/admin/users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                console.error(`Failed to fetch users: ${response.status} ${response.statusText}`);
                return { 
                    success: false, 
                    message: `Server error: ${response.status}`,
                    data: []
                };
            }

            // Read response text first
            const text = await response.text();
            console.log('Raw users response:', text);
            
            // Try to parse as JSON
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                return { 
                    success: false, 
                    message: 'Invalid server response',
                    data: []
                };
            }

            // Check for users in different possible response structures
            let users = [];
            
            if (data && data.users && Array.isArray(data.users)) {
                // API returns { success: true, users: [...] }
                users = data.users;
                console.log(`Found ${users.length} users in 'users' property`);
            } else if (data && data.data && Array.isArray(data.data)) {
                // API returns { success: true, data: [...] }
                users = data.data;
                console.log(`Found ${users.length} users in 'data' property`);
            } else if (Array.isArray(data)) {
                // API returns direct array of users
                users = data;
                console.log(`Found ${users.length} users in direct array`);
            } else {
                console.error('Response does not contain users array in any expected format:', data);
                return {
                    success: true,
                    message: 'No users found or invalid data format',
                    data: []
                };
            }
            
            return {
                success: true,
                data: users
            };
        } catch (error) {
            console.error('Error fetching all users:', error);
            return { 
                success: false, 
                message: error.message || 'Error fetching users',
                data: []
            };
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
        // Increase timeout to 20 seconds (was 15 seconds) to better handle quiz progress data in slow networks
        const timeoutId = setTimeout(() => controller.abort(), 20000); 
        
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

    // Helper method for consistent quiz name normalization
    normalizeQuizName(quizName) {
        if (!quizName) return '';
        
        // Normalize to lowercase and trim
        const lowerName = typeof quizName === 'string' ? quizName.toLowerCase().trim() : '';
        
        // Get the list of known quiz names from QUIZ_CATEGORIES
        const knownQuizNames = Object.values(QUIZ_CATEGORIES).flat().map(name => name.toLowerCase());
        
        // If it's an exact match with our known list, return it directly
        if (knownQuizNames.includes(lowerName)) {
            return lowerName;
        }
        
        // Normalize to kebab-case
        const normalized = lowerName
            .replace(/([A-Z])/g, '-$1')  // Convert camelCase to kebab-case
            .replace(/_/g, '-')          // Convert snake_case to kebab-case
            .replace(/\s+/g, '-')        // Convert spaces to hyphens
            .replace(/-+/g, '-')         // Remove duplicate hyphens
            .replace(/^-|-$/g, '')       // Remove leading/trailing hyphens
            .toLowerCase();              // Ensure lowercase
        
        // Check if normalized version is in known list
        if (knownQuizNames.includes(normalized)) {
            return normalized;
        }
        
        // Return the normalized version for consistency
        return normalized;
    }

    // Generate common variations of quiz names to try with API/localStorage
    // NOTE: This method is now deprecated and should no longer be used
    // We are standardizing on a single normalizeQuizName result for all operations
    getQuizNameVariations(quizName) {
        console.warn('[API] getQuizNameVariations is deprecated, using normalized quiz name only');
        return [this.normalizeQuizName(quizName)];
    }

    async getQuizProgress(quizName) {
        try {
            console.log(`[API] Getting progress for quiz: ${quizName}`);
            
            // Normalize the quiz name - always use the standard normalized version
            const normalizedQuizName = this.normalizeQuizName(quizName);
            
            console.log(`[API] Using normalized quiz name: ${normalizedQuizName}`);
            
            // Add logging to help diagnose issues
            const username = localStorage.getItem('username');
            console.log(`[API] Current user: ${username || 'unknown'}`);
            
            // Fetch both from API and localStorage in parallel for efficiency
            let localStorageData = null;
            let response = null;
            let localStorageDataFound = false;
            
            // Get localStorage data first as it's faster
            if (username) {
                // First try the new strict key format
                const strictStorageKey = this.getUniqueQuizStorageKey(username, normalizedQuizName);
                
                // Then try fallback keys in order of preference
                const storageKeys = [
                    strictStorageKey, // New strict format key (preferred)
                    `quiz_progress_${username}_${normalizedQuizName}`, // Old format 
                    `quiz_progress_${username}_${normalizedQuizName}_backup` // Backup key
                ];
                
                console.log(`[API] Will try these localStorage keys in order:`, storageKeys);
                
                for (const storageKey of storageKeys) {
                try {
                    const localData = localStorage.getItem(storageKey);
                    if (localData) {
                            const parsed = JSON.parse(localData);
                            
                            // Verify this data actually belongs to the correct quiz
                            // This double-check prevents cross-contamination
                            if (parsed && parsed.quizName && parsed.quizName !== normalizedQuizName) {
                                console.warn(`[API] Skipping localStorage data from key ${storageKey} because it belongs to ${parsed.quizName}, not ${normalizedQuizName}`);
                                continue;
                            }
                            
                            // Verify data has some valid content
                            if (parsed && (parsed.data || parsed)) {
                                localStorageData = parsed;
                                localStorageDataFound = true;
                                console.log(`[API] Found progress in localStorage for ${normalizedQuizName} in key: ${storageKey}`);
                                // Break after finding first valid data
                                break;
                            }
                    }
                } catch (e) {
                        console.error(`[API] Error parsing localStorage data for key ${storageKey}:`, e);
                    }
                }
                
                if (!localStorageDataFound) {
                    console.log(`[API] No localStorage data found for ${normalizedQuizName}`);
                }
            }
            
            // Now try to fetch from API
            try {
                console.log(`[API] Fetching progress from API for ${normalizedQuizName}`);
                
                // Add a clear URL log to help with debugging
                const apiUrl = `${this.baseUrl}/users/quiz-progress/${normalizedQuizName}`;
                console.log(`[API] Fetch URL: ${apiUrl}`);
                
                // Use try-catch here to isolate API errors
                const apiResponse = await this.fetchWithAuth(apiUrl);
                console.log(`[API] Raw API response for ${normalizedQuizName}:`, apiResponse);
                
                if (apiResponse && apiResponse.data && Object.keys(apiResponse.data).length > 0) {
                    // Verify API data has actual content
                    const apiHasProgress = 
                        (apiResponse.data.questionHistory && apiResponse.data.questionHistory.length > 0) ||
                        (apiResponse.data.questionsAnswered && apiResponse.data.questionsAnswered > 0);
                    
                    if (apiHasProgress) {
                    response = apiResponse;
                        console.log(`[API] Successfully got populated data from API for ${normalizedQuizName}`);
                    } else {
                        console.warn(`[API] API returned data but without any progress for ${normalizedQuizName}`);
                    }
                } else {
                    console.warn(`[API] API returned empty or invalid data for ${normalizedQuizName}`);
                }
            } catch (apiError) {
                console.error(`[API] Error fetching progress from API for ${normalizedQuizName}:`, apiError);
            }
            
            // If we have localStorage data but no valid API data, prefer localStorage
            if (localStorageDataFound && (!response || !response.data || Object.keys(response.data || {}).length === 0)) {
                console.log(`[API] Using localStorage data since API data is unavailable or empty for ${normalizedQuizName}`);
                
                const localProgressData = localStorageData.data || localStorageData;
                response = {
                    success: true,
                    data: localProgressData
                };
            }
            
            // If no data found anywhere, return default
            if ((!response || !response.data || Object.keys(response.data || {}).length === 0) && 
                (!localStorageData || !(localStorageData.data || localStorageData))) {
                
                console.log(`[API] No progress found anywhere for quiz ${quizName}, returning default`);
                return {
                    success: true,
                    data: {
                        experience: 0,
                        questionsAnswered: 0,
                        status: 'not-started',
                        scorePercentage: 0,
                        currentScenario: 0,
                        tools: [],
                        questionHistory: []
                    }
                };
            }
            
            // Normalize the API data to ensure all required fields
            const apiData = response?.data || {};
            
            // Critical fix: Ensure experience is always a valid number
            let experienceValue = 0;
            if (apiData.experience !== undefined) {
                // Convert to number, default to 0 if NaN
                experienceValue = !isNaN(parseFloat(apiData.experience)) ? 
                    parseFloat(apiData.experience) : 0;
                
                // Log important diagnostic information
                console.log(`[API] Experience value from API: ${apiData.experience}, type: ${typeof apiData.experience}, parsed: ${experienceValue}`);
            }
            
            // Get questionHistory length for validation and derivation of questionsAnswered
            const questionHistoryLength = Array.isArray(apiData.questionHistory) ? apiData.questionHistory.length : 0;
            
            // Derive questionsAnswered from questionHistory if not provided or is zero
            let questionsAnswered = apiData.questionsAnswered;
            if ((!questionsAnswered || questionsAnswered === 0) && questionHistoryLength > 0) {
                questionsAnswered = questionHistoryLength;
                console.log(`[API] Derived questionsAnswered=${questionHistoryLength} from questionHistory.length for ${normalizedQuizName}`);
            } else {
                questionsAnswered = apiData.questionsAnswered || questionHistoryLength || 0;
            }
            
            const progress = {
                experience: experienceValue,
                questionsAnswered: questionsAnswered,
                status: apiData.status || 'not-started',
                scorePercentage: typeof apiData.scorePercentage === 'number' ? apiData.scorePercentage : 0,
                currentScenario: apiData.currentScenario || questionsAnswered || 0,
                tools: apiData.tools || [],
                questionHistory: apiData.questionHistory || [],
                randomizedScenarios: apiData.randomizedScenarios || {}
            };
            
            // Log the quiz state for debugging
            console.log(`[API] Quiz progress details for ${quizName}:`, {
                status: progress.status,
                currentScenario: progress.currentScenario,
                questionsAnswered: progress.questionsAnswered,
                questionHistoryLength: progress.questionHistory.length,
                experience: progress.experience,
                experienceType: typeof progress.experience
            });
            
            // Check localStorage data for better values if API data is suspicious
            if ((progress.experience === 0 || progress.questionHistory.length === 0) && 
                localStorageDataFound) {
                
                const localData = localStorageData.data || localStorageData;
                
                // Use localStorage experience if available and higher
                if (progress.experience === 0 && localData.experience > 0) {
                    console.log(`[API] Using localStorage experience ${localData.experience} instead of API value 0`);
                    progress.experience = parseFloat(localData.experience) || 0;
                }
                
                // Use localStorage question history if available and longer
                if (progress.questionHistory.length === 0 && 
                    Array.isArray(localData.questionHistory) && 
                    localData.questionHistory.length > 0) {
                    
                    console.log(`[API] Using localStorage questionHistory (${localData.questionHistory.length} items) instead of empty API history`);
                    progress.questionHistory = localData.questionHistory;
                    
                    // Also update related fields to be consistent
                    progress.questionsAnswered = localData.questionHistory.length;
                    progress.currentScenario = localData.questionHistory.length;
                    
                    if (localData.status && 
                       (localData.status === 'completed' || 
                        localData.status === 'passed' || 
                        localData.status === 'failed')) {
                        progress.status = localData.status;
                    } else if (localData.questionHistory.length > 0) {
                        progress.status = 'in-progress';
                    }
                }
            }
            
            // Enhanced corruption check: look for NaN or undefined in critical fields
            let hasCorruptedData = false;
            const criticalFields = ['experience', 'questionsAnswered', 'currentScenario', 'scorePercentage'];
            
            for (const field of criticalFields) {
                if (isNaN(progress[field]) || progress[field] === undefined) {
                    console.warn(`[API] Found corrupted data in ${field}: ${progress[field]}`);
                    hasCorruptedData = true;
                    progress[field] = 0; // Reset to safe default
                }
            }
            
            // Final validation of the progress object
            if (!Array.isArray(progress.tools)) {
                console.warn(`[API] Invalid tools array, resetting to empty array`);
                progress.tools = [];
            }
            
            if (!Array.isArray(progress.questionHistory)) {
                console.warn(`[API] Invalid questionHistory array, resetting to empty array`);
                progress.questionHistory = [];
            }
            
            // Ensure currentScenario is valid based on question history
            if (progress.questionHistory.length > 0 && progress.currentScenario === 0) {
                console.log(`[API] Fixing inconsistency: has ${progress.questionHistory.length} questions but currentScenario is 0`);
                progress.currentScenario = progress.questionHistory.length;
            }
            
            // If data was updated, save it back to localStorage for future consistency
            if (username && (hasCorruptedData || progress.experience > 0 || progress.questionHistory.length > 0)) {
                const storageKey = `quiz_progress_${username}_${normalizedQuizName}`;
                try {
                    localStorage.setItem(storageKey, JSON.stringify({ 
                        data: progress,
                        timestamp: Date.now() 
                    }));
                    console.log(`[API] Updated localStorage with consistent progress data for ${normalizedQuizName}`);
                } catch (e) {
                    console.error(`[API] Error saving progress to localStorage:`, e);
                }
            }
            
            return {
                success: true,
                data: progress
            };
            
        } catch (error) {
            console.error(`[API] Error getting quiz progress:`, error);
            
            // If all else fails, return an empty default state
            return {
                success: true,
                error: error.message,
                data: {
                    experience: 0,
                    questionsAnswered: 0,
                    status: 'not-started',
                    scorePercentage: 0,
                    currentScenario: 0,
                    tools: [],
                    questionHistory: []
                }
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
        // Map quiz names to their local scenario file paths
        const localScenarioMap = {
            'tester-mindset': '/data/testerMindset-scenarios.js',
            'communication': '/data/communication-scenarios.js',
            // Add more mappings as needed
        };

        if (localScenarioMap[quizName]) {
            try {
                const module = await import(localScenarioMap[quizName]);
                console.log('Loaded scenario module:', module);
                const scenarios = module.testerMindsetScenarios || module.communicationScenarios || module.default;
                console.log('Loaded scenarios:', scenarios);
                return { scenarios };
            } catch (error) {
                console.error(`Error loading local scenarios for ${quizName}:`, error);
                throw new Error(`Failed to load local scenarios for ${quizName}`);
            }
        }

        // Fallback: fetch from API as before
        try {
            const response = await fetch(`/api/quizzes/${quizName}/scenarios`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch scenarios: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching ${quizName} scenarios:`, error);
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
            console.log('Fetching user data from:', `${this.baseUrl}/users/data?includeQuizDetails=true`);
            
            const data = await this.fetchWithAuth(`${this.baseUrl}/users/data?includeQuizDetails=true`);
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
            console.log(`[Badges] Getting badges for user: ${username} at ${new Date().toISOString()}`);
            // Get fresh users data to avoid stale data issues - add timestamp to force fresh data
            const usersResponse = await this.getAllUsers();
            if (!usersResponse.success) {
                throw new Error('Failed to get users data');
            }
            // Find the specific user
            const user = usersResponse.data.find(u => u.username === username);
            if (!user) {
                throw new Error('User not found');
            }
            // Get quiz visibility info
            const allowedQuizzes = user.allowedQuizzes || [];
            const hiddenQuizzes = user.hiddenQuizzes || [];
            const quizProgress = user.quizProgress || {};
            const quizResults = user.quizResults || [];
            // Use QUIZ_CATEGORIES as the master list of all quizzes
            const allQuizzes = Object.values(QUIZ_CATEGORIES).flat().map(q => q.toLowerCase());
            // Determine visible quizzes for this user
            let visibleQuizzes;
            if (allowedQuizzes.length > 0) {
                visibleQuizzes = allQuizzes.filter(q => allowedQuizzes.includes(q));
            } else {
                visibleQuizzes = allQuizzes.filter(q => !hiddenQuizzes.includes(q));
            }
            console.log(`[Badges] Processing ${visibleQuizzes.length} visible quizzes for user ${username}`);
            
            // Generate badges for all visible quizzes
            const badges = visibleQuizzes.map(quizId => {
                const progress = quizProgress[quizId] || {};
                
                // Also check quizResults for completed quizzes
                const quizResult = quizResults.find(result => result.quizName === quizId);
                
                console.log(`[Badges] Processing quiz ${quizId}:`, {
                    hasProgress: !!progress && Object.keys(progress).length > 0,
                    hasQuizResult: !!quizResult,
                    progressScore: progress.score,
                    resultScore: quizResult?.score,
                    progressQuestionsAnswered: progress.questionsAnswered,
                    resultQuestionsAnswered: quizResult?.questionsAnswered,
                    progressKeys: Object.keys(progress),
                    quizResultQuizName: quizResult?.quizName,
                    progressExperience: progress.experience
                });
                
                // Check if quiz is complete AND has achieved 80% or higher score
                let hasCompletedAllQuestions = false;
                let scorePercentage = 0;
                let completionDate = null;
                let isFromQuizResults = false;
                
                // First check quizResults (completed quizzes)
                if (quizResult) {
                    hasCompletedAllQuestions = quizResult.questionsAnswered >= 15;
                    scorePercentage = quizResult.score || 0;
                    completionDate = quizResult.completedAt;
                    isFromQuizResults = true;
                } else {
                    // Fallback to quizProgress
                    hasCompletedAllQuestions = progress && (
                        (progress.questionHistory && progress.questionHistory.length === 15) ||
                        (typeof progress.questionsAnswered === 'number' && progress.questionsAnswered >= 15)
                    );
                    
                    // Calculate score percentage from progress
                    if (progress.score !== undefined && typeof progress.score === 'number') {
                        scorePercentage = progress.score;
                    } else if (progress.questionHistory && progress.questionHistory.length > 0) {
                        const correctAnswers = progress.questionHistory.filter(q => q.isCorrect).length;
                        scorePercentage = (correctAnswers / progress.questionHistory.length) * 100;
                    } else if (progress.correctAnswers !== undefined && progress.totalQuestions !== undefined) {
                        scorePercentage = (progress.correctAnswers / progress.totalQuestions) * 100;
                    } else if (progress.experience !== undefined && hasCompletedAllQuestions) {
                        // Calculate score from experience value (like standard badges do)
                        // Experience ranges from -150 to +300, convert to 0-100% scale
                        // Formula: ((experience + 150) / 450) * 100
                        const normalizedExperience = Math.max(-150, Math.min(300, progress.experience));
                        scorePercentage = Math.max(0, Math.min(100, ((normalizedExperience + 150) / 450) * 100));
                    }
                    
                    completionDate = progress.lastUpdated || progress.completedAt;
                    isFromQuizResults = false;
                }
                
                // Badge is earned only if completed all questions AND achieved 80%+ score
                const isCompleted = hasCompletedAllQuestions && scorePercentage >= 80;
                
                console.log(`[Badges] Quiz ${quizId} final result:`, {
                    isCompleted,
                    hasCompletedAllQuestions,
                    scorePercentage: Math.round(scorePercentage),
                    isFromQuizResults,
                    completionDate
                });
                
                return {
                    id: `quiz-${quizId}`,
                    name: this.formatQuizName(quizId) + ' Master',
                    description: `Complete the ${this.formatQuizName(quizId)} quiz with 80%+ score`,
                    icon: 'fa-solid fa-check-circle',
                    earned: isCompleted,
                    completionDate: isCompleted ? (completionDate || new Date().toISOString()) : null,
                    quizId: quizId,
                    scorePercentage: Math.round(scorePercentage),
                    hasCompletedAllQuestions: hasCompletedAllQuestions,
                    isFromQuizResults: isFromQuizResults
                };
            });
            // Sort badges: earned first, then highest progress, then alphabetically
            badges.sort((a, b) => {
                // First sort by earned status (earned badges first)
                if (a.earned !== b.earned) {
                    return a.earned ? -1 : 1;
                }
                
                // Then sort by score percentage (highest first)
                if (a.scorePercentage !== b.scorePercentage) {
                    return b.scorePercentage - a.scorePercentage; // Descending order
                }
                
                // Finally, sort alphabetically by name
                return a.name.localeCompare(b.name);
            });
            const completedCount = badges.filter(badge => badge.earned).length;
            
            console.log(`[Badges] Final summary for ${username}:`, {
                totalBadges: badges.length,
                earnedCount: completedCount,
                earnedBadges: badges.filter(b => b.earned).map(b => ({ 
                    quiz: b.quizId, 
                    score: b.scorePercentage,
                    fromResults: b.isFromQuizResults 
                })),
                inProgressBadges: badges.filter(b => !b.earned && b.scorePercentage > 0).map(b => ({ 
                    quiz: b.quizId, 
                    score: b.scorePercentage,
                    completed: b.hasCompletedAllQuestions 
                }))
            });
            
            return {
                success: true,
                data: {
                    badges,
                    totalBadges: badges.length,
                    earnedCount: completedCount
                }
            };
        } catch (error) {
            console.error(`[Badges] Error getting badges for user ${username}:`, error);
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
                // Try to get from admin API first
                const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/settings/quiz-timer`);
                console.log('Raw admin timer settings response:', response);
                
                // If response is successful, update localStorage and return the value
                if (response && response.success && response.data) {
                    const settings = response.data;
                    console.log('Timer settings loaded from admin API:', settings);
                    
                    // Use defaultSeconds directly from admin API response
                    const defaultSeconds = typeof settings.defaultSeconds === 'number' ? settings.defaultSeconds : 60;
                    const quizTimers = settings.quizTimers || {};
                    
                    // DO NOT store in localStorage to prevent pollution
                    
                    return {
                        success: true,
                        message: 'Timer settings loaded from admin API',
                        data: {
                            defaultSeconds: defaultSeconds,
                            quizTimers: quizTimers,
                            updatedAt: settings.updatedAt || new Date().toISOString()
                        }
                    };
                }
            } catch (apiError) {
                console.warn('Failed to fetch quiz timer settings from admin API:', apiError);
            }
            
            // NO FALLBACK TO USER API - Admin API only for admin functions
            console.log('Admin API failed, not falling back to user API to prevent stale data');
            
            // NO FALLBACK TO LOCALSTORAGE - Use clean defaults only
            console.log('API calls failed, using clean defaults (no localStorage fallback)');
            
            const defaultSeconds = 60;
            const quizTimers = {};
            
            return {
                success: false,
                message: 'Failed to load timer settings from API - using clean defaults',
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
                // Use consistent property naming (defaultSeconds)
                console.log('Sending to API with defaultSeconds format:', {
                    defaultSeconds: defaultValue
                });
                
                const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/settings/quiz-timer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        defaultSeconds: defaultValue,
                        quizTimers: validatedQuizTimers
                    })
                });
                
                // If successful, do NOT update localStorage to prevent future pollution
                if (response.success) {
                    console.log('Timer settings saved to API successfully:', response.data);
                    
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
                console.error('Failed to save timer settings to API:', apiError);
                
                // NO FALLBACK TO LOCALSTORAGE - Fail explicitly
                return {
                    success: false,
                    message: 'Failed to save timer settings to API',
                    error: apiError.message,
                    data: null
                };
            }
        } catch (error) {
            console.error('Failed to update quiz timer settings:', error);
            return {
                success: false,
                message: error.message || 'Failed to update timer settings',
                error: error
            };
        }
    }
    
    async getQuizTimerValue(quizName) {
        try {
            // Get all timer settings
            const response = await this.getQuizTimerSettings();
            console.log(`[Timer] Retrieved timer settings for ${quizName}:`, response);
            
            if (response.success && response.data) {
                const { defaultSeconds, quizTimers } = response.data;
                
                // Check if this quiz has a specific timer setting
                if (quizTimers && quizName && quizTimers[quizName] !== undefined) {
                    const quizSpecificTimer = Number(quizTimers[quizName]);
                    console.log(`[Timer] Using SPECIFIC timer for ${quizName}: ${quizSpecificTimer} seconds (overriding default ${defaultSeconds})`);
                    return quizSpecificTimer;
                }
                
                // Otherwise return the default
                const defaultTimer = Number(defaultSeconds);
                console.log(`[Timer] Using DEFAULT timer for ${quizName}: ${defaultTimer} seconds (no specific override)`);
                return defaultTimer;
            }
            
            // NO FALLBACK TO LOCALSTORAGE - Use clean defaults only
            console.log(`[Timer] API response invalid for ${quizName}, using clean default: 60 seconds`);
            return 60;
        } catch (error) {
            console.error(`Failed to get timer value for quiz ${quizName}:`, error);
            return 60; // Default fallback
        }
    }
    
    async updateSingleQuizTimer(quizName, seconds) {
        try {
            // Validate input
            const value = Number(seconds);
            if (isNaN(value) || value < 0 || value > 300) {
                throw new Error('Timer value must be between 0 and 300 seconds');
            }
            
            console.log(`[DEBUG] Setting timer for quiz: "${quizName}" to ${value} seconds`);
            console.log(`[DEBUG] Original quiz name: "${quizName}"`);
            
            // Normalize the quiz name for consistency
            const normalizedQuizName = this.normalizeQuizName(quizName);
            console.log(`[DEBUG] Normalized quiz name: "${normalizedQuizName}"`);
            
            // Get current settings first
            const settings = await this.getQuizTimerSettings();
            if (!settings.success) {
                throw new Error('Failed to load current timer settings');
            }
            
            console.log(`[DEBUG] Current settings:`, settings.data);
            
            // Update the quizTimers object with new value - use normalized name
            const quizTimers = {...(settings.data.quizTimers || {})};
            quizTimers[normalizedQuizName] = value;
            
            console.log(`[DEBUG] Updated quizTimers object:`, quizTimers);
            
            // Update localStorage immediately for faster UI response
            localStorage.setItem('perQuizTimerSettings', JSON.stringify(quizTimers));
            
            // Send to API with the format it expects
            try {
                const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/settings/quiz-timer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        defaultSeconds: settings.data.defaultSeconds, // Keep the default as is
                        quizTimers: quizTimers
                    })
                });
                
                if (response.success) {
                    console.log('Timer settings saved to API:', response.data);
                    
                    // Update localStorage with the latest settings from the API
                    const responseData = response.data;
                    
                    // Handle mapping between secondsPerQuestion and defaultSeconds
                    const defaultSeconds = typeof responseData.defaultSeconds === 'number' ? 
                        responseData.defaultSeconds : 
                        (typeof responseData.secondsPerQuestion === 'number' ? 
                            responseData.secondsPerQuestion : settings.data.defaultSeconds);
                    
                    localStorage.setItem('quizTimerValue', defaultSeconds.toString());
                    localStorage.setItem('perQuizTimerSettings', JSON.stringify(responseData.quizTimers || quizTimers));
                    
                    return {
                        success: true,
                        message: 'Timer setting saved successfully',
                        data: {
                            defaultSeconds: defaultSeconds,
                            quizTimers: responseData.quizTimers || quizTimers
                        }
                    };
                }
                
                throw new Error(response.message || 'Failed to save timer settings to API');
            } catch (apiError) {
                console.error('Error saving to API:', apiError);
                
                // NO FALLBACK TO LOCALSTORAGE - Fail explicitly
                return {
                    success: false,
                    message: 'Failed to save timer setting to API',
                    error: apiError.message,
                    data: null
                };
            }
        } catch (error) {
            console.error(`Failed to update timer for ${quizName}:`, error);
            return {
                success: false,
                message: error.message || `Failed to update timer for ${quizName}`,
                error: error
            };
        }
    }
    
    async resetQuizTimer(quizName) {
        try {
            if (!quizName) {
                throw new Error('Quiz name is required');
            }
            
            console.log(`Resetting timer for ${quizName} to default value`);
            
            // Get current settings first
            const settings = await this.getQuizTimerSettings();
            if (!settings.success) {
                throw new Error('Failed to load current timer settings');
            }
            
            // Create a copy of the current quiz timers
            const quizTimers = {...(settings.data.quizTimers || {})};
            
            // Delete the specified quiz from the timers object
            if (quizTimers[quizName] !== undefined) {
                delete quizTimers[quizName];
                console.log(`Deleted timer setting for ${quizName}`);
            } else {
                console.log(`No specific timer setting found for ${quizName}`);
            }
                
            // DO NOT update localStorage to prevent pollution
                
            // Send to API with the format it expects
                try {
                    const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/settings/quiz-timer`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                        defaultSeconds: settings.data.defaultSeconds, // Keep the default as is
                        quizTimers: quizTimers
                        })
                    });
                    
                    if (response.success) {
                    console.log('Timer settings saved to API:', response.data);
                    
                    // DO NOT update localStorage with the latest settings to prevent pollution
                    const responseData = response.data;
                    const defaultSeconds = responseData.defaultSeconds || settings.data.defaultSeconds;
                        
                        return {
                            success: true,
                        message: `Timer for ${quizName} reset to default`,
                            data: {
                                defaultSeconds: defaultSeconds,
                            quizTimers: responseData.quizTimers || quizTimers
                            }
                        };
                    }
                    
                throw new Error(response.message || 'Failed to save timer settings to API');
                } catch (apiError) {
                console.error('Error saving to API:', apiError);
                    
                    return {
                        success: false,
                    message: `Failed to reset timer for ${quizName} - API error`,
                        error: apiError.message,
                        data: null
                    };
            }
        } catch (error) {
            console.error('Failed to reset quiz timer:', error);
            return {
                success: false,
                message: error.message || 'Failed to reset quiz timer',
                error: error
            };
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
                    timezoneOffset: schedule.timezoneOffset || 0,
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
            
            // Try to get from localStorage as fallback
            try {
                const schedulesJson = localStorage.getItem('scheduledResets');
                if (schedulesJson) {
                    const schedules = JSON.parse(schedulesJson);
                    console.log('Using localStorage fallback for schedules:', schedules);
                    return {
                        success: true,
                        fallback: true,
                        data: schedules
                    };
                }
            } catch (localError) {
                console.warn('Error reading from localStorage:', localError);
            }
            
            throw error;
        }
    }
    
    async createScheduledReset(username, quizName, resetDateTime) {
        try {
            // Validate inputs
            if (!username || !quizName || !resetDateTime) {
                throw new Error('Missing required fields: username, quizName, and resetDateTime are required');
            }

            // Create a Date object in the local timezone
            const localDate = new Date(resetDateTime);
            
            // Store the timezone offset in minutes
            const timezoneOffsetMinutes = localDate.getTimezoneOffset();
            
            // Convert to UTC time for storage
            const utcTime = new Date(localDate.getTime() - (timezoneOffsetMinutes * 60000));
            
            console.log(`Creating scheduled reset:
                Local time entered: ${localDate.toLocaleString()}
                UTC time for storage: ${utcTime.toISOString()}
                Timezone offset: ${timezoneOffsetMinutes} minutes`);
            
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/schedules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    quizName,
                    resetDateTime: utcTime.toISOString(),
                    timezoneOffset: timezoneOffsetMinutes
                })
            });
            
            if (response.success) {
                console.log('Successfully created scheduled reset through API:', response);
                
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
                            id: response.data._id || response.data.id || Date.now().toString(),
                            username,
                            quizName,
                            resetDateTime: localDate.toISOString(), // Store the local time in localStorage
                            timezoneOffset: timezoneOffsetMinutes,
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
            throw error;
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
                try {
                    // Convert reset time to local time using the stored offset
                    const resetTime = new Date(new Date(schedule.resetDateTime).getTime() + ((schedule.timezoneOffset || 0) * 60000));
                    
                    console.log(`Schedule for ${schedule.username}'s ${schedule.quizName} quiz - Reset time: ${resetTime.toLocaleString()}, Current time: ${now.toLocaleString()}`);
                    
                    // If the reset time has passed (compare in local time)
                    if (resetTime <= now) {
                        console.log(`Processing scheduled reset for ${schedule.username}'s ${schedule.quizName} quiz`);
                        
                        // Call API to reset the quiz using the correct endpoint
                        const resetResponse = await this.fetchWithAdminAuth(
                            `${this.baseUrl}/admin/users/${schedule.username}/quiz-progress/${schedule.quizName}/reset`,
                            {
                                method: 'POST'
                            }
                        );
                        
                        if (resetResponse.success) {
                            console.log(`Successfully reset quiz progress for ${schedule.username}'s ${schedule.quizName} quiz`);
                            processedIds.push(schedule.id);
                            processedQuizzes.add(schedule.quizName);
                            
                            // Delete the schedule after successful reset
                            await this.cancelScheduledReset(schedule.id);
                        } else {
                            console.error(`Failed to reset quiz progress for ${schedule.username}'s ${schedule.quizName} quiz:`, resetResponse);
                        }
                    }
                } catch (error) {
                    console.error(`Error processing schedule for ${schedule.username}'s ${schedule.quizName} quiz:`, error);
                }
            }
            
            // If any schedules were processed, emit a custom event
            if (processedIds.length > 0) {
                console.log(`Processed ${processedIds.length} scheduled resets`);
                // Dispatch a custom event that the dashboard can listen for
                window.dispatchEvent(new CustomEvent('scheduledResetsProcessed', {
                    detail: {
                        processedIds,
                        processedQuizzes: Array.from(processedQuizzes)
                    }
                }));
            }
            
            return {
                success: true,
                processed: processedIds.length,
                total: schedules.length,
                processedIds,
                processedQuizzes: Array.from(processedQuizzes)
            };
            
        } catch (error) {
            console.error('Error checking scheduled resets:', error);
            return { success: false, message: error.message };
        }
    }

    // Guide settings methods
    async getGuideSettings() {
        try {
            console.log('[API] Fetching all guide settings');
            
            // Try API first
            try {
                const response = await this.fetchWithAuth(`${this.baseUrl}/guide-settings`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.success) {
                    console.log('[API] Successfully fetched guide settings from API:', response.data);
                    
                    // Save to localStorage for backup
                    try {
                        localStorage.setItem('guideSettings', JSON.stringify(response.data || {}));
                        console.log('[API] Saved guide settings to localStorage');
                    } catch (e) {
                        console.warn('[API] Error saving guide settings to localStorage:', e);
                    }
                    
                    return response;
                }
            } catch (apiError) {
                console.warn(`[API] Error fetching guide settings from API:`, apiError);
            }
            
            // Try localStorage as fallback
            try {
                const settingsJson = localStorage.getItem('guideSettings');
                if (settingsJson) {
                    const settings = JSON.parse(settingsJson);
                    console.log(`[API] Using localStorage fallback for guide settings`);
                    return {
                        success: true,
                        data: settings,
                        source: 'localStorage-fallback'
                    };
                }
            } catch (e) {
                console.warn(`[API] Error checking localStorage for guide settings:`, e);
            }
            
            // Return empty settings if all else fails
            return {
                success: true,
                data: {},
                source: 'default'
            };
        } catch (error) {
            console.error('[API] Error in getGuideSettings:', error);
            return {
                success: true,
                data: {},
                source: 'error-fallback'
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
            // Verify admin authentication first
            const authCheck = await this.verifyAdminToken();
            if (!authCheck.success) {
                console.error('Admin authentication failed when saving guide settings');
                throw new Error('Authentication failed. Please log in again.');
            }

            // Normalize quiz name using the proper method
            const normalizedQuiz = this.normalizeQuizName(quizName);
            const sanitizedUrl = url.trim();
            
            // Validate URL if provided
            if (sanitizedUrl && !sanitizedUrl.match(/^https?:\/\/.+/)) {
                throw new Error('Invalid URL format. Must start with http:// or https://');
            }
            
            console.log(`[API] Saving guide setting for ${normalizedQuiz} (from ${quizName}): url=${sanitizedUrl}, enabled=${Boolean(enabled)}`);
            
            // API call
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/guide-settings/${normalizedQuiz}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    url: sanitizedUrl, 
                    enabled: Boolean(enabled) 
                })
            });
            
            // Check response explicitly to ensure we got a valid response
            if (!response || !response.success) {
                const errorMsg = response?.message || 'Failed to save guide settings';
                console.error(`[API] Error saving guide setting: ${errorMsg}`);
                throw new Error(errorMsg);
            }
            
            console.log(`[API] Successfully saved guide setting for ${normalizedQuiz}`);
            
            // Update localStorage with the new settings
            try {
                const existingSettingsJson = localStorage.getItem('guideSettings');
                const existingSettings = existingSettingsJson ? JSON.parse(existingSettingsJson) : {};
                
                const updatedSettings = {
                    ...existingSettings,
                    [normalizedQuiz]: { url: sanitizedUrl, enabled: Boolean(enabled) }
                };
                
                localStorage.setItem('guideSettings', JSON.stringify(updatedSettings));
                console.log('[API] Updated guide settings in localStorage');
            } catch (storageError) {
                console.warn('[API] Failed to update localStorage:', storageError);
            }
            
            return {
                success: true,
                data: response.data || { [normalizedQuiz]: { url: sanitizedUrl, enabled: Boolean(enabled) } }
            };
        } catch (error) {
            console.error('[API] Error saving guide setting:', error);
            throw error;
        }
    }

    // Guide settings methods for quiz UI
    async fetchGuideSettings(quizName) {
        console.log(`[API] Fetching guide settings${quizName ? ` for quiz: ${quizName}` : ''}`);
        
        try {
            // Create a shorter timeout for guide settings
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            try {
                // Use the public endpoint that doesn't require authentication
                const response = await fetch(`${this.baseUrl}/public/guide-settings`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    },
                    signal: controller.signal
                });
                
                // Clear timeout since request completed
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('[API] Raw guide settings response:', data);
                
                if (data && data.success) {
                    // Log detailed guide settings information
                    console.log('[API] Guide settings response details:', {
                        success: data.success,
                        hasData: !!data.data,
                        dataType: typeof data.data,
                        numSettings: Object.keys(data.data || {}).length,
                        settings: data.data
                    });
                    
                    // Validate each guide setting
                    if (data.data && typeof data.data === 'object') {
                        Object.entries(data.data).forEach(([quiz, setting]) => {
                            console.log(`[API] Guide setting for ${quiz}:`, {
                                hasUrl: !!setting?.url,
                                url: setting?.url,
                                enabled: setting?.enabled,
                                isValid: !!(setting?.url && setting?.enabled)
                            });
                        });
                    }
                    
                    // Save to localStorage for backup (if possible)
                    try {
                        localStorage.setItem('guideSettings', JSON.stringify(data.data || {}));
                        console.log('[API] Saved guide settings to localStorage');
                    } catch (e) {
                        console.warn('[API] Error saving guide settings to localStorage (possibly incognito mode):', e);
                    }
                    
                    return {
                        success: true,
                        data: data.data || {}
                    };
                }
                
                throw new Error(data?.message || 'Failed to fetch guide settings');
            } catch (apiError) {
                // Clear timeout in case of error
                clearTimeout(timeoutId);
                
                console.warn('[API] Failed to fetch guide settings from API:', apiError);
                
                // Try localStorage fallback
                try {
                    const settingsJson = localStorage.getItem('guideSettings');
                    if (settingsJson) {
                        const settings = JSON.parse(settingsJson);
                        console.log('[API] Using localStorage fallback for guide settings');
                        return {
                            success: true,
                            data: settings,
                            source: 'localStorage'
                        };
                    }
                } catch (e) {
                    console.warn('[API] Error reading from localStorage:', e);
                }
                
                // Return empty settings if all fallbacks fail
                console.log('[API] All fallbacks failed, returning empty guide settings');
                return {
                    success: true,
                    data: {},
                    source: 'default'
                };
            }
        } catch (error) {
            console.error('[API] Error fetching guide settings:', error);
            return {
                success: true,
                data: {},
                source: 'error-fallback'
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
        return this.fetchWithAdminAuth(`admin/users/${username}/quiz-progress/${quizName}/reset`, {
            method: 'POST'
        });
    }

    async updateQuizVisibility(username, quizName, isVisible) {
        console.log(`Updating visibility for ${username}'s quiz ${quizName} to ${isVisible}`);
        console.log(`API call details:`, {
            username,
            quizName,
            quizNameLower: quizName.toLowerCase(),
            isVisible,
            url: `admin/users/${username}/quiz-visibility/${quizName}`
        });
        
        const result = await this.fetchWithAdminAuth(`admin/users/${username}/quiz-visibility/${quizName}`, {
            method: 'POST',
            body: JSON.stringify({ isVisible })
        });
        
        console.log(`API response for visibility update:`, result);
        return result;
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

    // Delete a guide setting completely
    async deleteGuideSetting(quizName) {
        try {
            // Verify admin authentication first
            const authCheck = await this.verifyAdminToken();
            if (!authCheck.success) {
                console.error('[API] Admin authentication failed when deleting guide setting');
                throw new Error('Authentication failed. Please log in again.');
            }

            // Sanitize input
            const sanitizedQuiz = quizName.trim().toLowerCase();
            
            console.log(`[API] Deleting guide setting for ${sanitizedQuiz}`);
            
            // Get the current guide settings
            const settingsResponse = await this.getGuideSettings();
            if (!settingsResponse.success) {
                throw new Error('Failed to fetch current guide settings');
            }
            
            const currentSettings = settingsResponse.data || {};
            
            // Remove the guide setting for the specified quiz
            delete currentSettings[sanitizedQuiz];
            
            // Save the updated settings
            const apiUrl = `${this.baseUrl}/admin/guide-settings`;
            const response = await this.fetchWithAdminAuth(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(currentSettings)
            });
            
            // Update localStorage regardless of API response
            try {
                const settingsJson = localStorage.getItem('guideSettings');
                if (settingsJson) {
                    const localSettings = JSON.parse(settingsJson);
                    delete localSettings[sanitizedQuiz];
                    localStorage.setItem('guideSettings', JSON.stringify(localSettings));
                    console.log(`[API] Removed guide setting from localStorage for ${sanitizedQuiz}`);
                }
            } catch (e) {
                console.warn(`[API] Error updating localStorage after deleting guide setting: ${e.message}`);
            }
            
            if (!response.success) {
                console.warn(`[API] API response indicated failure: ${response.message}`);
                return {
                    success: true, // Return success even if API fails, since we updated localStorage
                    message: 'Guide setting deleted locally, but server update may have failed',
                    source: 'localStorage'
                };
            }
            
            return {
                success: true,
                message: `Guide setting for ${sanitizedQuiz} deleted successfully`
            };
        } catch (error) {
            console.error('[API] Error deleting guide setting:', error);
            
            // Try localStorage as fallback
            try {
                const settingsJson = localStorage.getItem('guideSettings');
                if (settingsJson) {
                    const settings = JSON.parse(settingsJson);
                    delete settings[quizName];
                    localStorage.setItem('guideSettings', JSON.stringify(settings));
                    console.log(`[API] Updated localStorage as fallback for ${quizName}`);
                    
                    return {
                        success: true,
                        message: 'Guide setting deleted from local storage only (server error)',
                        source: 'localStorage'
                    };
                }
            } catch (e) {
                console.warn('[API] Error updating localStorage:', e);
            }
            
            throw error;
        }
    }

    async deleteUserAccount(username) {
        return this.fetchWithAdminAuth(
            `${this.baseUrl}/admin/users/${username}`,
            {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    // Graceful fallback: try admin endpoint, then fallback to user endpoint for badges only
    async getUserProgressWithFallback(username) {
        // Try admin endpoint first
        try {
            console.log(`[API] Trying admin endpoint for user progress: /admin/users/${username}/progress`);
            const adminResult = await this.getUserProgress(username);
            const hasQuizProgress = adminResult && adminResult.success && adminResult.data && Object.keys(adminResult.data.quizProgress || {}).length > 0;
            const hasQuizResults = adminResult && adminResult.success && adminResult.data && Array.isArray(adminResult.data.quizResults) && adminResult.data.quizResults.length > 0;
            if (hasQuizProgress || hasQuizResults) {
                console.log('[API] Used admin endpoint for user progress (data found)');
                adminResult._source = 'admin';
                return adminResult;
            } else {
                console.warn('[API] Admin endpoint returned empty data, falling back to user endpoint');
                // Fall through to user endpoint
            }
        } catch (adminError) {
            console.warn(`[API] Admin endpoint failed for user progress: ${adminError.message}`);
            // Fallback to user endpoint
        }
        // Fallback to user endpoint
        try {
            console.log(`[API] Trying fallback user endpoint for user progress: /users/${username}/data?includeQuizDetails=true`);
            const userResult = await this.fetchWithAdminAuth(`${this.baseUrl}/users/${username}/data?includeQuizDetails=true`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (userResult && userResult.data && (Object.keys(userResult.data.quizProgress || {}).length > 0 || (userResult.data.quizResults && userResult.data.quizResults.length > 0))) {
                console.log('[API] Used fallback user endpoint for user progress (data found)');
                return {
                    success: true,
                    data: {
                        quizProgress: userResult.data.quizProgress || {},
                        quizResults: userResult.data.quizResults || []
                    },
                    _source: 'user-fallback'
                };
            } else {
                console.warn('[API] User endpoint also returned empty data');
                return {
                    success: true,
                    data: { quizProgress: {}, quizResults: [] },
                    _source: 'user-fallback-empty'
                };
            }
        } catch (userError) {
            console.error(`[API] Both admin and user endpoints failed for user progress: ${userError.message}`);
            return {
                success: false,
                message: 'Both admin and user endpoints failed',
                data: { quizProgress: {}, quizResults: [] }
            };
        }
    }

    async saveQuizProgress(quizName, progress) {
        try {
            console.log(`[API Debug] Raw experience value type: ${typeof progress.experience}, value: ${progress.experience}, isNaN: ${isNaN(progress.experience)}`);
            
            // Normalize the quiz name for consistency - always use standard normalized name
            const normalizedQuizName = this.normalizeQuizName(quizName);
            
            // Additional debug information
            console.log(`[API Debug] Saving progress for quiz: ${quizName} → ${normalizedQuizName}`);
            console.log(`[API Debug] Before sanitization: progress=`, progress);
            
            // Type checking and complete sanitization of the progress object
            const sanitizedProgress = {
                ...progress,
                // Ensure experience is a valid number
                experience: !isNaN(parseFloat(progress.experience)) ? parseFloat(progress.experience) : 0,
                // Ensure other numeric values are also valid
                questionsAnswered: !isNaN(parseInt(progress.questionsAnswered)) ? parseInt(progress.questionsAnswered) : 0,
                currentScenario: !isNaN(parseInt(progress.currentScenario)) ? parseInt(progress.currentScenario) : 0,
                scorePercentage: !isNaN(parseFloat(progress.scorePercentage)) ? parseFloat(progress.scorePercentage) : 0,
                // Ensure arrays are always arrays
                tools: Array.isArray(progress.tools) ? progress.tools : [],
                questionHistory: Array.isArray(progress.questionHistory) ? progress.questionHistory : [],
                // Ensure other fields have fallbacks
                status: progress.status || 'in-progress',
                randomizedScenarios: progress.randomizedScenarios || {},
                lastUpdated: progress.lastUpdated || new Date().toISOString()
            };
            
            // Special check for history-based experience calculation for communication quiz
            if (sanitizedProgress.experience === 0 && 
                Array.isArray(sanitizedProgress.questionHistory) && 
                sanitizedProgress.questionHistory.length > 0) {
                
                let calculatedExperience = 0;
                
                // Try to calculate experience from question history
                sanitizedProgress.questionHistory.forEach(question => {
                    if (question.selectedAnswer && typeof question.selectedAnswer.experience === 'number') {
                        calculatedExperience += question.selectedAnswer.experience;
                    }
                });
                
                if (calculatedExperience > 0) {
                    console.log(`[API Debug] Communication quiz: Calculated experience ${calculatedExperience} from question history`);
                    sanitizedProgress.experience = calculatedExperience;
                }
            }
            
            console.log(`[API Debug] After fixes: experience=${sanitizedProgress.experience}`);
            
            // Ensure all required fields are present with defaults - now using the sanitized values
            const progressData = {
                experience: sanitizedProgress.experience,
                questionsAnswered: sanitizedProgress.questionsAnswered,
                status: sanitizedProgress.status,
                scorePercentage: sanitizedProgress.scorePercentage,
                tools: sanitizedProgress.tools,
                questionHistory: sanitizedProgress.questionHistory,
                currentScenario: sanitizedProgress.currentScenario,
                randomizedScenarios: sanitizedProgress.randomizedScenarios,
                lastUpdated: sanitizedProgress.lastUpdated
            };
            
            // Check for inconsistent states before saving
            // If completed/passed/failed, ensure we have the right number of questions
            if (['completed', 'passed', 'failed'].includes(progressData.status)) {
                // If we don't have enough questions answered, revert to in-progress
                if (progressData.questionHistory.length < 15 && progressData.questionsAnswered < 15) {
                    console.log(`[API] Fixing inconsistent state before save: quiz marked as ${progressData.status} but has insufficient questions. Setting to in-progress.`);
                    progressData.status = 'in-progress';
                }
            }
            
            console.log(`[API] Processed progress data for ${normalizedQuizName}:`, {
                currentScenario: progressData.currentScenario,
                questionsAnswered: progressData.questionsAnswered,
                status: progressData.status,
                questionHistoryLength: (progressData.questionHistory || []).length,
                experience: progressData.experience,
                experienceType: typeof progressData.experience
            });
            
            // First save to localStorage as backup
            let localSaveSuccessful = false;
            try {
                const username = localStorage.getItem('username');
                if (username) {
                    // Use the new unique storage key method
                    const storageKey = this.getUniqueQuizStorageKey(username, normalizedQuizName);
                    
                    // Save with the new key format
                    localStorage.setItem(storageKey, JSON.stringify({ 
                        data: progressData,
                        timestamp: new Date().toISOString(),
                        quizName: normalizedQuizName // Explicitly add quiz name to data for verification
                    }));
                    
                    console.log(`[API] Saved backup to localStorage with strict key for ${normalizedQuizName}: ${storageKey}`);
                    
                    // Set success flag
                    localSaveSuccessful = true;
                    
                    // Also save to old format for backward compatibility during transition
                    const oldStorageKey = `quiz_progress_${username}_${normalizedQuizName}`;
                    localStorage.setItem(oldStorageKey, JSON.stringify({ 
                            data: progressData,
                        timestamp: new Date().toISOString(),
                        quizName: normalizedQuizName // Add quiz name for verification
                        }));
                    console.log(`[API] Also saved to old format key for backward compatibility: ${oldStorageKey}`);
                } else {
                    console.warn('[API] Could not save to localStorage - no username found');
                }
            } catch (e) {
                console.error('[API] Failed to save localStorage backup:', e);
            }
            
            // Try to save to API with normalized quiz name
            let apiSaveSuccessful = false;
            
            try {
                // Augment the post data with explicit metadata
                const postData = {
                    quizName: normalizedQuizName,
                    progress: progressData,
                    _metaInfo: {
                        clientTimestamp: new Date().toISOString(),
                        originalQuizName: quizName,
                        normalizedQuizName: normalizedQuizName,
                        experienceType: typeof progressData.experience
                    }
                };
                
                console.log(`[API] Saving to API: ${normalizedQuizName}`, postData);
                
                const apiUrl = `${this.baseUrl}/users/quiz-progress`;
                console.log(`[API] POST URL: ${apiUrl}`);
                
                const response = await this.fetchWithAuth(
                    apiUrl,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(postData)
                    }
                );
                
                if (response && response.success) {
                    console.log(`[API] Successfully saved progress for quiz ${normalizedQuizName}`);
                    apiSaveSuccessful = true;
                } else {
                    console.warn(`[API] Failed to save progress to API: ${response?.message || 'Unknown error'}`);
                }
            } catch (apiError) {
                console.error(`[API] Error saving to API:`, apiError);
            }
            
            return {
                success: true,
                data: progressData,
                apiSaved: apiSaveSuccessful,
                localSaved: localSaveSuccessful
            };
            
        } catch (error) {
            console.error(`[API] Error saving quiz progress:`, error);
            
            // Try to save to localStorage as last resort fallback
            try {
                const username = localStorage.getItem('username');
                if (username) {
                    // Create a sanitized copy of progress to ensure we're storing valid data
                    const fallbackProgress = {
                        ...progress,
                        experience: !isNaN(parseFloat(progress.experience)) ? parseFloat(progress.experience) : 0,
                        questionsAnswered: !isNaN(parseInt(progress.questionsAnswered)) ? parseInt(progress.questionsAnswered) : 0,
                        currentScenario: !isNaN(parseInt(progress.currentScenario)) ? parseInt(progress.currentScenario) : 0,
                        scorePercentage: !isNaN(parseFloat(progress.scorePercentage)) ? parseFloat(progress.scorePercentage) : 0,
                        tools: Array.isArray(progress.tools) ? progress.tools : [],
                        questionHistory: Array.isArray(progress.questionHistory) ? progress.questionHistory : []
                    };
                    
                    const normalizedQuizName = this.normalizeQuizName(quizName);
                    const storageKey = `quiz_progress_${username}_${normalizedQuizName}`;
                    localStorage.setItem(storageKey, JSON.stringify({ 
                        data: fallbackProgress,
                        timestamp: new Date().toISOString() 
                    }));
                    
                    console.log(`[API] Saved emergency fallback to localStorage for ${normalizedQuizName}`);
                    
                    // For communication quiz, save to additional emergency backup location
                    if (normalizedQuizName === 'communication') {
                        localStorage.setItem(`quiz_progress_${username}_communication_emergency`, JSON.stringify({ 
                            data: fallbackProgress,
                            timestamp: new Date().toISOString() 
                        }));
                        console.log(`[API] Created emergency backup for communication quiz`);
                    }
                    
                    return {
                        success: true,
                        message: 'Saved to localStorage only (API failed)',
                        data: fallbackProgress,
                        apiSaved: false,
                        localSaved: true
                    };
                }
            } catch (e) {
                console.error('[API] Failed to save localStorage fallback:', e);
            }
            
            return {
                success: false,
                message: error.message || 'Failed to save quiz progress',
                data: progress // Return original progress in case of error
            };
        }
    }

    /**
     * Clears localStorage data for a specific quiz
     * This is useful when a quiz is completed to prevent old cached data from interfering
     * with future attempts.
     * 
     * @param {string} username - The username
     * @param {string} quizName - The name of the quiz
     * @returns {boolean} - Whether any data was cleared
     */
    clearQuizLocalStorage(username, quizName) {
        try {
            if (!username || !quizName) {
                console.warn('[API] Cannot clear quiz localStorage: missing username or quizName');
                return false;
            }
            
            console.log(`[API] Clearing localStorage data for quiz: ${quizName}, user: ${username}`);
            
            // Get the unique storage key for this quiz
            const normalizedQuizName = this.normalizeQuizName(quizName);
            const storageKey = this.getUniqueQuizStorageKey(username, normalizedQuizName);
            
            // Clear old format key too for backward compatibility
            const oldStorageKey = `quiz_progress_${username}_${normalizedQuizName}`;
            
            let cleared = false;
            
            // Clear both new and old format keys
            if (localStorage.getItem(storageKey) !== null) {
                    localStorage.removeItem(storageKey);
                console.log(`[API] Cleared localStorage entry for quiz: ${normalizedQuizName} (new format)`);
                cleared = true;
            }
            
            if (localStorage.getItem(oldStorageKey) !== null) {
                localStorage.removeItem(oldStorageKey);
                console.log(`[API] Cleared localStorage entry for quiz: ${normalizedQuizName} (old format)`);
                cleared = true;
            }
            
            return cleared;
        } catch (error) {
            console.error(`[API] Error clearing localStorage for quiz ${quizName}:`, error);
            return false;
        }
    }

    /**
     * Verifies the admin token is valid
     * @returns {Promise<Object>} - Object with success/failure information
     */
    async verifyAdminToken() {
        try {
            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) {
                return { success: false, message: 'No admin token found' };
            }

            // Create AbortController for timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            try {
                const response = await fetch(`${this.baseUrl}/admin/verify-token`, {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    signal: controller.signal
                });

                clearTimeout(timeoutId); // Clear the timeout since fetch completed

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('adminToken');
                        return { success: false, message: 'Admin token expired or invalid' };
                    }
                    return { success: false, message: `Server error: ${response.status}` };
                }

                try {
                    const data = await response.json();
                    return { success: data.valid !== false, data };
                } catch (parseError) {
                    return { success: false, message: 'Invalid response from server' };
                }
            } catch (fetchError) {
                clearTimeout(timeoutId); // Clear the timeout in case of error

                // Check for timeout error
                if (fetchError.name === 'AbortError') {
                    console.error('Timeout verifying admin token');
                    return { success: false, message: 'Verification request timed out. Server may be busy.' };
                }

                // Check for network error
                if (fetchError.name === 'TypeError' && fetchError.message === 'Failed to fetch') {
                    console.error('Network error verifying admin token - server may be unreachable');
                    return { success: false, message: 'Server connection failed. Please check your network connection.' };
                }

                throw fetchError; // Re-throw unexpected errors
            }
        } catch (error) {
            console.error('Error verifying admin token:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Get a user's progress for all quizzes
     * @param {string} username - The username to get progress for
     * @returns {Promise<Object>} - Object with quiz progress data
     */
    async getUserProgress(username) {
        try {
            if (!username) {
                return {
                    success: false,
                    message: 'Username is required',
                    data: { quizProgress: {}, quizResults: [] }
                };
            }
            
            console.log(`[API] Getting progress for user: ${username}`);
            
            const response = await this.fetchWithAdminAuth(`${this.baseUrl}/admin/users/${username}/progress`);
            
            if (!response || !response.success) {
                console.warn(`[API] Error getting user progress: ${response?.message || 'Unknown error'}`);
                return {
                    success: false,
                    message: response?.message || 'Failed to get user progress',
                    data: { quizProgress: {}, quizResults: [] }
                };
            }
            
            // Ensure we have the expected data structure
            const quizProgress = response.data?.quizProgress || {};
            const quizResults = response.data?.quizResults || [];
            
            return {
                success: true,
                data: {
                    quizProgress,
                    quizResults
                }
            };
        } catch (error) {
            console.error(`[API] Error getting user progress:`, error);
            return {
                success: false,
                message: error.message || 'Failed to get user progress',
                data: { quizProgress: {}, quizResults: [] }
            };
        }
    }

    // Add this new method to get a completely unique and consistent storage key for each quiz
    getUniqueQuizStorageKey(username, quizName) {
        if (!username || !quizName) {
            console.warn('[API] Missing username or quizName for storage key generation');
            return null;
        }
        
        // Normalize the quiz name to ensure consistency
        const normalizedQuizName = this.normalizeQuizName(quizName);
        
        // Create the storage key with a prefix to avoid collisions with other data
        return `strict_quiz_progress_${username}_${normalizedQuizName}`;
    }
} 