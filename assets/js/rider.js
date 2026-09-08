document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /* =========================================================
       ELEMENTS
    ========================================================= */

    const pickupInput = document.getElementById("pickup");
    const destinationInput = document.getElementById("destination");
    const vehicleType = document.getElementById("vehicleType");

    const routePickup = document.getElementById("routePickup");
    const routeDestination = document.getElementById("routeDestination");
    const routeDistance = document.getElementById("routeDistance");
    const routeTime = document.getElementById("routeTime");
    const routeVehicle = document.getElementById("routeVehicle");
    const routeFare = document.getElementById("routeFare");

    const routeDriver = document.getElementById("routeDriver");

    const confirmationBookingId =
        document.getElementById("confirmationBookingId");

    const confirmationOTP =
        document.getElementById("confirmationOTP");

    const currentStatus =
        document.getElementById("currentStatus");

    const bookingMessage =
        document.getElementById("bookingMessage");

    const bookRide =
        document.getElementById("bookRide");

    const cancelRide =
        document.getElementById("cancelRide");

    const bookingFormSection =
        document.getElementById("bookingFormSection");


    /* =========================================================
       MAP VARIABLES
    ========================================================= */

    let map = null;

    let pickupMarker = null;
    let destinationMarker = null;
    let routeLine = null;


    /* =========================================================
       MAP DEFAULT LOCATION
       Hyderabad
    ========================================================= */

    const DEFAULT_LAT = 17.3850;
    const DEFAULT_LNG = 78.4867;
    const DEFAULT_ZOOM = 12;


    /* =========================================================
       API / SERVICE URLs
    ========================================================= */

    const NOMINATIM_URL =
        "https://nominatim.openstreetmap.org/search";

    const OSRM_URL =
        "https://router.project-osrm.org/route/v1/driving";


    /* =========================================================
       VEHICLE RATES
    ========================================================= */

    const VEHICLE_RATES = {
        Mini: 12,
        Prime: 18,
        Auto: 10
    };


    /* =========================================================
       MAP INITIALIZATION
       
       MAP
       SATELLITE
       HYBRID
    ========================================================= */

    function initializeMap() {

        const mapElement =
            document.getElementById("riderMap");

        if (!mapElement) {

            console.error(
                "Map element #riderMap was not found."
            );

            return;
        }


        /* -----------------------------------------------------
           CREATE MAP
        ----------------------------------------------------- */

        map = L.map("riderMap", {
            zoomControl: true,
            attributionControl: true
        }).setView(
            [DEFAULT_LAT, DEFAULT_LNG],
            DEFAULT_ZOOM
        );


        /* =====================================================
           NORMAL MAP
        ===================================================== */

        const mapLayer =
            L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    maxZoom: 19,

                    attribution:
                        "&copy; OpenStreetMap contributors"
                }
            );


        /* =====================================================
           SATELLITE MAP
           
           No Google API key.
        ===================================================== */

        const satelliteLayer =
            L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                {
                    maxZoom: 19,

                    attribution:
                        "Tiles &copy; Esri"
                }
            );


        /* =====================================================
           HYBRID LABELS
           
           Adds roads / places / boundaries over satellite.
        ===================================================== */

        const hybridLabels =
            L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
                {
                    maxZoom: 19,

                    transparent: true,

                    attribution:
                        "Labels &copy; Esri"
                }
            );


        /* =====================================================
           HYBRID LAYER
           
           Satellite + labels
        ===================================================== */

        const hybridLayer =
            L.layerGroup([
                satelliteLayer,
                hybridLabels
            ]);


        /* =====================================================
           DEFAULT MAP
        ===================================================== */

        mapLayer.addTo(map);


        /* =====================================================
           MAP TYPE CONTROL
        ===================================================== */

        const baseMaps = {

            "Map": mapLayer,

            "Satellite": satelliteLayer,

            "Hybrid": hybridLayer
        };


        L.control.layers(
            baseMaps,
            null,
            {
                position: "topright",
                collapsed: false
            }
        ).addTo(map);


        console.log(
            "Rider map initialized successfully."
        );
    }


    /* =========================================================
       SHOW MESSAGE
    ========================================================= */

    function showMessage(message, type) {

        if (!bookingMessage) {
            return;
        }

        bookingMessage.textContent = message;

        bookingMessage.className =
            "message " + type;
    }


    /* =========================================================
       CLEAR MESSAGE
    ========================================================= */

    function clearMessage() {

        if (!bookingMessage) {
            return;
        }

        bookingMessage.textContent = "";

        bookingMessage.className =
            "message";
    }


    /* =========================================================
       GENERATE BOOKING ID
    ========================================================= */

    function generateBookingId() {

        const randomNumber =
            Math.floor(
                100000 +
                Math.random() * 900000
            );

        return "BK-" + randomNumber;
    }


    /* =========================================================
       GENERATE OTP
    ========================================================= */

    function generateOTP() {

        return String(
            Math.floor(
                1000 +
                Math.random() * 9000
            )
        );
    }


    /* =========================================================
       NORMALIZE LOCATION NAME
    ========================================================= */

    function normalizeLocationName(value) {

        return value
            .trim()
            .replace(/\s+/g, " ");
    }


    /* =========================================================
       GEOCODE LOCATION
       
       Converts:
       
       "Charminar Hyderabad"
       
       into:
       
       latitude + longitude
    ========================================================= */

    async function geocodeLocation(location) {

        const url =
            NOMINATIM_URL +
            "?format=json" +
            "&q=" +
            encodeURIComponent(location) +
            "&limit=1" +
            "&addressdetails=1";

        let response;

        try {

            response =
                await fetch(
                    url,
                    {
                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );

        } catch (error) {

            throw new Error(
                "Unable to connect to the map service. Please check your internet connection."
            );
        }


        if (!response.ok) {

            throw new Error(
                "Location service is currently unavailable."
            );
        }


        const results =
            await response.json();


        if (
            !results ||
            results.length === 0
        ) {

            throw new Error(
                'Location not found: "' +
                location +
                '". Please enter a more specific location.'
            );
        }


        const latitude =
            Number(results[0].lat);

        const longitude =
            Number(results[0].lon);


        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {

            throw new Error(
                "The location service returned invalid coordinates."
            );
        }


        return {

            lat: latitude,

            lng: longitude,

            displayName:
                results[0].display_name
        };
    }


    /* =========================================================
       CALCULATE ROAD ROUTE
       
       Uses OSRM.
    ========================================================= */

    async function calculateRoute(
        pickupCoords,
        destinationCoords
    ) {

        const coordinates =
            pickupCoords.lng +
            "," +
            pickupCoords.lat +
            ";" +
            destinationCoords.lng +
            "," +
            destinationCoords.lat;


        const url =
            OSRM_URL +
            "/" +
            coordinates +
            "?overview=full&geometries=geojson";


        let response;

        try {

            response =
                await fetch(url);

        } catch (error) {

            throw new Error(
                "Unable to connect to the routing service. Please check your internet connection."
            );
        }


        if (!response.ok) {

            throw new Error(
                "Unable to calculate the road route."
            );
        }


        const data =
            await response.json();


        if (
            data.code !== "Ok" ||
            !data.routes ||
            data.routes.length === 0
        ) {

            throw new Error(
                "No road route could be found between these locations."
            );
        }


        const route =
            data.routes[0];


        if (
            !route.geometry ||
            !route.geometry.coordinates
        ) {

            throw new Error(
                "The routing service returned an invalid route."
            );
        }


        return {

            distanceKm:
                route.distance / 1000,

            durationMinutes:
                route.duration / 60,

            geometry:
                route.geometry
        };
    }


    /* =========================================================
       FORMAT DISTANCE
    ========================================================= */

    function formatDistance(distanceKm) {

        if (distanceKm < 1) {

            return (
                Math.round(
                    distanceKm * 1000
                ) +
                " m"
            );
        }


        return (
            distanceKm.toFixed(1) +
            " km"
        );
    }


    /* =========================================================
       FORMAT TIME
    ========================================================= */

    function formatDuration(minutes) {

        const roundedMinutes =
            Math.max(
                1,
                Math.round(minutes)
            );


        if (roundedMinutes < 60) {

            return (
                roundedMinutes +
                " mins"
            );
        }


        const hours =
            Math.floor(
                roundedMinutes / 60
            );


        const remainingMinutes =
            roundedMinutes % 60;


        if (remainingMinutes === 0) {

            return (
                hours +
                (
                    hours === 1
                        ? " hour"
                        : " hours"
                )
            );
        }


        return (
            hours +
            (
                hours === 1
                    ? " hour "
                    : " hours "
            ) +
            remainingMinutes +
            " mins"
        );
    }


    /* =========================================================
       CALCULATE FARE
    ========================================================= */

    function calculateFare(
        distanceKm,
        vehicle
    ) {

        const rate =
            VEHICLE_RATES[vehicle] ||
            VEHICLE_RATES.Mini;


        const fare =
            Math.max(
                40,
                Math.round(
                    distanceKm * rate
                )
            );


        return fare;
    }


    /* =========================================================
       CLEAR MAP ROUTE
    ========================================================= */

    function clearMapRoute() {

        if (!map) {
            return;
        }


        if (pickupMarker) {

            map.removeLayer(
                pickupMarker
            );

            pickupMarker = null;
        }


        if (destinationMarker) {

            map.removeLayer(
                destinationMarker
            );

            destinationMarker = null;
        }


        if (routeLine) {

            map.removeLayer(
                routeLine
            );

            routeLine = null;
        }
    }


    /* =========================================================
       DRAW ROUTE
       
       Pickup
       Destination
       Road route
    ========================================================= */

    function drawRoute(
        pickupCoords,
        destinationCoords,
        geometry
    ) {

        if (!map) {
            return;
        }


        clearMapRoute();


        /* -----------------------------------------------------
           PICKUP MARKER
        ----------------------------------------------------- */

        pickupMarker =
            L.marker([
                pickupCoords.lat,
                pickupCoords.lng
            ])
            .addTo(map)
            .bindPopup(
                "<strong>Pickup</strong>"
            );


        /* -----------------------------------------------------
           DESTINATION MARKER
        ----------------------------------------------------- */

        destinationMarker =
            L.marker([
                destinationCoords.lat,
                destinationCoords.lng
            ])
            .addTo(map)
            .bindPopup(
                "<strong>Destination</strong>"
            );


        /* -----------------------------------------------------
           ROUTE COORDINATES
           
           GeoJSON:
           [longitude, latitude]
           
           Leaflet:
           [latitude, longitude]
        ----------------------------------------------------- */

        if (
            geometry &&
            Array.isArray(
                geometry.coordinates
            ) &&
            geometry.coordinates.length > 0
        ) {

            const routeCoordinates =
                geometry.coordinates.map(
                    function (coordinate) {

                        return [
                            coordinate[1],
                            coordinate[0]
                        ];
                    }
                );


            /* -------------------------------------------------
               DRAW ROAD ROUTE
            ------------------------------------------------- */

            routeLine =
                L.polyline(
                    routeCoordinates,
                    {
                        weight: 5,
                        opacity: 0.85
                    }
                ).addTo(map);


            /* -------------------------------------------------
               FIT MAP TO ROUTE
            ------------------------------------------------- */

            map.fitBounds(
                routeLine.getBounds(),
                {
                    padding: [
                        35,
                        35
                    ]
                }
            );

        } else {

            /* -------------------------------------------------
               FALLBACK LINE
               
               If route geometry isn't available,
               show a direct line between the SAME
               coordinates.
            ------------------------------------------------- */

            routeLine =
                L.polyline(
                    [
                        [
                            pickupCoords.lat,
                            pickupCoords.lng
                        ],
                        [
                            destinationCoords.lat,
                            destinationCoords.lng
                        ]
                    ],
                    {
                        weight: 5,
                        opacity: 0.85,
                        dashArray: "10, 10"
                    }
                ).addTo(map);


            map.fitBounds(
                routeLine.getBounds(),
                {
                    padding: [
                        35,
                        35
                    ]
                }
            );
        }


        /* -----------------------------------------------------
           OPEN PICKUP POPUP
        ----------------------------------------------------- */

        pickupMarker.openPopup();
    }


    /* =========================================================
       UPDATE STATUS STYLE
    ========================================================= */

    function updateStatusStyle(status) {

        if (!currentStatus) {
            return;
        }


        switch (status) {

            case "Requested":

                currentStatus.style.background =
                    "#fef3c7";

                currentStatus.style.color =
                    "#d97706";

                break;


            case "Accepted":

                currentStatus.style.background =
                    "#e0f2fe";

                currentStatus.style.color =
                    "#0369a1";

                break;


            case "Driver Arriving":

                currentStatus.style.background =
                    "#e0f2fe";

                currentStatus.style.color =
                    "#0369a1";

                break;


            case "In Progress":

                currentStatus.style.background =
                    "#dbeafe";

                currentStatus.style.color =
                    "#1d4ed8";

                break;


            case "Completed":

                currentStatus.style.background =
                    "#dcfce7";

                currentStatus.style.color =
                    "#15803d";

                break;


            case "Cancelled":

                currentStatus.style.background =
                    "#fee2e2";

                currentStatus.style.color =
                    "#b91c1c";

                break;


            default:

                currentStatus.style.background =
                    "#f1f5f9";

                currentStatus.style.color =
                    "#475569";
        }
    }


    /* =========================================================
       RENDER RIDE
    ========================================================= */

    function renderRide(ride) {

        if (!ride) {

            resetUI();

            return;
        }


        routePickup.textContent =
            ride.pickup || "-";


        routeDestination.textContent =
            ride.destination || "-";


        routeDistance.textContent =
            ride.distance || "-";


        routeTime.textContent =
            ride.duration || "-";


        routeVehicle.textContent =
            ride.vehicle || "-";


        routeFare.textContent =
            ride.fare || "-";


        routeDriver.textContent =
            ride.driverName ||
            "Searching for driver...";


        confirmationBookingId.textContent =
            ride.bookingId || "-";


        confirmationOTP.textContent =
            ride.otp || "-";


        currentStatus.textContent =
            ride.status ||
            "Requested";


        updateStatusStyle(
            ride.status
        );


        /* =====================================================
           BOOKING FORM VISIBILITY
        ===================================================== */

        if (
            ride.status === "Completed" ||
            ride.status === "Cancelled"
        ) {

            bookingFormSection.style.display =
                "block";

            bookRide.style.display =
                "flex";

            cancelRide.style.display =
                "none";

        } else {

            bookingFormSection.style.display =
                "none";

            bookRide.style.display =
                "none";

            cancelRide.style.display =
                "flex";
        }


        /* =====================================================
           DRAW SAVED ROUTE
        ===================================================== */

        if (
            ride.pickupCoords &&
            ride.destCoords
        ) {

            drawRoute(
                ride.pickupCoords,
                ride.destCoords,
                ride.routeGeometry
            );
        }
    }


    /* =========================================================
       RESET UI
    ========================================================= */

    function resetUI() {

        if (routePickup) {
            routePickup.textContent = "-";
        }

        if (routeDestination) {
            routeDestination.textContent = "-";
        }

        if (routeDistance) {
            routeDistance.textContent = "-";
        }

        if (routeTime) {
            routeTime.textContent = "-";
        }

        if (routeVehicle) {
            routeVehicle.textContent = "-";
        }

        if (routeFare) {
            routeFare.textContent = "-";
        }

        if (routeDriver) {
            routeDriver.textContent = "-";
        }

        if (confirmationBookingId) {
            confirmationBookingId.textContent = "-";
        }

        if (confirmationOTP) {
            confirmationOTP.textContent = "-";
        }

        if (currentStatus) {

            currentStatus.textContent =
                "No Active Booking";

            updateStatusStyle(
                "No Active Booking"
            );
        }


        /* -----------------------------------------------------
           SHOW BOOKING FORM
        ----------------------------------------------------- */

        if (bookingFormSection) {

            bookingFormSection.style.display =
                "block";
        }


        if (bookRide) {

            bookRide.style.display =
                "flex";

            bookRide.disabled = false;
        }


        if (cancelRide) {

            cancelRide.style.display =
                "none";
        }


        clearMessage();

        clearMapRoute();


        /* -----------------------------------------------------
           RETURN MAP TO HYDERABAD
        ----------------------------------------------------- */

        if (map) {

            map.setView(
                [
                    DEFAULT_LAT,
                    DEFAULT_LNG
                ],
                DEFAULT_ZOOM
            );
        }
    }


    /* =========================================================
       CREATE BOOKING
    ========================================================= */

    async function createBooking() {

        const pickup =
            normalizeLocationName(
                pickupInput.value
            );


        const destination =
            normalizeLocationName(
                destinationInput.value
            );


        /* -----------------------------------------------------
           VALIDATE PICKUP
        ----------------------------------------------------- */

        if (!pickup) {

            showMessage(
                "Please enter your pickup location.",
                "error"
            );

            pickupInput.focus();

            return;
        }


        /* -----------------------------------------------------
           VALIDATE DESTINATION
        ----------------------------------------------------- */

        if (!destination) {

            showMessage(
                "Please enter your destination.",
                "error"
            );

            destinationInput.focus();

            return;
        }


        /* -----------------------------------------------------
           SAME LOCATION CHECK
        ----------------------------------------------------- */

        if (
            pickup.toLowerCase() ===
            destination.toLowerCase()
        ) {

            showMessage(
                "Pickup and destination cannot be the same.",
                "error"
            );

            return;
        }


        /* -----------------------------------------------------
           DISABLE BOOK BUTTON
        ----------------------------------------------------- */

        bookRide.disabled = true;


        showMessage(
            "Finding your pickup location...",
            "loading"
        );


        try {

            /* =================================================
               GEOCODE PICKUP
            ================================================= */

            const pickupCoords =
                await geocodeLocation(
                    pickup
                );


            showMessage(
                "Finding your destination...",
                "loading"
            );


            /* =================================================
               GEOCODE DESTINATION
            ================================================= */

            const destinationCoords =
                await geocodeLocation(
                    destination
                );


            showMessage(
                "Calculating road route...",
                "loading"
            );


            /* =================================================
               CALCULATE ROAD ROUTE
            ================================================= */

            const route =
                await calculateRoute(
                    pickupCoords,
                    destinationCoords
                );


            /* =================================================
               VEHICLE
            ================================================= */

            const vehicle =
                vehicleType.value;


            /* =================================================
               FARE
            ================================================= */

            const fare =
                calculateFare(
                    route.distanceKm,
                    vehicle
                );


            /* =================================================
               CREATE RIDE OBJECT
            ================================================= */

            const newRide = {

                bookingId:
                    generateBookingId(),

                riderName:
                    localStorage.getItem(
                        "riderName"
                    ) || "Rider",

                pickup:
                    pickup,

                destination:
                    destination,

                vehicle:
                    vehicle,

                distance:
                    formatDistance(
                        route.distanceKm
                    ),

                duration:
                    formatDuration(
                        route.durationMinutes
                    ),

                fare:
                    "₹" + fare,

                driverName:
                    "Searching for driver...",

                otp:
                    generateOTP(),

                status:
                    "Requested",

                /* ---------------------------------------------
                   EXACT PICKUP COORDINATES
                --------------------------------------------- */

                pickupCoords: {

                    lat:
                        pickupCoords.lat,

                    lng:
                        pickupCoords.lng
                },

                /* ---------------------------------------------
                   EXACT DESTINATION COORDINATES
                --------------------------------------------- */

                destCoords: {

                    lat:
                        destinationCoords.lat,

                    lng:
                        destinationCoords.lng
                },

                /* ---------------------------------------------
                   ACTUAL ROAD ROUTE
                --------------------------------------------- */

                routeGeometry:
                    route.geometry,

                createdAt:
                    new Date().toISOString()
            };


            /* =================================================
               SAVE RIDE
               
               Driver page reads the same object.
            ================================================= */

            localStorage.setItem(
                "activeRide",
                JSON.stringify(newRide)
            );


            /* =================================================
               DRAW ROUTE
            ================================================= */

            drawRoute(
                newRide.pickupCoords,
                newRide.destCoords,
                newRide.routeGeometry
            );


            /* =================================================
               DISPLAY RIDE
            ================================================= */

            renderRide(
                newRide
            );


            showMessage(
                "Ride requested successfully. Waiting for driver.",
                "success"
            );


        } catch (error) {

            console.error(
                "Booking error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to book the ride. Please try again.",
                "error"
            );

        } finally {

            bookRide.disabled = false;
        }
    }


    /* =========================================================
       CANCEL CURRENT RIDE
    ========================================================= */

    function cancelCurrentRide() {

        const savedRide =
            localStorage.getItem(
                "activeRide"
            );


        if (!savedRide) {

            resetUI();

            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this ride?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const ride =
                JSON.parse(
                    savedRide
                );


            /* -------------------------------------------------
               CHANGE STATUS
            ------------------------------------------------- */

            ride.status =
                "Cancelled";


            /* -------------------------------------------------
               SAVE CANCELLATION
               
               Keep it in localStorage so the driver
               can receive the cancellation.
            ------------------------------------------------- */

            localStorage.setItem(
                "activeRide",
                JSON.stringify(ride)
            );


            /* -------------------------------------------------
               UPDATE UI
            ------------------------------------------------- */

            renderRide(
                ride
            );


            showMessage(
                "Ride cancelled.",
                "success"
            );


        } catch (error) {

            console.error(
                "Cancel error:",
                error
            );

            localStorage.removeItem(
                "activeRide"
            );

            resetUI();
        }
    }


    /* =========================================================
       BOOK BUTTON
    ========================================================= */

    if (bookRide) {

        bookRide.addEventListener(
            "click",
            createBooking
        );
    }


    /* =========================================================
       CANCEL BUTTON
    ========================================================= */

    if (cancelRide) {

        cancelRide.addEventListener(
            "click",
            cancelCurrentRide
        );
    }


    /* =========================================================
       VEHICLE CHANGE
    ========================================================= */

    if (vehicleType) {

        vehicleType.addEventListener(
            "change",
            function () {

                clearMessage();
            }
        );
    }


    /* =========================================================
       STORAGE EVENT
       
       Synchronizes rider and driver tabs.
    ========================================================= */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key !== "activeRide"
            ) {
                return;
            }


            const updatedRide =
                localStorage.getItem(
                    "activeRide"
                );


            if (!updatedRide) {

                resetUI();

                return;
            }


            try {

                const ride =
                    JSON.parse(
                        updatedRide
                    );


                renderRide(
                    ride
                );


            } catch (error) {

                console.error(
                    "Unable to read updated ride:",
                    error
                );
            }
        }
    );


    /* =========================================================
       INITIALIZE MAP
    ========================================================= */

    initializeMap();


    /* =========================================================
       LOAD EXISTING BOOKING
    ========================================================= */

    const savedRide =
        localStorage.getItem(
            "activeRide"
        );


    if (savedRide) {

        try {

            const ride =
                JSON.parse(
                    savedRide
                );


            renderRide(
                ride
            );


        } catch (error) {

            console.error(
                "Invalid saved ride:",
                error
            );


            localStorage.removeItem(
                "activeRide"
            );


            resetUI();
        }

    } else {

        resetUI();
    }

});
