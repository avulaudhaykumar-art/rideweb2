"use strict";

/*
===========================================================
 SMART RIDESHARE - DRIVER DASHBOARD
 CONNECTED VERSION
===========================================================

 FLOW:

 RIDER
   ↓
 Book Ride
   ↓
 localStorage.activeRide
   ↓
 DRIVER DASHBOARD
   ↓
 Searching Driver
   ↓
 ACCEPT RIDE
   ↓
 Driver Assigned
   ↓
 Driver goes to Pickup
   ↓
 Driver reached Pickup
   ↓
 START RIDE
   ↓
 Ride Started
   ↓
 COMPLETE RIDE
   ↓
 Completed
   ↓
 RIDER DASHBOARD UPDATED

===========================================================
*/


/* ========================================================
   DRIVER INFORMATION
======================================================== */

const DRIVER_NAME = "Rahul Sharma";

const DRIVER_VEHICLE = "Swift Dzire";

const DRIVER_NUMBER = "TS09AB1234";


/*
   Default driver location
   Hyderabad
*/

const DEFAULT_DRIVER_LOCATION = [
    17.3214,
    78.5978
];


/* ========================================================
   MAP VARIABLES
======================================================== */

let driverMap = null;

let driverMarker = null;

let pickupMarker = null;

let destinationMarker = null;

let routeLine = null;

let driverMovementTimer = null;


/* ========================================================
   DRIVER STATUS
======================================================== */

let driverOnline =
    localStorage.getItem("driverOnline") !== "false";


/* ========================================================
   PAGE LOAD
======================================================== */

window.addEventListener(
    "load",
    function () {

        console.log(
            "🚖 Smart RideShare Driver Dashboard Loaded"
        );


        initializeDriverStatus();

        initializeMap();

        setupButtons();

        setupNotifications();

        updateAllDriverData();

        startRideWatcher();

    }
);


/* ========================================================
   GET ACTIVE RIDE
======================================================== */

function getActiveRide() {

    try {

        const data =
            localStorage.getItem(
                "activeRide"
            );


        if (!data) {

            return null;

        }


        return JSON.parse(
            data
        );

    }

    catch (error) {

        console.error(
            "❌ Unable to read active ride:",
            error
        );


        return null;

    }

}


/* ========================================================
   SAVE ACTIVE RIDE
======================================================== */

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


/* ========================================================
   DRIVER STATUS
======================================================== */

function initializeDriverStatus() {

    const button =
        document.getElementById(
            "toggleStatus"
        );


    const statusText =
        document.getElementById(
            "driverStatusText"
        );


    const description =
        document.getElementById(
            "driverStatusDescription"
        );


    if (!button) {

        return;

    }


    if (driverOnline) {

        button.innerText =
            "Go Offline";


        if (statusText) {

            statusText.innerText =
                "Online";


            statusText.className =
                "status-online";

        }


        if (description) {

            description.innerText =
                "You are available for rides";

        }

    }

    else {

        button.innerText =
            "Go Online";


        if (statusText) {

            statusText.innerText =
                "Offline";


            statusText.className =
                "status-offline";

        }


        if (description) {

            description.innerText =
                "You are currently unavailable";

        }

    }


    /*
    Prevent duplicate click handlers
    */

    button.onclick =
        function () {

            driverOnline =
                !driverOnline;


            localStorage.setItem(

                "driverOnline",

                String(
                    driverOnline
                )

            );


            initializeDriverStatus();


            if (driverOnline) {

                alert(
                    "🟢 Driver is now ONLINE."
                );

            }

            else {

                alert(
                    "🔴 Driver is now OFFLINE."
                );

            }


            updateRideRequest();

        };

}


/* ========================================================
   UPDATE ALL DRIVER DATA
======================================================== */

function updateAllDriverData() {

    updateRideRequest();

    updateCurrentRide();

    updateDriverStatistics();

    updateEarningsTable();


    const ride =
        getActiveRide();


    if (ride) {

        updateMapText(
            ride
        );

    }

}


/* ========================================================
   UPDATE RIDE REQUEST
======================================================== */

function updateRideRequest() {

    const ride =
        getActiveRide();


    const riderElement =
        document.getElementById(
            "requestRider"
        );


    const pickupElement =
        document.getElementById(
            "requestPickup"
        );


    const destinationElement =
        document.getElementById(
            "requestDestination"
        );


    const vehicleElement =
        document.getElementById(
            "requestVehicle"
        );


    const fareElement =
        document.getElementById(
            "requestFare"
        );


    /*
    No ride
    */

    if (!ride) {

        setText(
            riderElement,
            "Waiting for rider..."
        );


        setText(
            pickupElement,
            "--"
        );


        setText(
            destinationElement,
            "--"
        );


        setText(
            vehicleElement,
            "--"
        );


        setText(
            fareElement,
            "--"
        );


        return;

    }


    /*
    ========================================================
    SEARCHING DRIVER
    ========================================================
    */

    if (
        ride.status ===
        "Searching Driver"
    ) {

        if (!driverOnline) {

            setText(
                riderElement,
                "Driver Offline"
            );

        }

        else {

            setText(

                riderElement,

                "Rider: " +
                (
                    ride.rider ||
                    "Rider"
                )

            );

        }


        setText(
            pickupElement,
            ride.pickup || "--"
        );


        setText(
            destinationElement,
            ride.destination || "--"
        );


        setText(
            vehicleElement,
            ride.vehicle || "--"
        );


        setText(
            fareElement,
            ride.fare
                ? "₹" + ride.fare
                : "--"
        );


        return;

    }


    /*
    ========================================================
    DRIVER REJECTED
    ========================================================
    */

    if (
        ride.status ===
        "Driver Rejected"
    ) {

        setText(
            riderElement,
            "Request Rejected"
        );


        setText(
            pickupElement,
            ride.pickup || "--"
        );


        setText(
            destinationElement,
            ride.destination || "--"
        );


        setText(
            vehicleElement,
            ride.vehicle || "--"
        );


        setText(
            fareElement,
            ride.fare
                ? "₹" + ride.fare
                : "--"
        );


        return;

    }


    /*
    ========================================================
    DRIVER ASSIGNED / ARRIVING
    ========================================================
    */

    if (

        ride.status ===
        "Driver Assigned" ||

        ride.status ===
        "Driver is arriving" ||

        ride.status ===
        "Driver reached pickup" ||

        ride.status ===
        "Ride Started"

    ) {

        setText(
            riderElement,
            "Ride Accepted ✅"
        );


        setText(
            pickupElement,
            ride.pickup || "--"
        );


        setText(
            destinationElement,
            ride.destination || "--"
        );


        setText(
            vehicleElement,
            ride.vehicle || "--"
        );


        setText(
            fareElement,
            ride.fare
                ? "₹" + ride.fare
                : "--"
        );


        return;

    }


    /*
    ========================================================
    COMPLETED / CANCELLED
    ========================================================
    */

    if (
        ride.status ===
        "Completed"
    ) {

        setText(
            riderElement,
            "Ride Completed ✅"
        );

    }

    else if (
        ride.status ===
        "Cancelled"
    ) {

        setText(
            riderElement,
            "Ride Cancelled ❌"
        );

    }

    else {

        setText(
            riderElement,
            "No new ride request"
        );

    }

}


/* ========================================================
   ACCEPT RIDE
======================================================== */

async function acceptRide() {

    if (!driverOnline) {

        alert(

            "🔴 You are OFFLINE.\n\n" +

            "Please click 'Go Online' first."

        );

        return;

    }


    const ride =
        getActiveRide();


    if (!ride) {

        alert(
            "No ride request available."
        );

        return;

    }


    if (
        ride.status !==
        "Searching Driver"
    ) {

        alert(

            "This ride is no longer available.\n\n" +

            "Current status: " +
            ride.status

        );

        return;

    }


    /*
    Assign driver
    */

    ride.driver =
        DRIVER_NAME;


    ride.driverVehicle =
        DRIVER_VEHICLE;


    ride.driverNumber =
        DRIVER_NUMBER;


    ride.status =
        "Driver Assigned";


    ride.eta =
        "Calculating...";


    ride.driverLocation =
        DEFAULT_DRIVER_LOCATION.slice();


    /*
    Save
    */

    saveActiveRide(
        ride
    );


    updateAllDriverData();


    /*
    Prepare map
    */

    await prepareDriverMap(
        ride
    );


    alert(

        "✅ RIDE ACCEPTED!\n\n" +

        "Rider: " +
        (
            ride.rider ||
            "Rider"
        ) +

        "\n\nPickup: " +
        ride.pickup +

        "\nDestination: " +
        ride.destination +

        "\nVehicle: " +
        ride.vehicle +

        "\nFare: ₹" +
        ride.fare +

        "\n\n🚗 Driver is heading to pickup."

    );


    /*
    Start movement toward pickup
    */

    startDriverMovement(
        ride
    );

}


/* ========================================================
   REJECT RIDE
======================================================== */

function rejectRide() {

    const ride =
        getActiveRide();


    if (!ride) {

        alert(
            "No ride request available."
        );

        return;

    }


    if (
        ride.status !==
        "Searching Driver"
    ) {

        alert(
            "This ride cannot be rejected now."
        );

        return;

    }


    const confirmation =
        confirm(

            "Reject ride " +
            ride.id +
            "?"

        );


    if (!confirmation) {

        return;

    }


    ride.status =
        "Driver Rejected";


    ride.eta =
        "Driver rejected";


    ride.driver =
        "";


    ride.driverVehicle =
        "";


    ride.driverNumber =
        "";


    saveActiveRide(
        ride
    );


    clearRouteOnly();

    stopDriverMovement();

    updateAllDriverData();


    alert(
        "❌ Ride request rejected."
    );

}


/* ========================================================
   CURRENT RIDE
======================================================== */

function updateCurrentRide() {

    const ride =
        getActiveRide();


    const rider =
        document.getElementById(
            "currentRider"
        );


    const pickup =
        document.getElementById(
            "currentPickup"
        );


    const destination =
        document.getElementById(
            "currentDestination"
        );


    const distance =
        document.getElementById(
            "currentDistance"
        );


    const eta =
        document.getElementById(
            "currentEta"
        );


    const status =
        document.getElementById(
            "currentStatus"
        );


    if (!ride) {

        setText(
            rider,
            "No active ride"
        );


        setText(
            pickup,
            "--"
        );


        setText(
            destination,
            "--"
        );


        setText(
            distance,
            "--"
        );


        setText(
            eta,
            "--"
        );


        setText(
            status,
            "No active ride"
        );


        return;

    }


    setText(
        rider,
        ride.rider || "--"
    );


    setText(
        pickup,
        ride.pickup || "--"
    );


    setText(
        destination,
        ride.destination || "--"
    );


    setText(

        distance,

        ride.distance
            ? formatDistance(
                ride.distance
            )
            : "Calculating..."

    );


    setText(
        eta,
        ride.eta || "--"
    );


    setText(
        status,
        ride.status || "--"
    );

}


/* ========================================================
   START RIDE
======================================================== */

function startRide() {

    const ride =
        getActiveRide();


    if (!ride) {

        alert(
            "No active ride found."
        );

        return;

    }


    if (

        ride.status !==
        "Driver Assigned" &&

        ride.status !==
        "Driver is arriving" &&

        ride.status !==
        "Driver reached pickup"

    ) {

        alert(

            "You cannot start the ride yet.\n\n" +

            "Current status: " +
            ride.status

        );

        return;

    }


    /*
    Stop driver-to-pickup simulation
    */

    stopDriverMovement();


    ride.status =
        "Ride Started";


    ride.eta =
        "Ride in progress";


    /*
    Driver is now at pickup
    */

    if (
        ride.pickupCoordinates
    ) {

        ride.driverLocation =
            ride.pickupCoordinates.slice();

    }


    saveActiveRide(
        ride
    );


    updateAllDriverData();


    updateMapFromRide(
        ride
    );


    alert(

        "🚖 RIDE STARTED!\n\n" +

        "Rider: " +
        (
            ride.rider ||
            "Rider"
        ) +

        "\n\nDestination: " +
        ride.destination +

        "\n\nDrive safely."

    );

}


/* ========================================================
   COMPLETE RIDE
======================================================== */

function completeRide() {

    const ride =
        getActiveRide();


    if (!ride) {

        alert(
            "No active ride found."
        );

        return;

    }


    if (
        ride.status !==
        "Ride Started"
    ) {

        alert(

            "Start the ride before completing it.\n\n" +

            "Current status: " +
            ride.status

        );

        return;

    }


    const confirmation =
        confirm(
            "Complete this ride?"
        );


    if (!confirmation) {

        return;

    }


    ride.status =
        "Completed";


    ride.eta =
        "Completed";


    if (
        ride.destinationCoordinates
    ) {

        ride.driverLocation =
            ride.destinationCoordinates.slice();

    }


    saveActiveRide(
        ride
    );


    stopDriverMovement();


    saveDriverTrip(
        ride
    );


    updateAllDriverData();


    updateMapText(
        ride
    );


    alert(

        "✅ RIDE COMPLETED!\n\n" +

        "Ride ID: " +
        ride.id +

        "\n\nRider: " +
        (
            ride.rider ||
            "Rider"
        ) +

        "\nFare: ₹" +
        ride.fare +

        "\n\n💰 Earnings added."

    );

}


/* ========================================================
   DRIVER TRIP HISTORY
======================================================== */

function saveDriverTrip(
    ride
) {

    let trips = [];


    try {

        trips =
            JSON.parse(

                localStorage.getItem(
                    "driverTrips"
                )

            ) || [];

    }

    catch {

        trips = [];

    }


    const exists =
        trips.some(

            function (trip) {

                return (
                    trip.id ===
                    ride.id
                );

            }

        );


    if (exists) {

        return;

    }


    trips.unshift({

        id:
            ride.id,

        rider:
            ride.rider,

        pickup:
            ride.pickup,

        destination:
            ride.destination,

        fare:
            Number(
                ride.fare
            ) || 0,

        date:
            new Date()
                .toLocaleString(),

        status:
            "Completed"

    });


    localStorage.setItem(

        "driverTrips",

        JSON.stringify(
            trips
        )

    );

}


/* ========================================================
   DRIVER STATISTICS
======================================================== */

function updateDriverStatistics() {

    let trips = [];


    try {

        trips =
            JSON.parse(

                localStorage.getItem(
                    "driverTrips"
                )

            ) || [];

    }

    catch {

        trips = [];

    }


    const completed =
        trips.filter(

            function (trip) {

                return (
                    trip.status ===
                    "Completed"
                );

            }

        );


    const completedElement =
        document.getElementById(
            "completedRides"
        );


    const earningsElement =
        document.getElementById(
            "todayEarnings"
        );


    if (completedElement) {

        /*
        Demo base count = 24
        */

        completedElement.innerText =
            24 +
            completed.length;

    }


    if (earningsElement) {

        let total =
            2450;


        completed.forEach(

            function (trip) {

                total +=
                    Number(
                        trip.fare
                    ) || 0;

            }

        );


        earningsElement.innerText =
            "₹" +
            total;

    }

}


/* ========================================================
   EARNINGS TABLE
======================================================== */

function updateEarningsTable() {

    const table =
        document.getElementById(
            "earningsTable"
        );


    if (!table) {

        return;

    }


    table
        .querySelectorAll(
            ".dynamic-driver-trip"
        )
        .forEach(

            function (row) {

                row.remove();

            }

        );


    let trips = [];


    try {

        trips =
            JSON.parse(

                localStorage.getItem(
                    "driverTrips"
                )

            ) || [];

    }

    catch {

        trips = [];

    }


    trips
        .slice(0, 10)
        .forEach(

            function (trip) {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.className =
                    "dynamic-driver-trip";


                const date =
                    document.createElement(
                        "td"
                    );


                date.textContent =
                    trip.date;


                const tripsCell =
                    document.createElement(
                        "td"
                    );


                tripsCell.textContent =
                    "1";


                const amount =
                    document.createElement(
                        "td"
                    );


                amount.textContent =
                    "₹" +
                    trip.fare;


                const status =
                    document.createElement(
                        "td"
                    );


                status.textContent =
                    trip.status;


                row.appendChild(
                    date
                );


                row.appendChild(
                    tripsCell
                );


                row.appendChild(
                    amount
                );


                row.appendChild(
                    status
                );


                table.prepend(
                    row
                );

            }

        );

}


/* ========================================================
   INITIALIZE DRIVER MAP
======================================================== */

function initializeMap() {

    const mapElement =
        document.getElementById(
            "driverMap"
        );


    if (!mapElement) {

        console.warn(
            "⚠️ driverMap element not found."
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


    if (driverMap) {

        return;

    }


    driverMap =
        L.map(
            "driverMap",
            {
                zoomControl: true,
                attributionControl: true
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
        driverMap
    );


    driverMap.setView(

        DEFAULT_DRIVER_LOCATION,

        13

    );


    driverMarker =
        L.marker(
            DEFAULT_DRIVER_LOCATION
        )
        .addTo(
            driverMap
        )
        .bindPopup(

            "<b>🚗 Rahul Sharma</b><br>" +
            "Driver Location"

        );


    setTimeout(

        function () {

            driverMap.invalidateSize();

        },

        500

    );


    setTimeout(

        function () {

            driverMap.invalidateSize();

        },

        1500

    );


    /*
    Restore active ride
    */

    const ride =
        getActiveRide();


    if (
        ride &&
        ride.status !== "Completed" &&
        ride.status !== "Cancelled" &&
        ride.status !== "Driver Rejected"
    ) {

        setTimeout(

            function () {

                prepareDriverMap(
                    ride
                );

            },

            700

        );

    }

}


/* ========================================================
   PREPARE DRIVER MAP
======================================================== */

async function prepareDriverMap(
    ride
) {

    if (
        !driverMap ||
        !ride
    ) {

        return;

    }


    updateMapText(
        ride
    );


    /*
    Coordinates already available
    */

    if (

        ride.pickupCoordinates &&
        ride.destinationCoordinates

    ) {

        await drawRealRoute(

            ride.pickupCoordinates,

            ride.destinationCoordinates,

            ride

        );


        return;

    }


    /*
    Geocode pickup
    */

    const pickup =
        await geocodeLocation(
            ride.pickup
        );


    /*
    Geocode destination
    */

    const destination =
        await geocodeLocation(
            ride.destination
        );


    if (
        !pickup ||
        !destination
    ) {

        updateMapStatus(
            "Could not locate ride locations"
        );

        return;

    }


    ride.pickupCoordinates = [

        pickup.lat,
        pickup.lon

    ];


    ride.destinationCoordinates = [

        destination.lat,
        destination.lon

    ];


    saveActiveRide(
        ride
    );


    await drawRealRoute(

        ride.pickupCoordinates,

        ride.destinationCoordinates,

        ride

    );

}


/* ========================================================
   GEOCODE LOCATION
======================================================== */

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
                "Geocoding failed"
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
                Number(
                    results[0].lat
                ),

            lon:
                Number(
                    results[0].lon
                )

        };

    }

    catch (error) {

        console.error(

            "❌ Geocoding error:",

            error

        );


        return null;

    }

}


/* ========================================================
   DRAW REAL ROAD ROUTE
======================================================== */

async function drawRealRoute(

    pickup,

    destination,

    ride

) {

    if (!driverMap) {

        return;

    }


    clearRouteOnly();


    /*
    Pickup marker
    */

    pickupMarker =
        L.marker(
            pickup
        )
        .addTo(
            driverMap
        )
        .bindPopup(

            "<b>📍 Pickup</b><br>" +

            escapeHTML(
                ride.pickup
            )

        );


    /*
    Destination marker
    */

    destinationMarker =
        L.marker(
            destination
        )
        .addTo(
            driverMap
        )
        .bindPopup(

            "<b>🎯 Destination</b><br>" +

            escapeHTML(
                ride.destination
            )

        );


    updateMapText(
        ride
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
                "Routing failed"
            );

        }


        const data =
            await response.json();


        if (
            !data.routes ||
            !data.routes.length
        ) {

            throw new Error(
                "No route found"
            );

        }


        const route =
            data.routes[0];


        /*
        Distance
        */

        const distanceKm =
            route.distance /
            1000;


        /*
        Duration
        */

        const durationMinutes =
            Math.max(

                1,

                Math.ceil(

                    route.duration /
                    60

                )

            );


        ride.distance =
            Number(
                distanceKm.toFixed(1)
            );


        /*
        ETA only changes
        when appropriate
        */

        if (
            ride.status ===
            "Driver Assigned"
        ) {

            ride.eta =
                durationMinutes +
                " Minutes";

        }


        saveActiveRide(
            ride
        );


        /*
        Draw route
        */

        routeLine =
            L.geoJSON(

                route.geometry,

                {

                    style: {

                        weight: 6,

                        opacity: 0.85

                    }

                }

            )
            .addTo(
                driverMap
            );


        /*
        Fit all points
        */

        const bounds =
            L.latLngBounds([

                DEFAULT_DRIVER_LOCATION,

                pickup,

                destination

            ]);


        driverMap.fitBounds(

            bounds,

            {

                padding:
                    [50, 50]

            }

        );


        updateMapText(
            ride
        );


        updateCurrentRide();


        updateMapStatus(
            "🛣️ Route ready"
        );

    }

    catch (error) {

        console.error(

            "❌ OSRM route error:",

            error

        );


        /*
        Fallback straight line
        */

        routeLine =
            L.polyline(

                [

                    DEFAULT_DRIVER_LOCATION,

                    pickup,

                    destination

                ],

                {

                    weight: 5,

                    dashArray:
                        "10,10"

                }

            )
            .addTo(
                driverMap
            );


        const distance =
            calculateDistance(

                pickup[0],
                pickup[1],

                destination[0],
                destination[1]

            );


        ride.distance =
            Number(
                distance.toFixed(1)
            );


        if (
            ride.status ===
            "Driver Assigned"
        ) {

            ride.eta =

                Math.max(

                    1,

                    Math.ceil(
                        distance /
                        0.5
                    )

                ) +

                " Minutes";

        }


        saveActiveRide(
            ride
        );


        driverMap.fitBounds(

            routeLine.getBounds(),

            {

                padding:
                    [50, 50]

            }

        );


        updateMapText(
            ride
        );


        updateCurrentRide();


        updateMapStatus(
            "📍 Approximate route shown"
        );

    }

}


/* ========================================================
   UPDATE MAP TEXT
======================================================== */

function updateMapText(
    ride
) {

    if (!ride) {

        return;

    }


    setText(

        document.getElementById(
            "mapPickup"
        ),

        ride.pickup ||
        "Waiting..."

    );


    setText(

        document.getElementById(
            "mapDestination"
        ),

        ride.destination ||
        "Waiting..."

    );


    setText(

        document.getElementById(
            "mapDistance"
        ),

        ride.distance
            ? formatDistance(
                ride.distance
            )
            : "-- km"

    );


    setText(

        document.getElementById(
            "mapDriver"
        ),

        ride.driver ||
        "Searching..."

    );


    setText(

        document.getElementById(
            "mapStatus"
        ),

        ride.status ||
        "Waiting for ride"

    );

}


/* ========================================================
   MAP STATUS
======================================================== */

function updateMapStatus(
    message
) {

    setText(

        document.getElementById(
            "mapStatus"
        ),

        message

    );

}


/* ========================================================
   DRIVER MOVEMENT
======================================================== */

function startDriverMovement(
    ride
) {

    stopDriverMovement();


    if (

        !ride ||

        !ride.pickupCoordinates ||

        !driverMarker

    ) {

        return;

    }


    /*
    Driver starts at default location
    */

    let current =
        DEFAULT_DRIVER_LOCATION.slice();


    driverMarker.setLatLng(
        current
    );


    ride.driverLocation =
        current.slice();


    saveActiveRide(
        ride
    );


    let progress = 0;


    /*
    Driver moves every 3 seconds
    */

    driverMovementTimer =
        setInterval(

            function () {

                /*
                Stop if ride changed
                */

                const latestRide =
                    getActiveRide();


                if (
                    !latestRide ||
                    latestRide.id !==
                    ride.id
                ) {

                    stopDriverMovement();

                    return;

                }


                if (
                    latestRide.status ===
                    "Cancelled" ||

                    latestRide.status ===
                    "Completed" ||

                    latestRide.status ===
                    "Ride Started"

                ) {

                    stopDriverMovement();

                    return;

                }


                progress +=
                    0.02;


                if (
                    progress >= 1
                ) {

                    progress = 1;

                }


                const lat =

                    current[0] +

                    (
                        ride.pickupCoordinates[0] -
                        current[0]
                    ) *
                    progress;


                const lon =

                    current[1] +

                    (
                        ride.pickupCoordinates[1] -
                        current[1]
                    ) *
                    progress;


                driverMarker.setLatLng([

                    lat,
                    lon

                ]);


                ride.driverLocation = [

                    lat,
                    lon

                ];


                /*
                Save driver position
                */

                saveActiveRide(
                    ride
                );


                /*
                Update map
                */

                updateMapStatus(

                    "🚗 Driver approaching pickup..."

                );


                if (
                    progress >= 1
                ) {

                    ride.status =
                        "Driver reached pickup";


                    ride.eta =
                        "Arrived";


                    ride.driverLocation =

                        ride.pickupCoordinates
                            .slice();


                    saveActiveRide(
                        ride
                    );


                    updateAllDriverData();


                    updateMapStatus(

                        "🚗 Driver reached pickup"

                    );


                    stopDriverMovement();

                }

            },

            3000

        );

}


/* ========================================================
   STOP DRIVER MOVEMENT
======================================================== */

function stopDriverMovement() {

    if (
        driverMovementTimer
    ) {

        clearInterval(
            driverMovementTimer
        );


        driverMovementTimer =
            null;

    }

}


/* ========================================================
   MAP BUTTONS
======================================================== */

function setupMapButtons() {

    const center =
        document.getElementById(
            "centerMap"
        );


    const route =
        document.getElementById(
            "routeButton"
        );


    const clear =
        document.getElementById(
            "clearMap"
        );


    if (center) {

        center.onclick =
            function () {

                if (

                    driverMap &&
                    driverMarker

                ) {

                    driverMap.setView(

                        driverMarker.getLatLng(),

                        14

                    );

                }

            };

    }


    if (route) {

        route.onclick =
            async function () {

                const ride =
                    getActiveRide();


                if (!ride) {

                    alert(
                        "No active ride available."
                    );

                    return;

                }


                await prepareDriverMap(
                    ride
                );

            };

    }


    if (clear) {

        clear.onclick =
            function () {

                clearMap();


                updateMapStatus(
                    "Map cleared"
                );

            };

    }

}


/* ========================================================
   CLEAR ROUTE ONLY
======================================================== */

function clearRouteOnly() {

    if (

        pickupMarker &&
        driverMap

    ) {

        driverMap.removeLayer(
            pickupMarker
        );


        pickupMarker =
            null;

    }


    if (

        destinationMarker &&
        driverMap

    ) {

        driverMap.removeLayer(
            destinationMarker
        );


        destinationMarker =
            null;

    }


    if (

        routeLine &&
        driverMap

    ) {

        driverMap.removeLayer(
            routeLine
        );


        routeLine =
            null;

    }

}


/* ========================================================
   CLEAR MAP
======================================================== */

function clearMap() {

    clearRouteOnly();


    stopDriverMovement();


    if (

        driverMap &&
        driverMarker

    ) {

        driverMarker.setLatLng(

            DEFAULT_DRIVER_LOCATION

        );


        driverMap.setView(

            DEFAULT_DRIVER_LOCATION,

            13

        );

    }


    setText(

        document.getElementById(
            "mapPickup"
        ),

        "Waiting..."

    );


    setText(

        document.getElementById(
            "mapDestination"
        ),

        "Waiting..."

    );


    setText(

        document.getElementById(
            "mapDistance"
        ),

        "-- km"

    );


    setText(

        document.getElementById(
            "mapDriver"
        ),

        DRIVER_NAME

    );

}


/* ========================================================
   BUTTON SETUP
======================================================== */

function setupButtons() {

    const accept =
        document.getElementById(
            "acceptRide"
        );


    const reject =
        document.getElementById(
            "rejectRide"
        );


    const start =
        document.getElementById(
            "startRide"
        );


    const complete =
        document.getElementById(
            "completeRide"
        );


    if (accept) {

        accept.onclick =
            acceptRide;

    }


    if (reject) {

        reject.onclick =
            rejectRide;

    }


    if (start) {

        start.onclick =
            startRide;

    }


    if (complete) {

        complete.onclick =
            completeRide;

    }


    setupMapButtons();

    setupFuelButton();

    setupSupportButtons();

    setupEmergencyButtons();

}


/* ========================================================
   FUEL BUTTON
======================================================== */

function setupFuelButton() {

    const button =
        document.getElementById(
            "fuelButton"
        );


    if (!button) {

        return;

    }


    button.onclick =
        function () {

            alert(

                "⛽ VEHICLE FUEL STATUS\n\n" +

                "Fuel: 75%\n" +

                "Estimated Range: 280 km\n\n" +

                "Vehicle is ready for rides."

            );

        };

}


/* ========================================================
   SUPPORT BUTTONS
======================================================== */

function setupSupportButtons() {

    const support =
        document.getElementById(
            "supportButton"
        );


    const documents =
        document.getElementById(
            "documentsButton"
        );


    const settings =
        document.getElementById(
            "settingsButton"
        );


    if (support) {

        support.onclick =
            function () {

                alert(

                    "📞 DRIVER SUPPORT\n\n" +

                    "Support center opened."

                );

            };

    }


    if (documents) {

        documents.onclick =
            function () {

                alert(

                    "📄 DRIVER DOCUMENTS\n\n" +

                    "License: Verified ✅\n" +

                    "Vehicle Documents: Verified ✅"

                );

            };

    }


    if (settings) {

        settings.onclick =
            function () {

                alert(

                    "⚙ DRIVER SETTINGS\n\n" +

                    "Settings panel opened."

                );

            };

    }

}


/* ========================================================
   EMERGENCY BUTTONS
======================================================== */

function setupEmergencyButtons() {

    const sos =
        document.getElementById(
            "sosButton"
        );


    const share =
        document.getElementById(
            "shareLocationButton"
        );


    const stop =
        document.getElementById(
            "stopRideButton"
        );


    /*
    SOS
    */

    if (sos) {

        sos.onclick =
            function () {

                alert(

                    "🚨 SOS ALERT ACTIVATED\n\n" +

                    "Emergency action recorded."

                );

            };

    }


    /*
    Share location
    */

    if (share) {

        share.onclick =
            function () {

                const ride =
                    getActiveRide();


                if (!ride) {

                    alert(
                        "No active ride."
                    );

                    return;

                }


                alert(

                    "📍 LOCATION SHARING\n\n" +

                    "Driver: " +
                    DRIVER_NAME +

                    "\nRide ID: " +
                    ride.id +

                    "\nStatus: " +
                    ride.status

                );

            };

    }


    /*
    Stop ride
    */

    if (stop) {

        stop.onclick =
            function () {

                const ride =
                    getActiveRide();


                if (!ride) {

                    alert(
                        "No active ride."
                    );

                    return;

                }


                if (
                    !confirm(
                        "Stop the current ride?"
                    )
                ) {

                    return;

                }


                ride.status =
                    "Stopped by Driver";


                ride.eta =
                    "Stopped";


                saveActiveRide(
                    ride
                );


                stopDriverMovement();


                updateAllDriverData();


                alert(
                    "🛑 Ride stopped."
                );

            };

    }

}


/* ========================================================
   NOTIFICATIONS
======================================================== */

function setupNotifications() {

    document
        .querySelectorAll(
            ".notification"
        )
        .forEach(

            function (notification) {

                notification.style.cursor =
                    "pointer";


                notification.addEventListener(

                    "click",

                    function () {

                        alert(

                            "🔔 DRIVER NOTIFICATION\n\n" +

                            this.innerText

                        );

                    }

                );

            }

        );

}


/* ========================================================
   WATCH RIDER / DRIVER DATA
======================================================== */

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
            Only update when
            activeRide changes
            */

            if (
                currentRide !==
                lastRide
            ) {

                lastRide =
                    currentRide;


                updateAllDriverData();


                const ride =
                    getActiveRide();


                if (ride) {

                    updateMapFromRide(
                        ride
                    );

                }

            }


            /*
            Always refresh text
            so rider dashboard
            changes appear quickly.
            */

            const ride =
                getActiveRide();


            if (ride) {

                updateRideRequest();

                updateCurrentRide();

                updateMapText(
                    ride
                );

            }

        },

        1000

    );

}


/* ========================================================
   STORAGE EVENT
======================================================== */

window.addEventListener(

    "storage",

    function (event) {

        if (
            event.key ===
            "activeRide"
        ) {

            updateAllDriverData();


            const ride =
                getActiveRide();


            if (ride) {

                updateMapFromRide(
                    ride
                );

            }

        }

    }

);


/* ========================================================
   MAP UPDATE
======================================================== */

function updateMapFromRide(
    ride
) {

    if (!ride) {

        clearRouteOnly();

        return;

    }


    updateMapText(
        ride
    );


    /*
    Don't redraw route
    unnecessarily.
    */

    if (

        ride.pickupCoordinates &&

        ride.destinationCoordinates

    ) {

        /*
        Route already exists
        */

        if (
            !routeLine &&
            driverMap
        ) {

            prepareDriverMap(
                ride
            );

        }


        /*
        Restore driver marker
        */

        if (

            driverMarker &&
            ride.driverLocation

        ) {

            driverMarker.setLatLng(

                ride.driverLocation

            );

        }


        return;

    }


    if (!driverMap) {

        return;

    }


    /*
    Only prepare map for
    meaningful ride states.
    */

    if (

        ride.status ===
        "Searching Driver" ||

        ride.status ===
        "Driver Assigned"

    ) {

        prepareDriverMap(
            ride
        );

    }

}


/* ========================================================
   DISTANCE CALCULATOR
======================================================== */

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


/* ========================================================
   RADIANS
======================================================== */

function toRadians(
    value
) {

    return (

        value *
        Math.PI /
        180

    );

}


/* ========================================================
   FORMAT DISTANCE
======================================================== */

function formatDistance(
    distance
) {

    if (

        typeof distance ===
        "string" &&

        distance.includes(
            "km"
        )

    ) {

        return distance;

    }


    return (

        Number(
            distance
        ).toFixed(1)

    ) +

    " km";

}


/* ========================================================
   TEXT HELPER
======================================================== */

function setText(
    element,
    value
) {

    if (element) {

        element.textContent =
            value;

    }

}


/* ========================================================
   HTML ESCAPE
======================================================== */

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


/* ========================================================
   FINAL CONSOLE
======================================================== */

console.log(`

========================================================

        SMART RIDESHARE DRIVER SYSTEM

========================================================

✔ Driver Online / Offline
✔ Rider Ride Request
✔ Shared LocalStorage
✔ Accept Ride
✔ Reject Ride
✔ Driver Assignment
✔ Pickup Geocoding
✔ Destination Geocoding
✔ OpenStreetMap
✔ Leaflet Map
✔ Real Road Routing
✔ Pickup Marker
✔ Destination Marker
✔ Driver Marker
✔ Driver Movement
✔ Distance
✔ ETA
✔ Start Ride
✔ Complete Ride
✔ Ride Cancellation Sync
✔ Earnings
✔ Trip History
✔ Emergency Controls
✔ Rider Dashboard Connection
✔ Refresh Safe

========================================================

RIDE FLOW

Rider Books
     ↓
Searching Driver
     ↓
Driver Accepts
     ↓
Driver Assigned
     ↓
Driver Approaches Pickup
     ↓
Driver Reached Pickup
     ↓
Driver Starts Ride
     ↓
Ride Started
     ↓
Driver Completes Ride
     ↓
Completed

========================================================

`);