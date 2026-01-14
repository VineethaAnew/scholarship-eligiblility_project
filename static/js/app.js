document.addEventListener('DOMContentLoaded', () => {
   
    // ... existing code (marksInput, submit, dashboard listing etc.)

    // ===== 3-dots menu on dashboard =====
    const menuButton = document.getElementById('menu-button');
    const menuDropdown = document.getElementById('menu-dropdown');
    const menuProfile = document.getElementById('menu-profile');
    const menuSettings = document.getElementById('menu-settings');
    const menuApplied = document.getElementById('menu-applied');
    const menuLogout = document.getElementById('menu-logout');

    // Only run this logic on dashboard page
    if (menuButton && menuDropdown) {
        // Toggle dropdown
        menuButton.addEventListener('click', (e) => {
            e.stopPropagation(); // don’t trigger document click
            menuDropdown.classList.toggle('show');
        });

        // Clicking outside closes dropdown
        document.addEventListener('click', () => {
            menuDropdown.classList.remove('show');
        });

        // Prevent closing when clicking inside dropdown
        menuDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Menu actions
    if (menuProfile) {
    menuProfile.addEventListener('click', () => {
        window.location.href = '/profile/';
    });
}


    if (menuSettings) {
        menuSettings.addEventListener('click', () => {
            alert('Settings page coming soon.');
        });
    }

    if (menuApplied) {
    menuApplied.addEventListener('click', () => {
        window.location.href = '/applied/';
    });
}


    if (menuLogout) {
        menuLogout.addEventListener('click', async () => {
            try {
                const res = await fetch('/api/accounts/logout/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': getCSRFToken()
                    },
                    credentials: 'same-origin'
                });

                if (res.ok) {
                    // Back to login page
                    window.location.href = '/';
                } else {
                    alert('Logout failed. Try again.');
                }
            } catch (err) {
                console.error(err);
                alert('Error while logging out.');
            }
        });
    }

    // ... your existing dashboard applications loading code ...


    
    const marksInput = document.getElementById('marks');
    const bankAccountInput = document.getElementById('bank_account_number');
    const bankIfscInput = document.getElementById('bank_ifsc');
    const bankNameInput = document.getElementById('bank_name');
    const submitBtn = document.getElementById('submit-application');
    const applyMsg = document.getElementById('apply-message');

    // Enable/disable bank fields based on marks
    if (marksInput) {
        marksInput.addEventListener('input', () => {
            const marks = parseInt(marksInput.value || '0', 10);
            const eligible = marks >= 75;

            bankAccountInput.disabled = !eligible;
            bankIfscInput.disabled = !eligible;
            bankNameInput.disabled = !eligible;
            submitBtn.disabled = !marks || marks < 0 || marks > 100 ? true : false;
        });
    }

    // Submit application
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            const body = {
                name: document.getElementById('name').value,
                college: document.getElementById('college').value,
                parents_name: document.getElementById('parents_name').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                marks: parseInt(document.getElementById('marks').value || '0', 10),
            };

            // If marks >= 75, include bank data
            if (body.marks >= 75) {
                body.bank_account_number = bankAccountInput.value;
                body.bank_ifsc = bankIfscInput.value;
                body.bank_name = bankNameInput.value;
            }

            const res = await fetch('/api/scholarships/apply/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRFToken': getCSRFToken() },
                credentials: 'same-origin',
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (res.ok) {
                applyMsg.textContent = data.is_eligible
                    ? 'Application submitted. You are eligible!'
                    : 'Application submitted. You are NOT eligible.';
                applyMsg.style.color = 'green';
            } else {
                applyMsg.textContent = JSON.stringify(data);
                applyMsg.style.color = 'red';
            }
        });
    }

    // Load applications on dashboard
    const appsList = document.getElementById('applications-list');
    if (appsList) {
        (async () => {
            const res = await fetch('/api/scholarships/my/', {
                method: 'GET',
                credentials: 'same-origin',
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            if (!res.ok) {
                appsList.innerHTML = '<li>Unable to load applications. Are you logged in?</li>';
                return;
            }
            const data = await res.json();
            if (data.length === 0) {
                appsList.innerHTML = '<li>No applications yet.</li>';
                return;
            }
            appsList.innerHTML = '';
            data.forEach(app => {
                const li = document.createElement('li');
                li.textContent = `${app.name} - Marks: ${app.marks} - ${app.is_eligible ? 'Eligible' : 'Not eligible'}`;
                appsList.appendChild(li);
            });
        })();
    }
});
