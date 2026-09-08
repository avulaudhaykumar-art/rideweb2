// =========================================
// RIDEX SMART RIDE SHARING - MAIN SCRIPT
// =========================================

"use strict";

// =========================================
// PAGE LOADER
// =========================================
window.addEventListener("load", function () {
    const loader = document.getElementById("loader");
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = "0";
            loader.style.transition = "opacity 0.5s ease";
            setTimeout(() => {
                loader.style.display = "none";
            }, 500);
        }, 700);
    }

    console.log("🚖 RideX Website Loaded Successfully");
});

// =========================================
// ROLE NAVIGATION
// =========================================
function openAdmin() {
    window.location.href = "admin/dashboard.html";
}

function openRider() {
    window.location.href = "rider/dashboard.html";
}

function openDriver() {
    window.location.href = "driver/dashboard.html";
}

function openTracking() {
    window.location.href = "tracking.html";
}

function openDriverRegister() {
    window.location.href = "pages/register.html";
}

// =========================================
// LOGIN BUTTON
// =========================================
const loginButton = document.querySelector(".login-btn");

if (loginButton) {
    loginButton.addEventListener("click", function () {
        const username = document.getElementById("username");
        const password = document.getElementById("password");

        if (!username || !password) return;

        const user = username.value.trim();
        const pass = password.value.trim();

        if (user === "" || pass === "") {
            alert("Please enter username and password.");
            return;
        }

        alert("✅ Login successful!\n\nWelcome to RideX.");
    });
}

// Enter key support
function triggerLoginOnEnter(inputElement) {
    if (!inputElement) return;
    inputElement.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && loginButton) {
            loginButton.click();
        }
    });
}

triggerLoginOnEnter(document.getElementById("username"));
triggerLoginOnEnter(document.getElementById("password"));

// =========================================
// TRACK RIDE BUTTON
// =========================================
const trackButton = document.querySelector(".trackBtn");
if (trackButton) {
    trackButton.addEventListener("click", function () {
        alert(
            "📍 Live Ride Tracking\n\n" +
            "Your driver is currently 2.4 km away.\n" +
            "Estimated arrival: 7 minutes."
        );
    });
}

// =========================================
// BECOME A DRIVER
// =========================================
const driverButton = document.querySelector(".driverBtn");
if (driverButton) {
    driverButton.addEventListener("click", function () {
        openDriverRegister();
    });
}

// =========================================
// DOWNLOAD APP BUTTONS
// =========================================
document.querySelectorAll(".download-left button").forEach(function (button) {
    button.addEventListener("click", function () {
        alert(
            "📱 RideX App\n\n" +
            "The mobile application will be available soon."
        );
    });
});

// =========================================
// CONTACT FORM
// =========================================
const contactForm = document.querySelector(".contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = contactForm.querySelector('input[type="text"]');
        const email = contactForm.querySelector('input[type="email"]');
        const message = contactForm.querySelector("textarea");

        if (!name || !email || !message) return;

        if (
            name.value.trim() === "" ||
            email.value.trim() === "" ||
            message.value.trim() === ""
        ) {
            alert("Please fill all contact form fields.");
            return;
        }

        alert(
            "✅ Message sent successfully!\n\n" +
            "Thank you, " + name.value.trim() + ". Our support team will contact you soon."
        );

        contactForm.reset();
    });
}

// =========================================
// NEWSLETTER SUBSCRIPTION
// =========================================
function subscribeNewsletter() {
    const newsletterEmail = document.getElementById("newsletterEmail");
    if (!newsletterEmail) return;

    const email = newsletterEmail.value.trim();

    if (email === "") {
        alert("Please enter your email address.");
        return;
    }

    if (!email.includes("@")) {
        alert("Please enter a valid email address.");
        return;
    }

    alert("🎉 Successfully subscribed! You will receive RideX updates.");
    newsletterEmail.value = "";
}

// =========================================
// SCROLL TO TOP
// =========================================
const scrollTopButton = document.getElementById("scrollTop");

if (scrollTopButton) {
    window.addEventListener("scroll", function () {
        if (window.scrollY > 400) {
            scrollTopButton.style.display = "flex";
            scrollTopButton.style.alignItems = "center";
            scrollTopButton.style.justifyContent = "center";
        } else {
            scrollTopButton.style.display = "none";
        }
    });

    scrollTopButton.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

// =========================================
// FAQ INTERACTION
// =========================================
document.querySelectorAll(".faq-box").forEach(function (box) {
    const paragraph = box.querySelector("p");
    if (!paragraph) return;

    paragraph.style.display = "none";
    box.style.cursor = "pointer";

    box.addEventListener("click", function () {
        paragraph.style.display =
            paragraph.style.display === "none" ? "block" : "none";
    });
});

// =========================================
// FARE ESTIMATOR DEMO
// =========================================
function calculateFare(distanceKm) {
    const baseFare = 25;
    const perKm = 20;
    return Math.round(baseFare + distanceKm * perKm);
}

const fareCards = document.querySelectorAll(".fare-card");

if (fareCards.length >= 3) {
    const distanceElement = fareCards[0].querySelector("h1");
    const timeElement = fareCards[1].querySelector("h1");
    const fareElement = fareCards[2].querySelector("h1");

    const fareDistance = 12;

    if (distanceElement) distanceElement.innerText = fareDistance + " km";
    if (timeElement) timeElement.innerText = Math.max(5, Math.round(fareDistance * 2)) + " Min";
    if (fareElement) fareElement.innerText = "₹" + calculateFare(fareDistance);
}

// =========================================
// SMOOTH ANCHOR SCROLL
// =========================================
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
        const targetId = this.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const target = document.querySelector(targetId);
        if (target) {
            event.preventDefault();
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});

// =========================================
// RIDE BOOKING DEMO
// =========================================
function bookRide() {
    const pickup = prompt("📍 Enter pickup location:");
    if (!pickup) return;

    const destination = prompt("📍 Enter destination:");
    if (!destination) return;

    alert(
        "🚖 Ride Request Created!\n\n" +
        "Pickup: " + pickup + "\n" +
        "Destination: " + destination + "\n\n" +
        "Searching for nearby drivers..."
    );

    setTimeout(function () {
        alert(
            "✅ Driver Found!\n\n" +
            "Driver: Rahul Sharma\n" +
            "Vehicle: Swift Dzire\n" +
            "Rating: 4.9 ⭐\n" +
            "Arrival: 5 minutes"
        );
    }, 1500);
}

document.querySelectorAll(".bookRide, #bookRide, .bookingBtn").forEach(function (button) {
    button.addEventListener("click", bookRide);
});

// =========================================
// LOCAL STORAGE DEMO
// =========================================
let visits = Number(localStorage.getItem("ridexVisits")) || 0;
visits++;
localStorage.setItem("ridexVisits", visits.toString());

console.log("RideX Website Visits:", visits);

// =========================================
// EXTRA HELPERS
// =========================================
function sendMessage(event) {
    if (event) event.preventDefault();

    alert("Thank you! Your message has been sent successfully. 📩");
}

function emergencySOS() {
    const confirmation = confirm(
        "🚨 EMERGENCY SOS\n\nDo you want to send an emergency alert?"
    );

    if (confirmation) {
        alert(
            "🚨 Emergency alert sent!\n\n" +
            "Your current location has been shared with the emergency support team."
        );
    }
}

// =========================================
// SYSTEM READY LOG
// =========================================
console.log(`
========================================

        🚖 RIDEX SYSTEM READY 🚖

========================================

✓ Homepage Loaded
✓ Login System
✓ Admin Access
✓ Rider Access
✓ Driver Access
✓ Fare Estimator
✓ Live Tracking Demo
✓ Contact Form
✓ Newsletter
✓ Scroll To Top
✓ Ride Booking Demo
✓ Local Storage
✓ Emergency Support

========================================
`);