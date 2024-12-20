// UI Helper Functions
function showLoginForm() {
    document.getElementById('loginFormContent').style.display = 'block';
    document.getElementById('registerFormContent').style.display = 'none';
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
}

function showRegisterForm() {
    document.getElementById('loginFormContent').style.display = 'none';
    document.getElementById('registerFormContent').style.display = 'block';
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('registerTab').classList.add('active');
}

async function handleLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const user = await UserManager.login(username, password);
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('userInfo').style.display = 'block';
        document.getElementById('userDisplay').textContent = username;
        await updateUIForLoggedInUser(user);
    } catch (error) {
        alert(error.message || 'Login failed. Please try again.');
    }
}

async function handleRegister() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const user = await UserManager.register(username, password);
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('userInfo').style.display = 'block';
        document.getElementById('userDisplay').textContent = username;
        await updateUIForLoggedInUser(user);
    } catch (error) {
        alert(error.message || 'Registration failed. Please try again.');
    }
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', async () => {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    
    if (username && token) {
        const loginForm = document.getElementById('loginForm');
        const userInfo = document.getElementById('userInfo');
        const userDisplay = document.getElementById('userDisplay');
        
        if (loginForm && userInfo && userDisplay) {
            loginForm.style.display = 'none';
            userInfo.style.display = 'block';
            userDisplay.textContent = username;
            
            try {
                const user = new QuizUser(username);
                await updateUIForLoggedInUser(user);
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        }
    }
});

async function updateUIForLoggedInUser(user) {
    try {
        const results = await user.loadUserData();
        const quizProgress = document.getElementById('quizProgress');
        
        if (quizProgress) {
            if (Array.isArray(results) && results.length > 0) {
                quizProgress.innerHTML = results.map(result => {
                    // Format quiz name to be more readable
                    const quizName = result.quizName
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    const score = result.score || 0;
                    return `
                        <div class="quiz-result">
                            <span class="quiz-name">${quizName}</span>
                            <span class="quiz-score">${score}%</span>
                        </div>
                    `;
                }).join('');
            } else {
                quizProgress.innerHTML = '<div class="quiz-result">No quiz results yet</div>';
            }
        }
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}