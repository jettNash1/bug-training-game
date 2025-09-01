/**
 * Test script to verify cache invalidation system
 * Run this in browser console to test cross-browser cache invalidation
 */

class CacheInvalidationTest {
    constructor() {
        this.apiService = window.apiService || new APIService();
        this.testResults = [];
    }

    async runTests() {
        console.log('🧪 Starting Cache Invalidation Tests...');
        
        try {
            // Test 1: Check if user is logged in
            await this.testUserLogin();
            
            // Test 2: Test cache invalidation check
            await this.testCacheInvalidationCheck();
            
            // Test 3: Test quiz progress loading with invalidation
            await this.testQuizProgressWithInvalidation();
            
            this.printResults();
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        }
    }

    async testUserLogin() {
        console.log('🔐 Testing user login status...');
        
        try {
            const username = localStorage.getItem('username');
            const token = localStorage.getItem('token');
            
            if (!username || !token) {
                this.addResult('User Login', false, 'No username or token found');
                return;
            }

            const verification = await this.apiService.verifyToken();
            if (verification.success) {
                this.addResult('User Login', true, `Logged in as ${username}`);
            } else {
                this.addResult('User Login', false, 'Token verification failed');
            }
        } catch (error) {
            this.addResult('User Login', false, `Error: ${error.message}`);
        }
    }

    async testCacheInvalidationCheck() {
        console.log('🔄 Testing cache invalidation check...');
        
        try {
            const username = localStorage.getItem('username');
            const testQuiz = 'communication';
            
            // Test the cache invalidation check
            const response = await fetch(`${this.apiService.baseUrl}/check-cache-invalidation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    quizName: testQuiz,
                    lastCheck: '0'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.addResult('Cache Invalidation Check', true, `Response: shouldInvalidate=${data.shouldInvalidate}, invalidationTime=${data.invalidationTime}`);
            } else {
                this.addResult('Cache Invalidation Check', false, `HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            this.addResult('Cache Invalidation Check', false, `Error: ${error.message}`);
        }
    }

    async testQuizProgressWithInvalidation() {
        console.log('📊 Testing quiz progress with invalidation...');
        
        try {
            const testQuiz = 'communication';
            
            // Test getting quiz progress (this should trigger invalidation check)
            const progress = await this.apiService.getQuizProgress(testQuiz);
            
            if (progress.success) {
                const hasProgress = progress.data.questionHistory?.length > 0 || 
                                  progress.data.questionsAnswered > 0;
                
                this.addResult('Quiz Progress with Invalidation', true, 
                    `Progress loaded: questionsAnswered=${progress.data.questionsAnswered}, hasHistory=${!!progress.data.questionHistory?.length}`);
            } else {
                this.addResult('Quiz Progress with Invalidation', false, progress.message || 'Failed to load progress');
            }
        } catch (error) {
            this.addResult('Quiz Progress with Invalidation', false, `Error: ${error.message}`);
        }
    }

    addResult(testName, passed, message) {
        this.testResults.push({
            test: testName,
            passed,
            message,
            timestamp: new Date().toISOString()
        });
        
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${testName}: ${message}`);
    }

    printResults() {
        console.log('\n📊 Cache Invalidation Test Results:');
        console.log('===================================');
        
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        
        this.testResults.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${result.test}: ${result.message}`);
        });
        
        console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
        
        if (passed === total) {
            console.log('🎉 All tests passed! Cache invalidation system should work correctly.');
        } else {
            console.log('⚠️ Some tests failed. Please check the implementation.');
        }
    }

    // Manual test function for admins
    async testManualInvalidation(username, quizName) {
        console.log(`🧪 Testing manual invalidation for ${username}'s ${quizName} quiz...`);
        
        try {
            // First, check current invalidation status
            const response = await fetch(`${this.apiService.baseUrl}/check-cache-invalidation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    quizName,
                    lastCheck: '0'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`📊 Current invalidation status:`, data);
                return data;
            } else {
                console.error(`❌ Failed to check invalidation: ${response.status}`);
                return null;
            }
        } catch (error) {
            console.error(`❌ Error testing manual invalidation:`, error);
            return null;
        }
    }
}

// Export for use in browser console
window.CacheInvalidationTest = CacheInvalidationTest;

// Auto-run if this script is loaded
if (typeof window !== 'undefined') {
    const test = new CacheInvalidationTest();
    test.runTests();
}

// Manual test function for admins
window.testManualInvalidation = function(username, quizName) {
    const test = new CacheInvalidationTest();
    return test.testManualInvalidation(username, quizName);
};
