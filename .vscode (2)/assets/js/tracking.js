/* ==========================================================
   RIDEX TRACKING PAGE
========================================================== */

const eta = document.getElementById("eta");
const callDriver = document.getElementById("callDriver");
const chatDriver = document.getElementById("chatDriver");
const cancelRide = document.getElementById("cancelRide");

/* ==========================================
   ETA COUNTDOWN
========================================== */

let minutes = 18;

const timer = setInterval(() => {

    if (minutes > 0) {

        minutes--;

        eta.innerHTML =
        `<i class="fas fa-clock"></i> ETA : ${minutes} Minutes`;

    } else {

        clearInterval(timer);

        eta.innerHTML =
        `<i class="fas fa-check-circle"></i> Driver Arrived`;

        toast("🚖 Your driver has arrived.");

    }

}, 6000);

/* ==========================================
   CALL DRIVER
========================================== */

callDriver.addEventListener("click", () => {

    alert(
`Calling Driver...

Rahul Sharma

Phone : +91 98765 43210`
    );

});

/* ==========================================
   CHAT DRIVER
========================================== */

chatDriver.addEventListener("click", () => {

    const message = prompt(
        "Send a message to the driver:"
    );

    if (message) {

        toast("Message sent successfully.");

    }

});

/* ==========================================
   CANCEL RIDE
========================================== */

cancelRide.addEventListener("click", () => {

    const confirmRide = confirm(
        "Do you really want to cancel this ride?"
    );

    if (confirmRide) {

        toast("Ride cancelled.");

        setTimeout(() => {

            window.location.href = "booking.html";

        }, 1500);

    }

});

/* ==========================================
   TOAST MESSAGE
========================================== */

function toast(message) {

    const box = document.createElement("div");

    box.innerHTML = message;

    box.style.position = "fixed";
    box.style.top = "20px";
    box.style.right = "20px";
    box.style.background = "#2563eb";
    box.style.color = "white";
    box.style.padding = "15px 25px";
    box.style.borderRadius = "10px";
    box.style.fontWeight = "600";
    box.style.zIndex = "9999";
    box.style.boxShadow = "0 10px 20px rgba(0,0,0,.2)";

    document.body.appendChild(box);

    setTimeout(() => {

        box.remove();

    }, 3000);

}

/* ==========================================
   DRIVER STATUS
========================================== */

const status = [

    "Driver accepted your ride.",
    "Driver is on the way.",
    "Driver is 2 km away.",
    "Driver reached pickup point.",
    "Ride started.",
    "Ride is in progress."

];

let index = 0;

setInterval(() => {

    if (index < status.length) {

        toast(status[index]);

        index++;

    }

}, 10000);

/* ==========================================
   PAGE LOADED
========================================== */

window.onload = () => {

    console.log("RideX Tracking Page Loaded");

    toast("Live Tracking Started 🚖");

};
