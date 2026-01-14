document.addEventListener("DOMContentLoaded", () => {

     const picWrapper = document.getElementById("profile-pic-wrapper");
    const picInput = document.getElementById("profile-pic-input");
    const picPreview = document.getElementById("profile-pic-preview");
      const profileMsg = document.getElementById("profile-message");
    // Click on circle -> open file picker
    if (picWrapper && picInput) {
        picWrapper.addEventListener("click", () => {
            picInput.click();
        });
    }

    // When user selects a file, show preview
    if (picInput && picPreview) {
        picInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const url = URL.createObjectURL(file);
            picPreview.src = url;
        });
    }

    async function loadProfile() {
        try {
            const res = await fetch("/api/accounts/profile/", {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    "X-Requested-With": "XMLHttpRequest"
                }
            });

            if (!res.ok) {
                if (profileMsg) {
                    profileMsg.textContent = "Unable to load profile. Are you logged in?";
                    profileMsg.style.color = "red";
                }
                return;
            }

        const data = await res.json();

        document.getElementById("profile-username").value = data.username;
        document.getElementById("profile-email").value = data.email || "";
        document.getElementById("profile-phone").value = data.phone || "";
        document.getElementById("profile-age").value = data.age || "";
        document.getElementById("profile-gender").value = data.gender || "";
        document.getElementById("profile-dob").value = data.dob || "";
    }catch (err) {
            console.error(err);
            if (profileMsg) {
                profileMsg.textContent = "Error loading profile.";
                profileMsg.style.color = "red";
            }
        }
    }

    loadProfile();

    const saveBtn = document.getElementById("save-profile-btn");
    if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
            if (profileMsg) {
                profileMsg.textContent = "";
            }

            const body = {
                email:  document.getElementById("profile-email").value || "",
                phone:  document.getElementById("profile-phone").value || "",
                age:    document.getElementById("profile-age").value   || null,
                gender: document.getElementById("profile-gender").value || "",
                dob:    document.getElementById("profile-dob").value   || null,
            };

            try {
                const res = await fetch("/api/accounts/profile/", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCSRFToken()
                    },
                    credentials: "same-origin",
                    body: JSON.stringify(body)
                });

                const data = await res.json();

                if (res.ok) {
                    if (profileMsg) {
                        profileMsg.textContent = data.message || "Profile updated.";
                        profileMsg.style.color = "green";
                    }
                } else {
                    if (profileMsg) {
                        profileMsg.textContent = "Failed to update profile.";
                        profileMsg.style.color = "red";
                    }
                    console.error(data);
                }
            } catch (err) {
                console.error(err);
                if (profileMsg) {
                    profileMsg.textContent = "Error updating profile.";
                    profileMsg.style.color = "red";
                }
            }
        });
    }


    document.getElementById("save-profile-btn").addEventListener("click", async () => {
        const body = {
            email: document.getElementById("profile-email").value,
            phone: document.getElementById("profile-phone").value,
            age: document.getElementById("profile-age").value,
            gender: document.getElementById("profile-gender").value,
            dob: document.getElementById("profile-dob").value,
        };

        const res = await fetch("/api/accounts/profile/", {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken()
            },
            credentials: "same-origin",
            body: JSON.stringify(body)
        });

        const data = await res.json();

        document.getElementById("profile-message").textContent = data.message;
        document.getElementById("profile-message").style.color = "green";
    });
});
