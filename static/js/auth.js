document.addEventListener('DOMContentLoaded', () => {
    // ========= PASSWORD STRENGTH CHECK =========
    function isStrongPassword(password) {
        // Minimum 8 chars, at least: 1 upper, 1 lower, 1 number, 1 special character
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        return pattern.test(password);
    }

    const loginBlock = document.getElementById('login-block');
    const signupBlock = document.getElementById('signup-block');

    const loginBtn = document.getElementById('login-btn');
    const showSignupBtn = document.getElementById('show-signup-btn');
    const createAccountBtn = document.getElementById('create-account-btn');
    const backToLoginBtn = document.getElementById('back-to-login');

    const loginMsg = document.getElementById('login-message');
    const signupMsg = document.getElementById('signup-message');

    // ===== Switch to signup view =====
    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', () => {
            if (loginBlock) loginBlock.style.display = 'none';
            if (signupBlock) signupBlock.style.display = 'block';
            signupMsg.textContent = '';
        });
    }

    // ===== Back to login view =====
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => {
            if (signupBlock) signupBlock.style.display = 'none';
            if (loginBlock) loginBlock.style.display = 'block';
            loginMsg.textContent = '';
        });
    }

    // ===== LOGIN =====
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;

            loginMsg.textContent = '';

            if (!username || !password) {
                loginMsg.textContent = 'Please enter username and password.';
                loginMsg.style.color = 'red';
                return;
            }

            try {
                const res = await fetch('/api/accounts/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': getCSRFToken()
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify({ username, password })
                });

                const data = await res.json();

                if (res.ok) {
                    window.location.href = '/dashboard/';
                } else {
                    loginMsg.textContent = data.non_field_errors
                        ? data.non_field_errors[0]
                        : 'Login failed. Check your credentials.';
                    loginMsg.style.color = 'red';
                }
            } catch (err) {
                console.error(err);
                loginMsg.textContent = 'Error connecting to server.';
                loginMsg.style.color = 'red';
            }
        });
    }

    // ===== SIGNUP (CREATE ACCOUNT) =====
    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', async () => {
            const username = document.getElementById('signup-username').value.trim();
            const password = document.getElementById('signup-password').value;
            const email = document.getElementById('signup-email').value.trim();
            const ageValue = document.getElementById('signup-age').value;
            const phone = document.getElementById('signup-phone').value.trim();
            const gender = document.getElementById('signup-gender').value;

            signupMsg.textContent = '';

            if (!username || !password || !email) {
                signupMsg.textContent = 'Username, password, and email are required.';
                signupMsg.style.color = 'red';
                return;
            }

            // Check email quickly (HTML type=email helps too)
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                signupMsg.textContent = 'Please enter a valid email address.';
                signupMsg.style.color = 'red';
                return;
            }

            // 🔐 Strong password check
            if (!isStrongPassword(password)) {
                signupMsg.textContent =
                    'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';
                signupMsg.style.color = 'red';
                return;
            }

            let age = null;
            if (ageValue) {
                age = parseInt(ageValue, 10);
                if (isNaN(age) || age <= 0) {
                    signupMsg.textContent = 'Please enter a valid age.';
                    signupMsg.style.color = 'red';
                    return;
                }
            }

            const body = {
                username,
                password,
                email,
                age,
                phone,
                gender
            };

            try {
                const res = await fetch('/api/accounts/register/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': getCSRFToken()
                    },
                    body: JSON.stringify(body)
                });

                const data = await res.json();

                if (res.ok) {
                    signupMsg.textContent = 'Account created successfully. You can login now.';
                    signupMsg.style.color = 'green';
                } else {
                    if (data.username) {
                        signupMsg.textContent = data.username[0];
                    } else if (data.email) {
                        signupMsg.textContent = data.email[0];
                    } else if (data.password) {
                        signupMsg.textContent = data.password[0];
                    } else {
                        signupMsg.textContent = 'Failed to create account.';
                    }
                    signupMsg.style.color = 'red';
                }
            } catch (err) {
                console.error(err);
                signupMsg.textContent = 'Error connecting to server.';
                signupMsg.style.color = 'red';
            }
        });
    }
});
