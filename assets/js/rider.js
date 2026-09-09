document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /* =========================================================
       API & BACKEND SERVICE CONFIGURATION
    ========================================================= */

    const API_BASE_URL = "https://ridesharing-backend-esyq.onrender.com";
    const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
    const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";
    const STORAGE_KEY = "activeRide";

    /* =========================================================
       DOM ELEMENTS
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
    const confirmationBookingId = document.getElementById("confirmationBookingId");
    const confirmationOTP = document.getElementById("confirmationOTP");
    const currentStatus = document.getElementById("currentStatus");
    const bookingMessage = document.getElementById("bookingMessage");

    const bookRide = document.getElementById("bookRide");
    const cancelRide = document.getElementById("cancelRide");
    const bookingFormSection = document.getElementById("bookingFormSection");

    /* =========================================================
       MAP & STATE VARIABLES
    ========================================================= */

    let map = null;
    let pickupMarker = null;
    let destinationMarker = null;
    let driverMarker = null;
    let routeLine = null;
    let socket = null;
    let activeRide = null;

    const DEFAULT_LAT = 17.3850;
    const DEFAULT_LNG = 78.4867;
    const DEFAULT_ZOOM = 12;

    const VEHICLE_RATES = {
        Mini: 12,
        Prime: 18,
        Auto: 10
    };

    /* Custom Map Markers */
    const driverIcon = typeof L !== "undefined" ? L.divIcon({
        className: 'custom-driver-icon',
        html: '<i class="fas fa-car" style="color: #10b981; font-size: 24px;"></i>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    }) : null;

    /* =========================================================
       SOCKET.IO REAL-TIME BACKEND CONNECTION
    ========================================================= */

    function initSocketConnection() {
        if (typeof io === "undefined") {
            console.warn("Socket.io library is not loaded in the HTML head.");
            return;
        }

        socket = io(API_BASE_URL, {
            transports: ["websocket", "polling"]
        });

        socket.on("connect", () => {
            console.log("Rider connected to live backend:", socket.id);
            if (activeRide && activeRide.bookingId) {
                socket.emit("joinRideRoom", { rideId: activeRide.bookingId });
            }
        });

        // Listen for Driver Acceptance
        socket.on("rideAccepted", (data) => {
            if (!activeRide) return;
            activeRide.status = "Accepted";
            activeRide.driverName = data.driverName || "Rahul Sharma";
            persistRideData();
            renderRide(activeRide);
            showMessage("Driver has accepted your request!", "success");
        });

        // Listen for Driver Location Updates
        socket.on("driverLocationUpdated", (data) => {
            if (data.lat && data.lng) {
                updateDriverMarker(data.lat, data.lng);
            }
        });

        // Listen for Ride Start
        socket.on("rideStarted", () => {
            if (!activeRide) return;
            activeRide.status = "In Progress";
            persistRideData();
            renderRide(activeRide);
            showMessage("Your trip has started!", "info");
        });

        // Listen for Ride Completion
        socket.on("rideCompleted", () => {
            if (!activeRide) return;
            activeRide.status = "Completed";
            persistRideData();
            renderRide(activeRide);
            showMessage("Trip completed! Thank you for riding.", "success");
        });

        // Listen for Driver Cancellation
        socket.on("rideDeclined", () => {
            if (!activeRide) return;
            activeRide.status = "Cancelled";
            persistRideData();
            renderRide(activeRide);
            showMessage("The driver declined or cancelled the trip.", "error");
        });

        socket.on("disconnect", () => {
            console.warn("Disconnected from backend server.");
        });
    }

    /* =========================================================
       MAP INITIALIZATION
    ========================================================= */

    function initializeMap() {
        const mapElement = document.getElementById("riderMap");
        if (!mapElement) {
            console.error("Map element #riderMap was not found.");
            return;
        }

        map = L.map("riderMap", {
            zoomControl: true,
            attributionControl: true
        }).setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);

        const mapLayer = L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,
                attribution: "&copy; OpenStreetMap contributors"
            }
        );

        const satelliteLayer = L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
                maxZoom: 19,
                attribution: "Tiles &copy; Esri"
            }
        );

        const hybridLabels = L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
            {
                maxZoom: 19,
                transparent: true,
                attribution: "Labels &copy; Esri"
            }
        );

        const hybridLayer = L.layerGroup([satelliteLayer, hybridLabels]);

        mapLayer.addTo(map);

        const baseMaps = {
            "Map": mapLayer,
            "Satellite": satelliteLayer,
            "Hybrid": hybridLayer
        };

        L.control.layers(baseMaps, null, {
            position: "topright",
            collapsed: false
        }).addTo(map);

        console.log("Rider map initialized successfully.");
    }

    /* =========================================================
       HELPERS & UTILITIES
    ========================================================= */

    function showMessage(message, type) {
        if (!bookingMessage) return;
        bookingMessage.textContent = message;
        bookingMessage.className = "message " + type;
    }

    function clearMessage() {
        if (!bookingMessage) return;
        bookingMessage.textContent = "";
        bookingMessage.className = "message";
    }

    function generateBookingId() {
        return "BK-" + Math.floor(100000 + Math.random() * 900000);
    }

    function generateOTP() {
        return String(Math.floor(1000 + Math.random() * 9000));
    }

    function normalizeLocationName(value) {
        return value.trim().replace(/\s+/g, " ");
    }

    function persistRideData() {
        if (activeRide) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(activeRide));
        }
    }

    /* =========================================================
       GEOCODING & ROUTING API SERVICES
    ========================================================= */

    async function geocodeLocation(location) {
        const url = `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(location)}&limit=1&addressdetails=1`;
        let response;
        try {
            response = await fetch(url, { headers: { "Accept": "application/json" } });
        } catch (error) {
            throw new Error("Unable to connect to the map service. Please check your internet connection.");
        }

        if (!response.ok) {
            throw new Error("Location service is currently unavailable.");
        }

        const results = await response.json();
        if (!results || results.length === 0) {
            throw new Error(`Location not found: "${location}". Please enter a more specific location.`);
        }

        const latitude = Number(results[0].lat);
        const longitude = Number(results[0].lon);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            throw new Error("The location service returned invalid coordinates.");
        }

        return {
            lat: latitude,
            lng: longitude,
            displayName: results[0].display_name
        };
    }

    async function calculateRoute(pickupCoords, destinationCoords) {
        const coordinates = `${pickupCoords.lng},${pickupCoords.lat};${destinationCoords.lng},${destinationCoords.lat}`;
        const url = `${OSRM_URL}/${coordinates}?overview=full&geometries=geojson`;

        let response;
        try {
            response = await fetch(url);
        } catch (error) {
            throw new Error("Unable to connect to the routing service. Please check your internet connection.");
        }

        if (!response.ok) {
            throw new Error("Unable to calculate the road route.");
        }

        const data = await response.json();
        if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
            throw new Error("No road route could be found between these locations.");
        }

        const route = data.routes[0];
        if (!route.geometry || !route.geometry.coordinates) {
            throw new Error("The routing service returned an invalid route.");
        }

        return {
            distanceKm: route.distance / 1000,
            durationMinutes: route.duration / 60,
            geometry: route.geometry
        };
    }

    function formatDistance(distanceKm) {
        return distanceKm < 1 ? Math.round(distanceKm * 1000) + " m" : distanceKm.toFixed(1) + " km";
    }

    function formatDuration(minutes) {
        const roundedMinutes = Math.max(1, Math.round(minutes));
        if (roundedMinutes < 60) return roundedMinutes + " mins";
        const hours = Math.floor(roundedMinutes / 60);
        const remainingMinutes = roundedMinutes % 60;
        if (remainingMinutes === 0) return hours + (hours === 1 ? " hour" : " hours");
        return hours + (hours === 1 ? " hour " : " hours ") + remainingMinutes + " mins";
    }

    function calculateFare(distanceKm, vehicle) {
        const rate = VEHICLE_RATES[vehicle] || VEHICLE_RATES.Mini;
        return Math.max(40, Math.round(distanceKm * rate));
    }

    /* =========================================================
       MAP ROUTE & MARKER DRAWING
    ========================================================= */

    function clearMapRoute() {
        if (!map) return;
        if (pickupMarker) { map.removeLayer(pickupMarker); pickupMarker = null; }
        if (destinationMarker) { map.removeLayer(destinationMarker); destinationMarker = null; }
        if (driverMarker) { map.removeLayer(driverMarker); driverMarker = null; }
        if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
    }

    function drawRoute(pickupCoords, destinationCoords, geometry) {
        if (!map) return;
        clearMapRoute();

        pickupMarker = L.marker([pickupCoords.lat, pickupCoords.lng])
            .addTo(map)
            .bindPopup("<strong>Pickup</strong>");

        destinationMarker = L.marker([destinationCoords.lat, destinationCoords.lng])
            .addTo(map)
            .bindPopup("<strong>Destination</strong>");

        if (geometry && Array.isArray(geometry.coordinates) && geometry.coordinates.length > 0) {
            const routeCoordinates = geometry.coordinates.map(coord => [coord[1], coord[0]]);
            routeLine = L.polyline(routeCoordinates, { weight: 5, opacity: 0.85, color: '#2563eb' }).addTo(map);
            map.fitBounds(routeLine.getBounds(), { padding: [35, 35] });
        } else {
            routeLine = L.polyline([[pickupCoords.lat, pickupCoords.lng], [destinationCoords.lat, destinationCoords.lng]], {
                weight: 5,
                opacity: 0.85,
                dashArray: "10, 10"
            }).addTo(map);
            map.fitBounds(routeLine.getBounds(), { padding: [35, 35] });
        }

        pickupMarker.openPopup();
    }

    function updateDriverMarker(lat, lng) {
        if (!map) return;
        if (!driverMarker) {
            driverMarker = L.marker([lat, lng], { icon: driverIcon || undefined })
                .addTo(map)
                .bindPopup("<strong>Driver Location</strong>");
        } else {
            driverMarker.setLatLng([lat, lng]);
        }
    }

    /* =========================================================
       STATUS STYLING & RENDERING
    ========================================================= */

    function updateStatusStyle(status) {
        if (!currentStatus) return;
        switch (status) {
            case "Requested":
                currentStatus.style.background = "#fef3c7";
                currentStatus.style.color = "#d97706";
                break;
            case "Accepted":
            case "Driver Arriving":
                currentStatus.style.background = "#e0f2fe";
                currentStatus.style.color = "#0369a1";
                break;
            case "In Progress":
                currentStatus.style.background = "#dbeafe";
                currentStatus.style.color = "#1d4ed8";
                break;
            case "Completed":
                currentStatus.style.background = "#dcfce7";
                currentStatus.style.color = "#15803d";
                break;
            case "Cancelled":
                currentStatus.style.background = "#fee2e2";
                currentStatus.style.color = "#b91c1c";
                break;
            default:
                currentStatus.style.background = "#f1f5f9";
                currentStatus.style.color = "#475569";
        }
    }

    function renderRide(ride) {
        if (!ride) {
            resetUI();
            return;
        }

        activeRide = ride;

        if (routePickup) routePickup.textContent = ride.pickup || "-";
        if (routeDestination) routeDestination.textContent = ride.destination || "-";
        if (routeDistance) routeDistance.textContent = ride.distance || "-";
        if (routeTime) routeTime.textContent = ride.duration || "-";
        if (routeVehicle) routeVehicle.textContent = ride.vehicle || "-";
        if (routeFare) routeFare.textContent = ride.fare || "-";
        if (routeDriver) routeDriver.textContent = ride.driverName || "Searching for driver...";
        if (confirmationBookingId) confirmationBookingId.textContent = ride.bookingId || "-";
        if (confirmationOTP) confirmationOTP.textContent = ride.otp || "-";

        if (currentStatus) {
            currentStatus.textContent = ride.status || "Requested";
            updateStatusStyle(ride.status);
        }

        if (ride.status === "Completed" || ride.status === "Cancelled") {
            if (bookingFormSection) bookingFormSection.style.display = "block";
            if (bookRide) bookRide.style.display = "flex";
            if (cancelRide) cancelRide.style.display = "none";
        } else {
            if (bookingFormSection) bookingFormSection.style.display = "none";
            if (bookRide) bookRide.style.display = "none";
            if (cancelRide) cancelRide.style.display = "flex";
        }

        if (ride.pickupCoords && ride.destCoords) {
            drawRoute(ride.pickupCoords, ride.destCoords, ride.routeGeometry);
        }
    }

    function resetUI() {
        activeRide = null;
        if (routePickup) routePickup.textContent = "-";
        if (routeDestination) routeDestination.textContent = "-";
        if (routeDistance) routeDistance.textContent = "-";
        if (routeTime) routeTime.textContent = "-";
        if (routeVehicle) routeVehicle.textContent = "-";
        if (routeFare) routeFare.textContent = "-";
        if (routeDriver) routeDriver.textContent = "-";
        if (confirmationBookingId) confirmationBookingId.textContent = "-";
        if (confirmationOTP) confirmationOTP.textContent = "-";

        if (currentStatus) {
            currentStatus.textContent = "No Active Booking";
            updateStatusStyle("No Active Booking");
        }

        if (bookingFormSection) bookingFormSection.style.display = "block";
        if (bookRide) {
            bookRide.style.display = "flex";
            bookRide.disabled = false;
        }
        if (cancelRide) cancelRide.style.display = "none";

        clearMessage();
        clearMapRoute();

        if (map) {
            map.setView([DEFAULT_LAT, DEFAULT_LNG], DEFAULT_ZOOM);
        }
    }

    /* =========================================================
       BOOKING ACTIONS
    ========================================================= */

    async function createBooking() {
        const pickup = normalizeLocationName(pickupInput.value);
        const destination = normalizeLocationName(destinationInput.value);

        if (!pickup) {
            showMessage("Please enter your pickup location.", "error");
            pickupInput.focus();
            return;
        }

        if (!destination) {
            showMessage("Please enter your destination.", "error");
            destinationInput.focus();
            return;
        }

        if (pickup.toLowerCase() === destination.toLowerCase()) {
            showMessage("Pickup and destination cannot be the same.", "error");
            return;
        }

        bookRide.disabled = true;
        showMessage("Finding your pickup location...", "loading");

        try {
            const pickupCoords = await geocodeLocation(pickup);
            showMessage("Finding your destination...", "loading");

            const destinationCoords = await geocodeLocation(destination);
            showMessage("Calculating road route...", "loading");

            const route = await calculateRoute(pickupCoords, destinationCoords);
            const vehicle = vehicleType.value;
            const fare = calculateFare(route.distanceKm, vehicle);

            const newRide = {
                rideId: generateBookingId(),
                bookingId: generateBookingId(),
                riderName: localStorage.getItem("riderName") || "Rider",
                pickup: pickup,
                destination: destination,
                vehicle: vehicle,
                distance: formatDistance(route.distanceKm),
                duration: formatDuration(route.durationMinutes),
                fare: "₹" + fare,
                driverName: "Searching for driver...",
                otp: generateOTP(),
                status: "Requested",
                pickupCoords: { lat: pickupCoords.lat, lng: pickupCoords.lng },
                destCoords: { lat: destinationCoords.lat, lng: destinationCoords.lng },
                routeGeometry: route.geometry,
                createdAt: new Date().toISOString()
            };

            persistRideData();
            renderRide(newRide);

            // Emit Real-Time Request to Backend Server
            if (socket) {
                socket.emit("requestRide", newRide);
            }

            showMessage("Ride requested successfully. Waiting for driver.", "success");

        } catch (error) {
            console.error("Booking error:", error);
            showMessage(error.message || "Unable to book the ride. Please try again.", "error");
        } finally {
            bookRide.disabled = false;
        }
    }

    function cancelCurrentRide() {
        const savedRide = localStorage.getItem(STORAGE_KEY);
        if (!savedRide) {
            resetUI();
            return;
        }

        if (!window.confirm("Are you sure you want to cancel this ride?")) {
            return;
        }

        try {
            const ride = JSON.parse(savedRide);
            ride.status = "Cancelled";

            persistRideData();
            renderRide(ride);

            if (socket) {
                socket.emit("cancelRide", { rideId: ride.bookingId || ride.rideId });
            }

            showMessage("Ride cancelled.", "success");
        } catch (error) {
            console.error("Cancel error:", error);
            localStorage.removeItem(STORAGE_KEY);
            resetUI();
        }
    }

    /* =========================================================
       EVENT LISTENERS & INITIALIZATION
    ========================================================= */

    if (bookRide) bookRide.addEventListener("click", createBooking);
    if (cancelRide) cancelRide.addEventListener("click", cancelCurrentRide);
    if (vehicleType) vehicleType.addEventListener("change", clearMessage);

    window.addEventListener("storage", function (event) {
        if (event.key !== STORAGE_KEY) return;
        const updatedRide = localStorage.getItem(STORAGE_KEY);
        if (!updatedRide) {
            resetUI();
            return;
        }
        try {
            renderRide(JSON.parse(updatedRide));
        } catch (error) {
            console.error("Unable to read updated ride:", error);
        }
    });

    initializeMap();
    initSocketConnection();

    const savedRide = localStorage.getItem(STORAGE_KEY);
    if (savedRide) {
        try {
            renderRide(JSON.parse(savedRide));
        } catch (error) {
            console.error("Invalid saved ride:", error);
            localStorage.removeItem(STORAGE_KEY);
            resetUI();
        }
    } else {
        resetUI();
    }
});
