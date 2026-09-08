"use strict";

/* ===========================================
   SMART RIDESHARE LOGIN SYSTEM
   BACKEND CONNECTED VERSION
=========================================== */

const API_URL = "http://localhost:3000";

const loginButton = document.getElementById("loginBtn");

if (loginButton) {
    loginButton.addEventListener("click", loginSystem);
}


/* ===========================================
   LOGIN SYSTEM
=========================================== */

async function loginSystem() {

    const roleElement =
        document.getElementById("role");

    const emailElement =
        document.querySelector("input[type='email']");

    const passwordElement =
        document.querySelector("input[type='password']");


    if (!roleElement || !emailElement || !passwordElement) {

        console.error("Login form elements not found.");

        return;

    }


    const role =
        roleElement.value.trim();

    const email =
        emailElement.value.trim();

    const password =
        passwordElement.value;


    /* ===========================================
       VALIDATION
    =========================================== */

    if (!email || !password) {

        alert("⚠️ Please enter Email and Password.");

        return;

    }


    /* ===========================================
       BUTTON LOADING
    =========================================== */

    loginButton.disabled = true;

    loginButton.textContent =
        "Logging in...";


    try {

        /* ===========================================
           SEND LOGIN REQUEST TO BACKEND
        =========================================== */

        const response =
            await fetch(

                API_URL +
                "/api/auth/login",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            email: email,

                            password: password

                        })

                }

            );


        const data =
            await response.json();


        /* ===========================================
           LOGIN ERROR
        =========================================== */

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(

                data.message ||
                "Login failed."

            );

        }


        /* ===========================================
           USER FROM DATABASE
        =========================================== */

        const user =
            data.user;


        console.log(
            "Backend user:",
            user
        );


        /* ===========================================
           NORMALIZE ROLES
        =========================================== */

        const selectedRole =
            normalizeRole(role);

        const actualRole =
            normalizeRole(user.role);


        /* ===========================================
           ROLE CHECK
        =========================================== */

        if (
            selectedRole !==
            actualRole
        ) {

            alert(

                "⚠️ Role mismatch.\n\n" +

                "You selected: " +
                role +

                "\nDatabase account: " +
                user.role

            );


            resetLoginButton();

            return;

        }


        /* ===========================================
           SAVE SESSION
        =========================================== */

        saveSession(user);


        createProfile(user);


        saveLoginActivity(user);


        localStorage.setItem(

            "loggedInUser",

            JSON.stringify(user)

        );


        localStorage.setItem(

            "isLoggedIn",

            "true"

        );


        /* ===========================================
           SUCCESS
        =========================================== */

        alert(

            "✅ Login successful!\n\n" +

            "Welcome " +
            user.name +
            "!"

        );


        /* ===========================================
           REDIRECT
        =========================================== */

        redirectUser(
            actualRole
        );


    }

    catch (error) {

        console.error(
            "Login error:",
            error
        );


        alert(

            "❌ " +
            error.message

        );

    }

    finally {

        resetLoginButton();

    }

}


/* ===========================================
   NORMALIZE ROLE
=========================================== */

function normalizeRole(role) {

    return String(role || "")

        .toLowerCase()

        .replace(/\s+/g, "");

}


/* ===========================================
   REDIRECT USER
=========================================== */

function redirectUser(role) {

    switch (role) {

        case "rider":

            window.location.href =
                "../pages/rider/rider.html";

            break;


        case "driver":

            window.location.href =
                "../pages/driver/driver.html";

            break;


        case "admin":

            window.location.href =
                "../pages/admin/admin.html";

            break;


        case "superadmin":

            window.location.href =
                "../pages/superadmin/superadmin.html";

            break;


        default:

            alert(
                "⚠️ Dashboard not configured for this role."
            );

    }

}


/* ===========================================
   RESET LOGIN BUTTON
=========================================== */

function resetLoginButton() {

    if (!loginButton) {

        return;

    }


    loginButton.disabled = false;

    loginButton.textContent =
        "Login";

}


/* ===========================================
   ENTER KEY SUPPORT
=========================================== */

document.addEventListener(

    "keydown",

    function (event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            loginSystem();

        }

    }

);


/* ===========================================
   PASSWORD SHOW / HIDE
=========================================== */

const passwordField =
    document.querySelector(
        "input[type='password']"
    );


if (passwordField) {

    passwordField.addEventListener(

        "dblclick",

        function () {

            if (
                passwordField.type ===
                "password"
            ) {

                passwordField.type =
                    "text";

            }

            else {

                passwordField.type =
                    "password";

            }

        }

    );

}


/* ===========================================
   SAVE SESSION
=========================================== */

function saveSession(user) {

    const userSession = {

        id:
            user.id,

        name:
            user.name,

        email:
            user.email,

        phone:
            user.phone,

        role:
            user.role,

        loginTime:
            new Date().toISOString()

    };


    localStorage.setItem(

        "rideShareUser",

        JSON.stringify(
            userSession
        )

    );

}


/* ===========================================
   CREATE PROFILE
=========================================== */

function createProfile(user) {

    const profile = {

        id:
            user.id,

        name:
            user.name,

        email:
            user.email,

        phone:
            user.phone,

        role:
            user.role,

        status:
            "Active"

    };


    localStorage.setItem(

        "profile",

        JSON.stringify(
            profile
        )

    );

}


/* ===========================================
   LOGIN ACTIVITY
=========================================== */

function saveLoginActivity(user) {

    const activity = {

        userId:
            user.id,

        name:
            user.name,

        role:
            user.role,

        time:
            new Date().toLocaleString()

    };


    localStorage.setItem(

        "lastLogin",

        JSON.stringify(
            activity
        )

    );

}


/* ===========================================
   CHECK SESSION
=========================================== */

function checkSession() {

    const session =
        localStorage.getItem(
            "rideShareUser"
        );


    if (session) {

        try {

            const user =
                JSON.parse(session);

            console.log(
                "Active User:",
                user
            );

        }

        catch (error) {

            console.error(
                "Invalid session:",
                error
            );

            localStorage.removeItem(
                "rideShareUser"
            );

        }

    }

}


checkSession();


/* ===========================================
   LOGOUT
=========================================== */

function logout() {

    localStorage.removeItem(
        "rideShareUser"
    );

    localStorage.removeItem(
        "loggedInUser"
    );

    localStorage.removeItem(
        "isLoggedIn"
    );

    localStorage.removeItem(
        "profile"
    );

    localStorage.removeItem(
        "lastLogin"
    );


    alert(
        "Logged out successfully."
    );


    window.location.href =
        "../index.html";

}


/* ===========================================
   CONNECTION TEST
=========================================== */

async function testBackendConnection() {

    try {

        const response =
            await fetch(
                API_URL +
                "/api/test"
            );


        const data =
            await response.json();


        console.log(
            "Backend connection:",
            data
        );

    }

    catch (error) {

        console.error(
            "❌ Backend is not running.",
            error
        );

    }

}


testBackendConnection();


console.log(
    "🚖 Smart RideShare Login System Ready"
);