/* ===========================================================
   RIDEX BOOKING PAGE
=========================================================== */

const vehicle = document.getElementById("vehicle");
const fare = document.getElementById("fare");
const confirmRide = document.getElementById("confirmRide");

/* ==========================================
   VEHICLE PRICE
========================================== */

const prices = {
    Bike: 80,
    Auto: 150,
    Mini: 220,
    Sedan: 320,
    SUV: 500
};

/* ==========================================
   UPDATE FARE
========================================== */

function updateFare() {
    const selected = vehicle.value;
    fare.innerHTML = "₹" + prices[selected];
}

vehicle.addEventListener("change", updateFare);
updateFare();

/* ==========================================
   CONFIRM BOOKING
========================================== */

confirmRide.addEventListener("click", function () {
    const pickup = document.querySelectorAll("input")[0].value;
    const destination = document.querySelectorAll("input")[1].value;

    if (pickup === "" || destination === "") {
        alert("Please enter Pickup and Destination");
        return;
    }

    alert(
`Ride Confirmed!

Pickup : ${pickup}
Destination : ${destination}
Vehicle : ${vehicle.value}
Estimated Fare : ₹${prices[vehicle.value]}

Driver will be assigned shortly.`
    );
});

/* ==========================================
   PROMO CODE
========================================== */

const promo = document.querySelectorAll("input")[4];

promo.addEventListener("keyup", function () {
    if (this.value.toUpperCase() == "RIDEX50") {
        const discount = Math.round(prices[vehicle.value] * 0.5);
        fare.innerHTML = "₹" + discount;
    } else {
        updateFare();
    }
});

/* ==========================================
   PAGE LOADED
========================================== */

window.onload = function () {
    console.log("RideX Booking Page Loaded");
};

/* ==========================================
   FAKE DRIVER SEARCH
========================================== */

confirmRide.addEventListener("click", () => {
    setTimeout(() => {
        alert("Searching Nearby Drivers...");
    }, 1000);

    setTimeout(() => {
        alert("Driver Found 🚖");
    }, 3000);
});

/* ==========================================
   ESTIMATED TIME
========================================== */

const eta = document.querySelector(".ride-info div:nth-child(3)");

vehicle.addEventListener("change", () => {
    switch (vehicle.value) {
        case "Bike":
            eta.innerHTML = '<i class="fas fa-clock"></i> ETA : 12 Minutes';
            break;
        case "Auto":
            eta.innerHTML = '<i class="fas fa-clock"></i> ETA : 15 Minutes';
            break;
        case "Mini":
            eta.innerHTML = '<i class="fas fa-clock"></i> ETA : 18 Minutes';
            break;
        case "Sedan":
            eta.innerHTML = '<i class="fas fa-clock"></i> ETA : 20 Minutes';
            break;
        case "SUV":
            eta.innerHTML = '<i class="fas fa-clock"></i> ETA : 25 Minutes';
            break;
    }
});

/* ==========================================
   SUCCESS MESSAGE
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
    box.style.zIndex = "9999";

    document.body.appendChild(box);

    setTimeout(() => {
        box.remove();
    }, 3000);
}

toast("Welcome to RideX 🚖");
