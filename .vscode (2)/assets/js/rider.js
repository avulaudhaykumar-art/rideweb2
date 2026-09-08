"use strict";

/*
========================================================
 SMART RIDESHARE - RIDER DASHBOARD
 CONNECTED VERSION
========================================================

 RIDER RESPONSIBILITIES
 -------------------------------------------------------
 ✔ Book Ride
 ✔ Pickup / Destination
 ✔ Leaflet Map
 ✔ Geocoding
 ✔ Road Route
 ✔ Distance
 ✔ ETA
 ✔ Track Ride
 ✔ Cancel Ride
 ✔ Display Driver Information
 ✔ Synchronize with driver.js

 DRIVER RESPONSIBILITIES
 -------------------------------------------------------
 ❌ Rider does NOT assign driver
 ❌ Rider does NOT start driver movement
 ❌ Rider does NOT change status to Driver is arriving

 driver.js controls:
 ✔ Driver assignment
 ✔ Driver movement
 ✔ Driver reached pickup
 ✔ Start Ride
 ✔ Complete Ride

========================================================
 RIDE FLOW
========================================================

 Rider clicks Book Ride
          ↓
 Searching Driver
          ↓
 Driver clicks Accept
          ↓
 Driver Assigned
          ↓
 Driver moves
          ↓
 Driver reached pickup
          ↓
 Driver clicks Start Ride
          ↓
 Ride Started
          ↓
 Driver clicks Complete Ride
          ↓
 Completed

========================================================
*/


// ======================================================
// GLOBAL VARIABLES
// ======================================================

let riderMap = null;

let pickupMarker = null;

let destinationMarker = null;

let driverMarker = null;

let routeLine = null;

let pickupCoordinates = null;

let destinationCoordinates = null;

let mapInitialized = false;


// ======================================================
// PAGE LOAD
// ======================================================

window.addEventListener(
    "load",
    function () {

        console.log(
            "🚖 Smart RideShare Rider Dashboard Loaded"
        );

        initializeRiderMap();

        setupRideButtons();

        setupNotifications();

        updateRiderDashboard();

        startRideWatcher();

    }
);


// ======================================================
// INITIALIZE RIDER MAP
// ======================================================

function initializeRiderMap() {

    const mapElement =
        document.getElementById(
            "riderMap"
        );


    if (!mapElement) {

        console.warn(
            "⚠️ riderMap element not found."
        );

        return;

    }


    if (
        typeof L ===
        "undefined"
    ) {

        console.error(
            "❌ Leaflet is not loaded."
        );

        return;

    }


    if (mapInitialized) {

        return;

    }


    mapInitialized = true;


    riderMap =
        L.map(
            "riderMap",
            {

                zoomControl:
                    true,

                attributionControl:
                    true

            }
        );


    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom:
                19,

            attribution:
                "&copy; OpenStreetMap contributors"

        }

    ).addTo(
        riderMap
    );


    riderMap.setView(

        [
            17.3850,
            78.4867
        ],

        12

    );


    L.marker(

        [
            17.3850,
            78.4867
        ]

    )

        .addTo(
            riderMap
        )

        .bindPopup(

            "<b>🚖 Smart RideShare</b><br>" +
            "Hyderabad"

        );


    setTimeout(
        function () {

            riderMap.invalidateSize();

        },
        300
    );


    setTimeout(
        function () {

            riderMap.invalidateSize();

        },
        1000
    );


    /*
    Restore existing ride
    */

    const ride =
        getActiveRide();


    if (ride) {

        setTimeout(
            function () {

                restoreRideOnMap(
                    ride
                );

            },
            500
        );

    }

}


// ======================================================
// GET BOOKING INPUTS
// ======================================================

function getBookingInputs() {

    const tripBoxes =
        document.querySelectorAll(
            ".trip-box"
        );


    if (!tripBoxes.length) {

        return {

            pickup:
                "",

            destination:
                "",

            vehicle:
                "Bike"

        };

    }


    const bookingBox =
        tripBoxes[0];


    const inputs =
        bookingBox.querySelectorAll(
            "input"
        );


    const vehicleSelect =
        bookingBox.querySelector(
            "select"
        );


    return {

        pickup:

            inputs[0]

                ? inputs[0].value.trim()

                : "",


        destination:

            inputs[1]

                ? inputs[1].value.trim()

                : "",


        vehicle:

            vehicleSelect

                ? vehicleSelect.value

                : "Bike"

    };

}


// ======================================================
// SETUP BUTTONS
// ======================================================

function setupRideButtons() {

    const bookButton =
        document.getElementById(
            "bookRide"
        );


    if (bookButton) {

        bookButton.addEventListener(
            "click",
            bookRide
        );

    }


    const trackButton =
        document.getElementById(
            "trackRide"
        );


    if (trackButton) {

        trackButton.addEventListener(
            "click",
            trackRide
        );

    }


    const cancelButton =
        document.getElementById(
            "cancelRide"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            cancelRide
        );

    }

}


// ======================================================
// BOOK RIDE
// ======================================================

async function bookRide() {

    const data =
        getBookingInputs();


    const pickup =
        data.pickup;


    const destination =
        data.destination;


    const vehicle =
        data.vehicle;


    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (
        !pickup ||
        !destination
    ) {

        alert(

            "⚠️ Please enter both Pickup Location and Destination."

        );

        return;

    }


    if (
        pickup.toLowerCase() ===
        destination.toLowerCase()
    ) {

        alert(

            "⚠️ Pickup and destination cannot be the same."

        );

        return;

    }


    // --------------------------------------------------
    // CHECK EXISTING RIDE
    // --------------------------------------------------

    const existingRide =
        getActiveRide();


    if (

        existingRide &&

        existingRide.status !==
            "Completed" &&

        existingRide.status !==
            "Cancelled"

    ) {

        alert(

            "⚠️ You already have an active ride.\n\n" +

            "Ride ID: " +
            existingRide.id

        );

        return;

    }


    // --------------------------------------------------
    // CALCULATE FARE
    // --------------------------------------------------

    const fare =
        calculateFare(
            vehicle
        );


    // --------------------------------------------------
    // CREATE NEW RIDE
    // --------------------------------------------------

    const ride = {

        id:
            "RS" +
            Date.now(),


        rider:
            "Jaswanth",


        pickup:
            pickup,


        destination:
            destination,


        vehicle:
            vehicle,


        fare:
            fare,


        /*
        IMPORTANT:
        Driver information starts EMPTY.

        driver.js will fill these values
        only after driver clicks Accept.
        */

        driver:
            "",


        driverVehicle:
            "",


        driverNumber:
            "",


        /*
        IMPORTANT:
        Initial status MUST be Searching Driver.
        */

        status:
            "Searching Driver",


        eta:
            "Searching...",


        distance:
            "-- km",


        pickupCoordinates:
            null,


        destinationCoordinates:
            null,


        createdAt:
            new Date().toLocaleString()

    };


    // --------------------------------------------------
    // SAVE RIDE
    // --------------------------------------------------

    saveActiveRide(
        ride
    );


    updateRiderDashboard();


    alert(

        "🚖 RIDE BOOKED SUCCESSFULLY!\n\n" +

        "Ride ID: " +
        ride.id +

        "\nPickup: " +
        pickup +

        "\nDestination: " +
        destination +

        "\nVehicle: " +
        vehicle +

        "\nEstimated Fare: ₹" +
        fare +

        "\n\n🔎 Searching for nearby driver..."

    );


    // --------------------------------------------------
    // FIND LOCATIONS
    // --------------------------------------------------

    await geocodeRideLocations(
        ride
    );

}


// ======================================================
// GEOCODE LOCATION
// ======================================================

async function geocodeLocation(
    location
) {

    if (!location) {

        return null;

    }


    try {

        const url =

            "https://nominatim.openstreetmap.org/search" +

            "?format=json" +

            "&limit=1" +

            "&countrycodes=in" +

            "&q=" +

            encodeURIComponent(
                location +
                ", India"
            );


        const response =
            await fetch(
                url,
                {

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }
            );


        if (!response.ok) {

            throw new Error(
                "Geocoding service unavailable"
            );

        }


        const results =
            await response.json();


        if (
            !results ||
            results.length === 0
        ) {

            return null;

        }


        return {

            lat:
                parseFloat(
                    results[0].lat
                ),


            lon:
                parseFloat(
                    results[0].lon
                ),


            display:
                results[0].display_name

        };

    }

    catch (error) {

        console.error(
            "Geocoding error:",
            error
        );

        return null;

    }

}


// ======================================================
// GEOCODE PICKUP + DESTINATION
// ======================================================

async function geocodeRideLocations(
    ride
) {

    if (!ride) {

        return;

    }


    updateMapStatus(
        "🔎 Finding locations..."
    );


    const pickup =
        await geocodeLocation(
            ride.pickup
        );


    const destination =
        await geocodeLocation(
            ride.destination
        );


    if (
        !pickup ||
        !destination
    ) {

        updateMapStatus(
            "Location could not be found"
        );


        alert(

            "⚠️ I could not locate one or both locations.\n\n" +

            "Try using a more specific location.\n\n" +

            "Example:\n" +

            "LB Nagar, Hyderabad\n" +

            "Hitech City, Hyderabad"

        );

        return;

    }


    pickupCoordinates = [

        pickup.lat,
        pickup.lon

    ];


    destinationCoordinates = [

        destination.lat,
        destination.lon

    ];


    ride.pickupCoordinates =
        pickupCoordinates;


    ride.destinationCoordinates =
        destinationCoordinates;


    saveActiveRide(
        ride
    );


    updateMapInformation(
        ride
    );


    await drawRoute(

        pickupCoordinates,

        destinationCoordinates,

        ride

    );


    /*
    IMPORTANT:
    NO DRIVER MOVEMENT HERE.

    Rider only creates the ride.
    driver.js controls the driver.
    */

}


// ======================================================
// DRAW ROAD ROUTE
// ======================================================

async function drawRoute(
    pickup,
    destination,
    ride
) {

    if (!riderMap) {

        return;

    }


    removeMapObjects();


    // --------------------------------------------------
    // PICKUP MARKER
    // --------------------------------------------------

    pickupMarker =
        L.marker(
            pickup
        )

            .addTo(
                riderMap
            )

            .bindPopup(

                "<b>📍 Pickup</b><br>" +

                escapeHTML(
                    ride.pickup
                )

            );


    // --------------------------------------------------
    // DESTINATION MARKER
    // --------------------------------------------------

    destinationMarker =
        L.marker(
            destination
        )

            .addTo(
                riderMap
            )

            .bindPopup(

                "<b>🎯 Destination</b><br>" +

                escapeHTML(
                    ride.destination
                )

            );


    try {

        const routeURL =

            "https://router.project-osrm.org/route/v1/driving/" +

            pickup[1] +
            "," +
            pickup[0] +

            ";" +

            destination[1] +
            "," +
            destination[0] +

            "?overview=full&geometries=geojson";


        const response =
            await fetch(
                routeURL
            );


        if (!response.ok) {

            throw new Error(
                "Routing service unavailable"
            );

        }


        const data =
            await response.json();


        if (
            !data.routes ||
            !data.routes.length
        ) {

            throw new Error(
                "No route available"
            );

        }


        const route =
            data.routes[0];


        // --------------------------------------------------
        // DISTANCE
        // --------------------------------------------------

        const routeDistance =
            route.distance /
            1000;


        ride.distance =
            routeDistance.toFixed(1) +
            " km";


        // --------------------------------------------------
        // ETA
        // --------------------------------------------------

        const minutes =
            Math.max(

                1,

                Math.ceil(

                    route.duration /
                    60

                )

            );


        /*
        Only show route ETA while searching.

        After driver accepts, driver.js
        controls ETA.
        */

        if (
            ride.status ===
            "Searching Driver"
        ) {

            ride.eta =
                "Searching Driver";

        }


        // --------------------------------------------------
        // DRAW ROUTE
        // --------------------------------------------------

        routeLine =
            L.geoJSON(

                route.geometry,

                {

                    style: {

                        weight:
                            6,

                        opacity:
                            0.85

                    }

                }

            )

                .addTo(
                    riderMap
                );


        riderMap.fitBounds(

            routeLine.getBounds(),

            {

                padding:
                    [60, 60]

            }

        );


        saveActiveRide(
            ride
        );


        updateMapInformation(
            ride
        );


        updateCurrentRideText(
            ride
        );


        updateMapStatus(
            "🛣️ Route ready"

        );

    }

    catch (error) {

        console.warn(

            "OSRM route failed:",

            error

        );


        // --------------------------------------------------
        // FALLBACK ROUTE
        // --------------------------------------------------

        routeLine =
            L.polyline(

                [
                    pickup,
                    destination
                ],

                {

                    weight:
                        5,

                    dashArray:
                        "10,10"

                }

            )

                .addTo(
                    riderMap
                );


        riderMap.fitBounds(

            routeLine.getBounds(),

            {

                padding:
                    [60, 60]

            }

        );


        const distance =
            calculateDistance(

                pickup[0],
                pickup[1],

                destination[0],
                destination[1]

            );


        ride.distance =
            distance.toFixed(1) +
            " km";


        if (
            ride.status ===
            "Searching Driver"
        ) {

            ride.eta =
                "Searching Driver";

        }


        saveActiveRide(
            ride
        );


        updateMapInformation(
            ride
        );


        updateCurrentRideText(
            ride
        );


        updateMapStatus(
            "📍 Approximate route"

        );

    }

}


// ======================================================
// RESTORE RIDE ON MAP
// ======================================================

function restoreRideOnMap(
    ride
) {

    if (!ride) {

        return;

    }


    updateMapInformation(
        ride
    );


    updateCurrentRideText(
        ride
    );


    if (
        ride.pickupCoordinates &&
        ride.destinationCoordinates
    ) {

        pickupCoordinates =
            ride.pickupCoordinates;


        destinationCoordinates =
            ride.destinationCoordinates;


        drawRoute(

            pickupCoordinates,

            destinationCoordinates,

            ride

        );

    }


    /*
    Show driver marker only if driver.js
    has actually assigned a driver.
    */

    if (
        ride.driver &&
        ride.driverLocation
    ) {

        showDriverMarker(
            ride
        );

    }

}


// ======================================================
// SHOW DRIVER MARKER
// ======================================================

function showDriverMarker(
    ride
) {

    if (
        !riderMap ||
        !ride ||
        !ride.driverLocation
    ) {

        return;

    }


    const location =
        ride.driverLocation;


    if (driverMarker) {

        driverMarker.setLatLng(
            location
        );

        return;

    }


    driverMarker =
        L.marker(
            location
        )

            .addTo(
                riderMap
            )

            .bindPopup(

                "<b>🚗 " +

                escapeHTML(
                    ride.driver ||
                    "Driver"
                ) +

                "</b><br>" +

                escapeHTML(
                    ride.status ||
                    "Driver"
                )

            );

}


// ======================================================
// UPDATE RIDER DASHBOARD
// ======================================================

function updateRiderDashboard() {

    const ride =
        getActiveRide();


    if (!ride) {

        updateMapInformation(
            null
        );

        updateCurrentRideText(
            null
        );

        return;

    }


    updateMapInformation(
        ride
    );


    updateCurrentRideText(
        ride
    );


    /*
    Restore driver marker if driver.js
    has provided a location.
    */

    if (
        ride.driver &&
        ride.driverLocation
    ) {

        showDriverMarker(
            ride
        );

    }


    /*
    If ride is completed/cancelled,
    remove driver marker.
    */

    if (
        ride.status ===
            "Completed" ||

        ride.status ===
            "Cancelled" ||

        ride.status ===
            "Stopped by Driver"
    ) {

        removeDriverMarker();

    }

}


// ======================================================
// UPDATE CURRENT RIDE
// ======================================================

function updateCurrentRideText(
    ride
) {

    const tripBoxes =
        document.querySelectorAll(
            ".trip-box"
        );


    if (!tripBoxes.length) {

        return;

    }


    /*
    Second trip-box = Current Ride
    */

    if (
        tripBoxes.length < 2
    ) {

        return;

    }


    const currentRideBox =
        tripBoxes[1];


    const paragraphs =
        currentRideBox.querySelectorAll(
            "p"
        );


    if (
        paragraphs.length < 5
    ) {

        return;

    }


    if (!ride) {

        paragraphs[0].innerHTML =
            "<b>Driver :</b> Searching Driver...";


        paragraphs[1].innerHTML =
            "<b>Vehicle :</b> Waiting for driver";


        paragraphs[2].innerHTML =
            "<b>Vehicle Number :</b> Not assigned";


        paragraphs[3].innerHTML =
            "<b>ETA :</b> --";


        paragraphs[4].innerHTML =
            "<b>Status :</b> No active ride";


        return;

    }


    paragraphs[0].innerHTML =

        "<b>Driver :</b> " +

        escapeHTML(

            ride.driver ||

            "Searching Driver..."

        );


    paragraphs[1].innerHTML =

        "<b>Vehicle :</b> " +

        escapeHTML(

            ride.driverVehicle ||

            "Waiting for driver"

        );


    paragraphs[2].innerHTML =

        "<b>Vehicle Number :</b> " +

        escapeHTML(

            ride.driverNumber ||

            "Not assigned"

        );


    paragraphs[3].innerHTML =

        "<b>ETA :</b> " +

        escapeHTML(

            ride.eta ||

            "--"

        );


    paragraphs[4].innerHTML =

        "<b>Status :</b> " +

        escapeHTML(

            ride.status ||

            "Waiting"

        );

}


// ======================================================
// UPDATE MAP INFORMATION
// ======================================================

function updateMapInformation(
    ride
) {

    const pickup =
        document.getElementById(
            "mapPickup"
        );


    const destination =
        document.getElementById(
            "mapDestination"
        );


    const distance =
        document.getElementById(
            "mapDistance"
        );


    const driver =
        document.getElementById(
            "mapDriver"
        );


    const status =
        document.getElementById(
            "mapStatus"
        );


    if (!ride) {

        if (pickup)
            pickup.textContent =
                "Not selected";


        if (destination)
            destination.textContent =
                "Not selected";


        if (distance)
            distance.textContent =
                "-- km";


        if (driver)
            driver.textContent =
                "Searching...";


        if (status)
            status.textContent =
                "Waiting for ride";


        return;

    }


    if (pickup)
        pickup.textContent =
            ride.pickup ||
            "Not selected";


    if (destination)
        destination.textContent =
            ride.destination ||
            "Not selected";


    if (distance)
        distance.textContent =
            ride.distance ||
            "-- km";


    if (driver)
        driver.textContent =

            ride.driver ||

            "Searching Driver...";


    if (status)
        status.textContent =

            ride.status ||

            "Waiting";

}


// ======================================================
// MAP STATUS
// ======================================================

function updateMapStatus(
    message
) {

    const status =
        document.getElementById(
            "mapStatus"
        );


    if (status) {

        status.textContent =
            message;

    }

}


// ======================================================
// TRACK RIDE
// ======================================================

function trackRide() {

    const ride =
        getActiveRide();


    if (!ride) {

        alert(
            "⚠️ No active ride found."
        );

        return;

    }


    const mapSection =
        document.querySelector(
            ".ride-map-section"
        );


    if (mapSection) {

        mapSection.scrollIntoView(

            {

                behavior:
                    "smooth",

                block:
                    "center"

            }

        );

    }


    setTimeout(

        function () {

            if (riderMap) {

                riderMap.invalidateSize();

            }

        },

        500

    );


    if (
        ride.pickupCoordinates &&
        ride.destinationCoordinates
    ) {

        pickupCoordinates =
            ride.pickupCoordinates;


        destinationCoordinates =
            ride.destinationCoordinates;


        drawRoute(

            pickupCoordinates,

            destinationCoordinates,

            ride

        );

    }


    if (
        ride.driver &&
        ride.driverLocation
    ) {

        showDriverMarker(
            ride
        );

    }


    alert(

        "📍 LIVE RIDE TRACKING\n\n" +

        "Ride ID: " +
        ride.id +

        "\n\nDriver: " +

        (
            ride.driver ||
            "Searching..."
        ) +

        "\nVehicle: " +

        (
            ride.driverVehicle ||
            "Not assigned"
        ) +

        "\nVehicle Number: " +

        (
            ride.driverNumber ||
            "Not assigned"
        ) +

        "\nDistance: " +

        (
            ride.distance ||
            "-- km"
        ) +

        "\nETA: " +

        (
            ride.eta ||
            "--"
        ) +

        "\nStatus: " +

        (
            ride.status ||
            "Waiting"
        )

    );

}


// ======================================================
// CANCEL RIDE
// ======================================================

function cancelRide() {

    const ride =
        getActiveRide();


    if (!ride) {

        alert(
            "⚠️ No active ride found."
        );

        return;

    }


    if (
        ride.status ===
            "Completed" ||

        ride.status ===
            "Cancelled"
    ) {

        alert(

            "This ride is already " +

            ride.status.toLowerCase() +

            "."

        );

        return;

    }


    const confirmation =
        confirm(

            "Cancel Ride " +
            ride.id +
            "?"

        );


    if (!confirmation) {

        return;

    }


    ride.status =
        "Cancelled";


    ride.eta =
        "Cancelled";


    saveActiveRide(
        ride
    );


    removeDriverMarker();


    updateRiderDashboard();


    updateMapStatus(
        "❌ Ride cancelled"
    );


    alert(
        "Ride cancelled successfully."
    );

}


// ======================================================
// FARE CALCULATOR
// ======================================================

function calculateFare(
    vehicle
) {

    switch (vehicle) {

        case "Bike":

            return 95;


        case "Auto":

            return 180;


        case "Mini":

            return 260;


        case "Sedan":

            return 420;


        case "SUV":

            return 520;


        default:

            return 200;

    }

}


// ======================================================
// LOCAL STORAGE - GET
// ======================================================

function getActiveRide() {

    try {

        const ride =
            localStorage.getItem(
                "activeRide"
            );


        if (!ride) {

            return null;

        }


        return JSON.parse(
            ride
        );

    }

    catch (error) {

        console.error(

            "❌ Active ride data error:",

            error

        );

        return null;

    }

}


// ======================================================
// LOCAL STORAGE - SAVE
// ======================================================

function saveActiveRide(
    ride
) {

    if (!ride) {

        return;

    }


    localStorage.setItem(

        "activeRide",

        JSON.stringify(
            ride
        )

    );

}


// ======================================================
// NOTIFICATIONS
// ======================================================

function setupNotifications() {

    const notifications =
        document.querySelectorAll(
            ".notification"
        );


    notifications.forEach(

        function (
            notification
        ) {

            notification.style.cursor =
                "pointer";


            notification.addEventListener(

                "click",

                function () {

                    alert(

                        "🔔 Notification\n\n" +

                        this.innerText

                    );

                }

            );

        }

    );

}


// ======================================================
// PROFILE
// ======================================================

function openProfile() {

    alert(

        "👤 RIDER PROFILE\n\n" +

        "Name: Jaswanth\n" +

        "Email: jaswanth@email.com\n" +

        "Phone: +91 98765 43210\n" +

        "Membership: Premium Rider\n" +

        "Completed Trips: 12"

    );

}


// ======================================================
// DISTANCE CALCULATOR
// ======================================================

function calculateDistance(

    lat1,
    lon1,
    lat2,
    lon2

) {

    const R =
        6371;


    const dLat =
        toRadians(

            lat2 -
            lat1

        );


    const dLon =
        toRadians(

            lon2 -
            lon1

        );


    const a =

        Math.sin(
            dLat / 2
        ) *

        Math.sin(
            dLat / 2
        ) +

        Math.cos(

            toRadians(
                lat1
            )

        ) *

        Math.cos(

            toRadians(
                lat2
            )

        ) *

        Math.sin(
            dLon / 2
        ) *

        Math.sin(
            dLon / 2
        );


    const c =

        2 *

        Math.atan2(

            Math.sqrt(a),

            Math.sqrt(
                1 - a
            )

        );


    return R * c;

}


// ======================================================
// RADIANS
// ======================================================

function toRadians(
    value
) {

    return (

        value *
        Math.PI /
        180

    );

}


// ======================================================
// REMOVE DRIVER MARKER
// ======================================================

function removeDriverMarker() {

    if (
        driverMarker &&
        riderMap
    ) {

        riderMap.removeLayer(
            driverMarker
        );

    }


    driverMarker =
        null;

}


// ======================================================
// REMOVE MAP OBJECTS
// ======================================================

function removeMapObjects() {

    if (!riderMap) {

        return;

    }


    if (pickupMarker) {

        riderMap.removeLayer(
            pickupMarker
        );

        pickupMarker =
            null;

    }


    if (destinationMarker) {

        riderMap.removeLayer(
            destinationMarker
        );

        destinationMarker =
            null;

    }


    if (routeLine) {

        riderMap.removeLayer(
            routeLine
        );

        routeLine =
            null;

    }

}


// ======================================================
// HTML ESCAPE
// ======================================================

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================================
// RIDE WATCHER
// ======================================================

function startRideWatcher() {

    let lastRide =
        localStorage.getItem(
            "activeRide"
        );


    setInterval(

        function () {

            const currentRide =
                localStorage.getItem(
                    "activeRide"
                );


            /*
            Only update when another page
            changes activeRide.
            */

            if (
                currentRide !==
                lastRide
            ) {

                lastRide =
                    currentRide;


                const ride =
                    getActiveRide();


                updateRiderDashboard();


                if (ride) {

                    updateMapFromRide(
                        ride
                    );

                }

            }

        },

        1000

    );

}


// ======================================================
// STORAGE EVENT
// ======================================================

window.addEventListener(

    "storage",

    function (event) {

        if (
            event.key ===
            "activeRide"
        ) {

            const ride =
                getActiveRide();


            updateRiderDashboard();


            if (ride) {

                updateMapFromRide(
                    ride
                );

            }

        }

    }

);


// ======================================================
// UPDATE MAP FROM RIDE
// ======================================================

function updateMapFromRide(
    ride
) {

    if (!ride) {

        return;

    }


    updateMapInformation(
        ride
    );


    updateCurrentRideText(
        ride
    );


    /*
    Driver location comes ONLY from driver.js.
    */

    if (
        ride.driver &&
        ride.driverLocation
    ) {

        showDriverMarker(
            ride
        );

    }


    /*
    Remove marker when ride is finished.
    */

    if (
        ride.status ===
            "Completed" ||

        ride.status ===
            "Cancelled"
    ) {

        removeDriverMarker();

    }

}


// ======================================================
// HTML MAP RESTORE
// ======================================================

function restoreMapAfterDriverUpdate(
    ride
) {

    if (!ride) {

        return;

    }


    if (
        ride.pickupCoordinates &&
        ride.destinationCoordinates
    ) {

        pickupCoordinates =
            ride.pickupCoordinates;


        destinationCoordinates =
            ride.destinationCoordinates;


        drawRoute(

            pickupCoordinates,

            destinationCoordinates,

            ride

        );

    }


    if (
        ride.driver &&
        ride.driverLocation
    ) {

        showDriverMarker(
            ride
        );

    }

}


// ======================================================
// FINAL CONSOLE MESSAGE
// ======================================================

console.log(`

========================================
 SMART RIDESHARE RIDER SYSTEM
========================================

✔ Ride Booking
✔ Searching Driver
✔ LocalStorage Connection
✔ Leaflet Map
✔ OpenStreetMap
✔ Pickup Location
✔ Destination Location
✔ Pickup Marker
✔ Destination Marker
✔ Road Route
✔ Distance
✔ Track Ride
✔ Cancel Ride
✔ Driver Information Sync
✔ Driver Location Sync
✔ Driver Status Sync

IMPORTANT:

Rider DOES NOT assign the driver.

driver.js controls:

✔ Accept Ride
✔ Driver Assigned
✔ Driver Movement
✔ Driver Reached Pickup
✔ Start Ride
✔ Ride Started
✔ Complete Ride
✔ Completed

========================================

`);
