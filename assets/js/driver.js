"use strict";

/* =========================================================
   SMART RIDE SHARING SYSTEM - DRIVER DASHBOARD (LEAFLET.JS & SOCKET.IO)
========================================================= */

// Live Backend Service URL
const API_BASE_URL = "https://ridesharing-backend-esyq.onrender.com";
const STORAGE_KEY = "activeRide";

/* Global Variables */
let socket = null;
let map = null;
let routingControl = null;
let pickupMarker = null;
let destinationMarker = null;
let driverMarker = null;
let activeRide = null;
let driverPosition = null;
let driverLocationWatchId = null;

/* DOM Element References */
let dutyToggle, dutyText;
let riderName, pickupLoc, destLoc, tripFare, rideStatus;
let otpBox, driverOtpInput;
let btnAccept, btnStart, btnComplete, btnDecline;
let btnMyLocation, btnRouteView, btnPickupView, btnDestinationView;
let mapMessage;

/* Safe DOM Query Helper */
function initDOM() {
    dutyToggle = document.getElementById("dutyToggle");
    dutyText = document.getElementById("dutyText");
    riderName = document.getElementById("riderName");
    pickupLoc = document.getElementById("pickupLoc");
    destLoc = document.getElementById("destLoc");
    tripFare = document.getElementById("tripFare");
    rideStatus = document.getElementById("rideStatus");
    otpBox = document.getElementById("otpBox");
    driverOtpInput = document.getElementById("driverOtpInput");

    btnAccept = document.getElementById("btnAccept");
    btnStart = document.getElementById("btnStart");
    btnComplete = document.getElementById("btnComplete");
    btnDecline = document.getElementById("btnDecline");

    btnMyLocation = document.getElementById("btnMyLocation");
    btnRouteView = document.getElementById("btnRouteView");
    btnPickupView = document.getElementById("btnPickupView");
    btnDestinationView = document.getElementById("btnDestinationView");

    mapMessage = document.getElementById("mapMessage");
}

/* Custom Marker Icons */
const driverIcon = L.divIcon({
    className: 'custom-driver-icon',
    html: '<i class="fas fa-location-arrow" style="color: #10b981; font-size: 24px; transform: rotate(-45deg);"></i>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const pickupIcon = L.divIcon({
    className: 'custom-pickup-icon',
    html: '<i class="fas fa-map-marker-alt" style="color: #2563eb; font-size: 28px;"></i>',
    iconSize: [28, 28],
    iconAnchor: [14, 28]
});

const destIcon = L.divIcon({
    className: 'custom-dest-icon',
    html: '<i class="fas fa-flag-checkered" style="color: #ef4444; font-size: 28px;"></i>',
    iconSize: [28, 28],
    iconAnchor: [14, 28]
});

/* =========================================================
   SOCKET.IO REAL-TIME BACKEND CONNECTION
========================================================= */
function initSocketConnection() {
    if (typeof io === "undefined") {
        console.warn("Socket.io script not loaded in HTML head.");
        return;
    }

    socket = io(API_BASE_URL, {
        transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
        console.log("Connected to Live Backend Server:", socket.id);
        socket.emit("driverOnline", { driverId: "DRIVER_001", status: "Online" });
    });

    socket.on("newRideRequest", (rideData) => {
        if (dutyToggle && !dutyToggle.checked) return;
        activeRide = rideData;
        persistRideData();
        renderDashboard(activeRide);
        alert(`New ride request from ${rideData.riderName || 'Rider'}!`);
    });

    socket.on("rideCancelled", (data) => {
        if (activeRide && activeRide.rideId === data.rideId) {
            alert("Rider cancelled this trip.");
            clearDashboard();
            localStorage.removeItem(STORAGE_KEY);
        }
    });

    socket.on("disconnect", () => {
        console.warn("Disconnected from Live Backend Server.");
    });
}

/* =========================================================
   LEAFLET MAP INITIALIZATION
========================================================= */
function initDriverMap() {
    initDOM();

    const mapElement = document.getElementById("driverMap");
    if (!mapElement) return;

    // Default center: Hyderabad [lat, lng]
    map = L.map('driverMap', {
        center: [17.3850, 78.4867],
        zoom: 13,
        zoomControl: true
    });

    // Free OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    setupMapControls();
    loadActiveRide();
    startDriverLocationTracking();
}

/* =========================================================
   MAP CONTROLS & UTILITIES
========================================================= */
function setupMapControls() {
    if (btnMyLocation) {
        btnMyLocation.onclick = () => {
            if (!map) return showMapMessage("Map not ready.");
            if (!driverPosition) return requestDriverLocation();
            map.setView(driverPosition, 16, { animate: true });
        };
    }

    if (btnRouteView) {
        btnRouteView.onclick = () => {
            if (activeRide && activeRide.pickupCoords && activeRide.destCoords) {
                renderMapRoute(activeRide);
            } else {
                showMapMessage("No route active.");
            }
        };
    }

    if (btnPickupView) {
        btnPickupView.onclick = () => {
            if (activeRide && activeRide.pickupCoords) {
                const pt = parseCoordinates(activeRide.pickupCoords);
                if (pt && map) { map.setView(pt, 17, { animate: true }); }
            } else {
                showMapMessage("Pickup location unavailable.");
            }
        };
    }

    if (btnDestinationView) {
        btnDestinationView.onclick = () => {
            if (activeRide && activeRide.destCoords) {
                const pt = parseCoordinates(activeRide.destCoords);
                if (pt && map) { map.setView(pt, 17, { animate: true }); }
            } else {
                showMapMessage("Destination unavailable.");
            }
        };
    }
}

function parseCoordinates(coords) {
    if (!coords) return null;
    const lat = parseFloat(coords.lat);
    const lng = parseFloat(coords.lng);
    return (!isNaN(lat) && !isNaN(lng)) ? [lat, lng] : null;
}

function showMapMessage(msg) {
    if (mapMessage) mapMessage.textContent = msg;
}

function clearRoute() {
    if (pickupMarker) { map.removeLayer(pickupMarker); pickupMarker = null; }
    if (destinationMarker) { map.removeLayer(destinationMarker); destinationMarker = null; }
    if (routingControl) { map.removeControl(routingControl); routingControl = null; }
}

function renderMapRoute(ride) {
    if (!map || !ride) return;
    const pickup = parseCoordinates(ride.pickupCoords);
    const destination = parseCoordinates(ride.destCoords);

    if (!pickup || !destination) {
        clearRoute();
        showMapMessage("Invalid route coordinates.");
        return;
    }

    clearRoute();

    // Add Markers
    pickupMarker = L.marker(pickup, { icon: pickupIcon }).addTo(map).bindPopup("Pickup");
    destinationMarker = L.marker(destination, { icon: destIcon }).addTo(map).bindPopup("Destination");

    // Add OSRM Road Navigation Routing
    if (typeof L.Routing !== "undefined" && L.Routing.control) {
        routingControl = L.Routing.control({
            waypoints: [
                L.latLng(pickup[0], pickup[1]),
                L.latLng(destination[0], destination[1])
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            show: false,
            lineOptions: {
                styles: [{ color: '#2563eb', opacity: 0.8, weight: 6 }]
            }
        }).addTo(map);
    }

    // Fit map view to bounds of the route
    const bounds = L.latLngBounds([pickup, destination]);
    map.fitBounds(bounds, { padding: [50, 50] });

    showMapMessage(`Route: ${ride.pickup || 'Pickup'} ➔ ${ride.destination || 'Destination'}`);
}

/* =========================================================
   GEOLOCATION & LIVE STREAMING
========================================================= */
function startDriverLocationTracking() {
    if (!navigator.geolocation) return;
    driverLocationWatchId = navigator.geolocation.watchPosition(
        (pos) => {
            driverPosition = [pos.coords.latitude, pos.coords.longitude];
            renderDriverMarker();
            if (socket && activeRide) {
                socket.emit("updateDriverLocation", {
                    rideId: activeRide.rideId,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
            }
        },
        (err) => console.warn("GPS tracking disabled or unavailable:", err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
}

function requestDriverLocation() {
    if (!navigator.geolocation) return alert("Geolocation isn't supported on this device.");
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            driverPosition = [pos.coords.latitude, pos.coords.longitude];
            renderDriverMarker();
            if (map) { map.setView(driverPosition, 16, { animate: true }); }
        },
        () => alert("Failed to fetch current location."),
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function renderDriverMarker() {
    if (!map || !driverPosition) return;
    if (!driverMarker) {
        driverMarker = L.marker(driverPosition, { icon: driverIcon, zIndexOffset: 1000 }).addTo(map).bindPopup("Driver Location");
    } else {
        driverMarker.setLatLng(driverPosition);
    }
}

/* =========================================================
   RIDE STATE & ACTIONS
========================================================= */
function fetchRideData() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
        return null;
    }
}

function persistRideData() {
    if (activeRide) localStorage.setItem(STORAGE_KEY, JSON.stringify(activeRide));
}

function updateStatusBadge(status) {
    if (!rideStatus) return;
    rideStatus.textContent = status;
    rideStatus.className = "badge-status " + (status.toLowerCase().replace(/\s+/g, '-'));
}

function renderDashboard(ride) {
    if (!ride) return clearDashboard();
    activeRide = ride;

    if (riderName) riderName.textContent = ride.riderName || "Rider";
    if (pickupLoc) pickupLoc.textContent = ride.pickup || "-";
    if (destLoc) destLoc.textContent = ride.destination || "-";
    if (tripFare) tripFare.textContent = ride.fare || "-";

    renderMapRoute(ride);
    const status = ride.status || "Requested";
    updateStatusBadge(status);

    if (btnAccept) btnAccept.disabled = true;
    if (btnStart) btnStart.disabled = true;
    if (btnComplete) btnComplete.disabled = true;
    if (btnDecline) btnDecline.disabled = true;

    if (status === "Requested") {
        if (btnAccept) btnAccept.disabled = false;
        if (btnDecline) btnDecline.disabled = false;
        if (otpBox) otpBox.style.display = "none";
    } else if (status === "Accepted") {
        if (btnStart) btnStart.disabled = false;
        if (otpBox) otpBox.style.display = "block";
    } else if (status === "In Progress") {
        if (btnComplete) btnComplete.disabled = false;
        if (otpBox) otpBox.style.display = "none";
    } else {
        if (otpBox) otpBox.style.display = "none";
    }
}

function clearDashboard() {
    activeRide = null;
    if (riderName) riderName.textContent = "Waiting for request...";
    if (pickupLoc) pickupLoc.textContent = "-";
    if (destLoc) destLoc.textContent = "-";
    if (tripFare) tripFare.textContent = "-";
    if (driverOtpInput) driverOtpInput.value = "";
    if (otpBox) otpBox.style.display = "none";

    if (btnAccept) btnAccept.disabled = true;
    if (btnStart) btnStart.disabled = true;
    if (btnComplete) btnComplete.disabled = true;
    if (btnDecline) btnDecline.disabled = true;

    clearRoute();
    updateStatusBadge(dutyToggle?.checked ? "Online / Idle" : "Offline");
    showMapMessage("Waiting for ride requests...");
}

function loadActiveRide() {
    const stored = fetchRideData();
    if (!stored || (dutyToggle && !dutyToggle.checked)) {
        clearDashboard();
        if (dutyToggle && !dutyToggle.checked) updateStatusBadge("Offline");
        return;
    }
    renderDashboard(stored);
}

/* Action Handlers */
function handleAccept() {
    if (!activeRide) return;
    activeRide.status = "Accepted";
    persistRideData();
    renderDashboard(activeRide);

    if (socket) {
        socket.emit("acceptRide", { rideId: activeRide.rideId, driverName: "Rahul Sharma" });
    }
}

function handleStart() {
    if (!activeRide) return;
    const inputOtp = driverOtpInput?.value.trim();
    if (!inputOtp) return alert("Please type the OTP given by the rider.");
    if (String(activeRide.otp) !== inputOtp) return alert("Incorrect OTP. Try again.");

    activeRide.status = "In Progress";
    persistRideData();
    renderDashboard(activeRide);

    if (socket) {
        socket.emit("startRide", { rideId: activeRide.rideId });
    }
}

function handleComplete() {
    if (!activeRide || !confirm("Complete this trip?")) return;
    activeRide.status = "Completed";
    persistRideData();
    renderDashboard(activeRide);

    if (socket) {
        socket.emit("completeRide", { rideId: activeRide.rideId });
    }
    localStorage.removeItem(STORAGE_KEY);
}

function handleDecline() {
    if (!activeRide || !confirm("Decline this ride request?")) return;
    activeRide.status = "Cancelled";
    activeRide.cancelledBy = "Driver";
    
    if (socket) {
        socket.emit("declineRide", { rideId: activeRide.rideId });
    }

    clearDashboard();
    localStorage.removeItem(STORAGE_KEY);
}

/* Bind DOM Event Listeners */
function setupButtonListeners() {
    if (btnAccept) btnAccept.onclick = handleAccept;
    if (btnStart) btnStart.onclick = handleStart;
    if (btnComplete) btnComplete.onclick = handleComplete;
    if (btnDecline) btnDecline.onclick = handleDecline;

    if (dutyToggle) {
        dutyToggle.onchange = () => {
            const isOnline = dutyToggle.checked;
            if (dutyText) {
                dutyText.textContent = isOnline 
                    ? "You are currently online and available." 
                    : "You are currently offline.";
            }
            if (socket) {
                socket.emit("toggleDutyStatus", { online: isOnline });
            }
            loadActiveRide();
        };
    }
}

/* DOM Ready Listener */
document.addEventListener("DOMContentLoaded", () => {
    initDOM();
    initSocketConnection();
    initDriverMap();
    setupButtonListeners();
    loadActiveRide();

    // Enable inter-tab synchronization
    window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY) loadActiveRide();
    });
});
