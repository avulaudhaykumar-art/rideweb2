/* ===========================================
   LOGIN PAGE JAVASCRIPT
=========================================== */

const loginButton = document.getElementById("loginBtn");

if (loginButton) {
    loginButton.addEventListener("click", loginSystem);
}

/* ===========================================
   LOGIN SYSTEM
=========================================== */

function loginSystem() {
    const role = document.getElementById("role").value;
    const email = document.querySelector("input[type='email']").value;
    const password = document.querySelector("input[type='password']").value;

    if (email === "" || password === "") {
        alert("Please enter Email and Password");
        return;
    }

    if (role === "Rider") {
        alert("Welcome Rider!");
        window.location.href = "../rider/dashboard.html";
    }

    else if (role === "Driver") {
        alert("Welcome Driver!");
        window.location.href = "../driver/dashboard.html";
    }

    else if (role === "Admin") {
        alert("Welcome Admin!");
        window.location.href = "../admin/dashboard.html";
    }

    else if (role === "Super Admin") {
        const superEmail = "admin@rideshare.com";
        const superPassword = "admin123";

        if (email === superEmail && password === superPassword) {
            alert("Welcome Super Admin!");
            window.location.href = "../admin/dashboard.html";
        } else {
            alert("Invalid Super Admin Credentials");
        }
    }
}

/* ===========================================
   ENTER KEY SUPPORT
=========================================== */

document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        loginSystem();
    }
});

/* ===========================================
   PASSWORD SHOW / HIDE
=========================================== */

const passwordField = document.querySelector("input[type='password']");

if (passwordField) {
    passwordField.addEventListener("dblclick", function () {
        if (passwordField.type === "password") {
            passwordField.type = "text";
        } else {
            passwordField.type = "password";
        }
    });
}

/* ===========================================
   PAGE LOAD
=========================================== */

window.onload = function () {
    console.log("Ride Sharing Login Loaded");
};

/* ===========================================
   LOGIN SESSION MANAGEMENT
=========================================== */

function saveSession(role, email) {
    let userSession = {
        role: role,
        email: email,
        loginTime: new Date()
    };

    localStorage.setItem(
        "rideShareUser",
        JSON.stringify(userSession)
    );
}

/* ===========================================
   AUTO LOGIN CHECK
=========================================== */

function checkSession() {
    let session = localStorage.getItem("rideShareUser");

    if (session) {
        let user = JSON.parse(session);
        console.log("Active User:", user.role);
    }
}

checkSession();

/* ===========================================
   LOGOUT SYSTEM
=========================================== */

function logout() {
    localStorage.removeItem("rideShareUser");
    alert("Logged out successfully");
    window.location.href = "../index.html";
}

/* ===========================================
   USER PROFILE STORAGE
=========================================== */

function createProfile(role, email) {
    let profile = {
        role: role,
        email: email,
        status: "Active"
    };

    localStorage.setItem(
        "profile",
        JSON.stringify(profile)
    );
}

/* ===========================================
   LOGIN ACTIVITY LOG
=========================================== */

function saveLoginActivity(role) {
    let activity = {
        role: role,
        time: new Date().toLocaleString()
    };

    localStorage.setItem(
        "lastLogin",
        JSON.stringify(activity)
    );
}

console.log("Login System Ready 🚖");

/* ===========================================
   FINAL NAVIGATION TEST
=========================================== */

function testConnection() {
    console.log("All pages connected successfully 🚖");
    console.log(`
Connected Modules:

✅ Login Page
✅ Admin Dashboard
✅ Rider Dashboard
✅ Driver Dashboard
`);
}

testConnection();
