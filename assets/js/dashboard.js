"use strict";

/*
=========================================================
 SMART RIDESHARE - SUPER ADMIN DASHBOARD (dashboard.js)
=========================================================
 Compatibility: admin/dashboard.html
 Direct binding to DOM elements, localStorage persistence, 
 and real-time interface auto-refresh.
=========================================================
*/

/* =====================================================
   GLOBAL VARIABLES & STATE
===================================================== */
let activityChart = null;

let currentDriverSearch = "";
let currentAdminSearch = "";
let currentRiderSearch = "";
let currentLogSearch = "";

let editingDriverId = null;

/* =====================================================
   STORAGE HELPERS
===================================================== */
function readJSON(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        if (!value) return fallback;
        return JSON.parse(value);
    } catch (error) {
        console.error("Could not read storage key:", key, error);
        return fallback;
    }
}

function writeJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Could not write storage key:", key, error);
        return false;
    }
}

/* =====================================================
   ID GENERATOR & UTILITIES
===================================================== */
function generateId(prefix) {
    return (
        prefix +
        Date.now().toString().slice(-8) +
        Math.floor(Math.random() * 100)
    );
}

function escapeHTML(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeJS(value) {
    return String(value || "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
}

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString();
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.innerText = value;
    }
}

/* =====================================================
   DOM READY & INITIALIZATION
===================================================== */
document.addEventListener("DOMContentLoaded", function () {
    console.log("🚖 Smart RideShare Super Admin Dashboard Loaded.");
    initializeDashboard();
});

function initializeDashboard() {
    setupNavigation();
    setupHeaderButtons();
    setupDriverControls();
    setupAdminControls();
    setupRiderControls();
    setupRideControls();
    setupReportControls();
    setupLogControls();
    setupSettingsControls();
    setupModalControls();
    loadTheme();
    refreshEverything();
}

function refreshEverything() {
    loadDashboardStats();
    loadDrivers();
    loadAdmins();
    loadRiders();
    loadRides();
    loadLogs();
    loadReports();
    loadRecentActivity();
    createActivityChart();
    updateNotificationCount();
}

/* =====================================================
   NAVIGATION
===================================================== */
function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item[data-section]");
    navItems.forEach(function (button) {
        button.addEventListener("click", function () {
            const sectionId = this.dataset.section;
            showSection(sectionId);
            navItems.forEach((item) => item.classList.remove("active"));
            this.classList.add("active");
        });
    });

    const sectionLinks = document.querySelectorAll("[data-section-link]");
    sectionLinks.forEach(function (button) {
        button.addEventListener("click", function () {
            const sectionId = this.dataset.sectionLink;
            showSection(sectionId);
            navItems.forEach((item) => {
                item.classList.toggle("active", item.dataset.section === sectionId);
            });
        });
    });
}

function showSection(sectionId) {
    const sections = document.querySelectorAll(".page-section");
    sections.forEach(function (section) {
        section.classList.remove("active-section");
        section.style.display = "none";
    });

    const target = document.getElementById(sectionId);
    if (!target) {
        console.warn("Section element not found:", sectionId);
        return;
    }

    target.classList.add("active-section");
    target.style.display = "";

    const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
    if (navItem) {
        document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
        navItem.classList.add("active");
    }

    updatePageTitle(sectionId);

    switch (sectionId) {
        case "driversSection": loadDrivers(); break;
        case "ridersSection": loadRiders(); break;
        case "adminsSection": loadAdmins(); break;
        case "ridesSection": loadRides(); break;
        case "logsSection": loadLogs(); break;
        case "reportsSection": loadReports(); break;
    }
}

function updatePageTitle(sectionId) {
    const titles = {
        dashboardSection: ["Dashboard", "Monitor and manage your complete RideShare platform."],
        driversSection: ["Drivers", "Manage drivers, trips, status, and locations."],
        adminsSection: ["Admins", "Manage administrator accounts and permissions."],
        ridersSection: ["Riders", "View and manage rider accounts."],
        ridesSection: ["Trips", "Monitor rides, drivers, riders, and trip status."],
        reportsSection: ["Reports", "Review platform statistics and operational data."],
        logsSection: ["Activity Logs", "Monitor system activity and administrator actions."],
        settingsSection: ["Settings", "Configure your RideShare platform."]
    };

    const data = titles[sectionId];
    if (!data) return;

    setText("pageTitle", data[0]);
    setText("pageSubtitle", data[1]);
}

/* =====================================================
   HEADER ACTIONS
===================================================== */
function setupHeaderButtons() {
    const refresh = document.getElementById("refreshBtn");
    if (refresh) {
        refresh.addEventListener("click", function () {
            refreshEverything();
            addLog("REFRESH", "Super Admin", "Dashboard data manually refreshed.");
            showToast("Dashboard refreshed");
        });
    }

    const notification = document.getElementById("notificationBtn");
    if (notification) {
        notification.addEventListener("click", function () {
            const count = getNotificationCount();
            alert(`🔔 Notifications\n\n${count > 0 ? count + " active notification(s)." : "No new notifications."}`);
        });
    }

    const logout = document.getElementById("logoutBtn");
    if (logout) {
        logout.addEventListener("click", function () {
            if (!confirm("Are you sure you want to logout?")) return;
            localStorage.removeItem("adminLoggedIn");
            addLog("LOGOUT", "Super Admin", "Super Admin logged out.");
            showToast("Logged out");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 700);
        });
    }
}

/* =====================================================
   DRIVERS MANAGEMENT
===================================================== */
function getDrivers() {
    let drivers = readJSON("drivers", null);
    if (Array.isArray(drivers)) return drivers;

    const users = readJSON("users", []);
    if (Array.isArray(users)) {
        return users.filter((user) => String(user.role || user.userType || user.type || "").toLowerCase() === "driver");
    }
    return [];
}

function saveDrivers(drivers) {
    writeJSON("drivers", drivers);
}

function setupDriverControls() {
    const addBtn = document.getElementById("addDriverBtn");
    if (addBtn) addBtn.addEventListener("click", () => openDriverModal());

    const refreshBtn = document.getElementById("refreshDriversBtn");
    if (refreshBtn) refreshBtn.addEventListener("click", () => { loadDrivers(); showToast("Drivers refreshed"); });

    const searchInput = document.getElementById("driverSearch");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            currentDriverSearch = this.value.trim().toLowerCase();
            loadDrivers();
        });
    }
}

function loadDrivers() {
    const body = document.getElementById("driversTableBody");
    if (!body) return;

    let drivers = getDrivers();

    if (currentDriverSearch) {
        drivers = drivers.filter((driver) =>
            String(driver.id || "").toLowerCase().includes(currentDriverSearch) ||
            String(driver.name || "").toLowerCase().includes(currentDriverSearch) ||
            String(driver.email || "").toLowerCase().includes(currentDriverSearch) ||
            String(driver.phone || "").toLowerCase().includes(currentDriverSearch)
        );
    }

    body.innerHTML = "";

    if (drivers.length === 0) {
        body.innerHTML = `<tr><td colspan="6" class="table-loading">No drivers found.</td></tr>`;
        return;
    }

    drivers.forEach((driver) => {
        const row = document.createElement("tr");
        const driverRides = getRidesForDriver(driver);
        const activeRide = driverRides.find((ride) => isActiveRide(ride));
        const status = getDriverStatus(driver);

        row.innerHTML = `
            <td>${escapeHTML(driver.id || "-")}</td>
            <td>
                <strong>${escapeHTML(driver.name || "Unnamed Driver")}</strong>
                ${activeRide ? `<br><small>🚕 Ride: ${escapeHTML(activeRide.id || "-")}</small>` : ""}
            </td>
            <td>${escapeHTML(driver.email || "-")}</td>
            <td>${escapeHTML(driver.phone || "-")}</td>
            <td><span class="status-badge ${getStatusClass(status)}">${escapeHTML(status)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="secondary-button" onclick="editDriver('${escapeJS(driver.id)}')"><i class="fas fa-pen"></i> Edit</button>
                    ${isSuspended(driver) 
                        ? `<button class="secondary-button" onclick="unsuspendDriver('${escapeJS(driver.id)}')"><i class="fas fa-user-check"></i> Unsuspend</button>`
                        : `<button class="secondary-button" onclick="suspendDriver('${escapeJS(driver.id)}')"><i class="fas fa-user-slash"></i> Suspend</button>`
                    }
                    <button class="secondary-button" onclick="viewDriver('${escapeJS(driver.id)}')"><i class="fas fa-eye"></i> View</button>
                    <button class="secondary-button" onclick="removeDriver('${escapeJS(driver.id)}')"><i class="fas fa-trash"></i> Remove</button>
                </div>
            </td>
        `;
        body.appendChild(row);
    });
}

function isSuspended(driver) {
    return driver.suspended === true || String(driver.status).toLowerCase() === "suspended";
}

function getDriverStatus(driver) {
    if (isSuspended(driver)) return "Suspended";
    if (String(driver.status).toLowerCase() === "offline") return "Offline";
    if (String(driver.status).toLowerCase() === "online") return "Online";
    if (localStorage.getItem("driverOnline") === "false") return "Offline";
    return "Active";
}

function getStatusClass(status) {
    const val = String(status || "").toLowerCase();
    if (val === "suspended") return "cancelled";
    if (val === "offline") return "waiting";
    if (val === "online" || val === "active") return "completed";
    return "waiting";
}

function editDriver(id) {
    const driver = getDrivers().find((item) => String(item.id) === String(id));
    if (!driver) {
        showToast("Driver not found");
        return;
    }
    editingDriverId = driver.id;
    openDriverModal(driver);
}

function openDriverModal(driver = null) {
    editingDriverId = driver ? driver.id : null;
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    if (!title || !body) return;

    title.innerText = driver ? "Edit Driver" : "Add Driver";
    body.innerHTML = `
        <div class="form-group">
            <label>Driver Name</label>
            <input id="driverFormName" type="text" value="${escapeHTML(driver?.name || "")}" placeholder="Enter driver name">
        </div>
        <div class="form-group">
            <label>Email</label>
            <input id="driverFormEmail" type="email" value="${escapeHTML(driver?.email || "")}" placeholder="driver@email.com">
        </div>
        <div class="form-group">
            <label>Phone</label>
            <input id="driverFormPhone" type="tel" value="${escapeHTML(driver?.phone || "")}" placeholder="Phone number">
        </div>
        <div class="form-group">
            <label>Vehicle</label>
            <input id="driverFormVehicle" type="text" value="${escapeHTML(driver?.vehicle || driver?.vehicleName || "")}" placeholder="Vehicle name">
        </div>
        <div class="form-group">
            <label>Vehicle Number</label>
            <input id="driverFormVehicleNumber" type="text" value="${escapeHTML(driver?.vehicleNumber || "")}" placeholder="Vehicle registration">
        </div>
        <div class="form-group">
            <label>Vehicle Type</label>
            <input id="driverFormVehicleType" type="text" value="${escapeHTML(driver?.vehicleType || "")}" placeholder="Sedan / SUV / Hatchback">
        </div>
        <div class="form-group">
            <label>Rating</label>
            <input id="driverFormRating" type="number" min="0" max="5" step="0.1" value="${escapeHTML(driver?.rating || "5.0")}">
        </div>
        <div class="modal-actions">
            <button class="secondary-button" onclick="closeModal()">Cancel</button>
            <button class="primary-button" onclick="saveDriverForm()"><i class="fas fa-save"></i> ${driver ? "Save Changes" : "Add Driver"}</button>
        </div>
    `;
    openModal();
}

function saveDriverForm() {
    const name = document.getElementById("driverFormName")?.value.trim();
    const email = document.getElementById("driverFormEmail")?.value.trim();
    const phone = document.getElementById("driverFormPhone")?.value.trim();
    const vehicle = document.getElementById("driverFormVehicle")?.value.trim();
    const vehicleNumber = document.getElementById("driverFormVehicleNumber")?.value.trim();
    const vehicleType = document.getElementById("driverFormVehicleType")?.value.trim();
    const rating = document.getElementById("driverFormRating")?.value;

    if (!name) {
        alert("Please enter driver name.");
        return;
    }

    const drivers = getDrivers();

    if (editingDriverId !== null) {
        const index = drivers.findIndex((d) => String(d.id) === String(editingDriverId));
        if (index === -1) {
            alert("Driver not found.");
            return;
        }
        drivers[index] = {
            ...drivers[index],
            name, email, phone, vehicle,
            vehicleName: vehicle,
            vehicleNumber, vehicleType,
            rating: rating || "5.0"
        };
        saveDrivers(drivers);
        addLog("EDIT DRIVER", "Super Admin", "Updated driver: " + name);
        showToast("Driver updated successfully");
    } else {
        const newDriver = {
            id: generateId("DRV"),
            name, email, phone, vehicle,
            vehicleName: vehicle,
            vehicleNumber, vehicleType,
            rating: rating || "5.0",
            status: "Active",
            suspended: false,
            createdAt: new Date().toISOString()
        };
        drivers.push(newDriver);
        saveDrivers(drivers);
        addLog("ADD DRIVER", "Super Admin", "Added driver: " + name);
        showToast("Driver added successfully");
    }

    closeModal();
    refreshEverything();
}

function suspendDriver(id) {
    const drivers = getDrivers();
    const driver = drivers.find((item) => String(item.id) === String(id));
    if (!driver || !confirm(`Suspend driver ${driver.name}?`)) return;

    driver.suspended = true;
    driver.status = "Suspended";
    saveDrivers(drivers);
    addLog("SUSPEND DRIVER", "Super Admin", "Suspended driver: " + driver.name);
    showToast("Driver suspended");
    loadDrivers();
}

function unsuspendDriver(id) {
    const drivers = getDrivers();
    const driver = drivers.find((item) => String(item.id) === String(id));
    if (!driver) return;

    driver.suspended = false;
    driver.status = "Active";
    saveDrivers(drivers);
    addLog("UNSUSPEND DRIVER", "Super Admin", "Unsuspended driver: " + driver.name);
    showToast("Driver unsuspended");
    loadDrivers();
}

function removeDriver(id) {
    const drivers = getDrivers();
    const driver = drivers.find((item) => String(item.id) === String(id));
    if (!driver || !confirm(`Remove driver ${driver.name}?\nThis action cannot be undone.`)) return;

    const filtered = drivers.filter((item) => String(item.id) !== String(id));
    saveDrivers(filtered);

    const users = readJSON("users", []);
    if (Array.isArray(users)) {
        const updatedUsers = users.filter((u) => !(String(u.id || "") === String(id) && String(u.role || u.userType || "").toLowerCase() === "driver"));
        writeJSON("users", updatedUsers);
    }

    addLog("REMOVE DRIVER", "Super Admin", "Removed driver: " + driver.name);
    showToast("Driver removed");
    loadDrivers();
    loadDashboardStats();
    loadReports();
}

function viewDriver(id) {
    const driver = getDrivers().find((item) => String(item.id) === String(id));
    if (!driver) return;

    const rides = getRidesForDriver(driver);
    const activeRide = rides.find((ride) => isActiveRide(ride));
    const completed = rides.filter((r) => String(r.status || "").toLowerCase() === "completed").length;
    const location = getDriverLocation(driver, activeRide);

    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    if (!title || !body) return;

    title.innerText = "Driver Details";
    body.innerHTML = `
        <div class="driver-details">
            <h3>${escapeHTML(driver.name || "Unnamed Driver")}</h3>
            <p><strong>ID:</strong> ${escapeHTML(driver.id || "-")}</p>
            <p><strong>Email:</strong> ${escapeHTML(driver.email || "-")}</p>
            <p><strong>Phone:</strong> ${escapeHTML(driver.phone || "-")}</p>
            <p><strong>Status:</strong> ${escapeHTML(getDriverStatus(driver))}</p>
            <p><strong>Vehicle:</strong> ${escapeHTML(driver.vehicle || driver.vehicleName || "-")}</p>
            <p><strong>Vehicle Number:</strong> ${escapeHTML(driver.vehicleNumber || "-")}</p>
            <p><strong>Rating:</strong> ⭐ ${escapeHTML(driver.rating || "N/A")}</p>
            <p><strong>Total Trips:</strong> ${rides.length}</p>
            <p><strong>Completed Trips:</strong> ${completed}</p>
            <p><strong>Current Location:</strong> ${escapeHTML(location)}</p>
            <hr>
            <h3>Current Trip</h3>
            ${activeRide ? `
                <p><strong>Ride ID:</strong> ${escapeHTML(activeRide.id || "-")}</p>
                <p><strong>Rider:</strong> ${escapeHTML(activeRide.rider || "-")}</p>
                <p><strong>Pickup:</strong> ${escapeHTML(activeRide.pickup || "-")}</p>
                <p><strong>Destination:</strong> ${escapeHTML(activeRide.destination || "-")}</p>
                <p><strong>Status:</strong> ${escapeHTML(activeRide.status || "-")}</p>
            ` : `<p>No active trip.</p>`}
        </div>
        <div class="modal-actions">
            <button class="primary-button" onclick="closeModal()">Close</button>
        </div>
    `;
    openModal();
}

/* =====================================================
   ADMINS MANAGEMENT
===================================================== */
function getAdmins() {
    return readJSON("admins", []);
}

function setupAdminControls() {
    const addBtn = document.getElementById("addAdminBtn");
    if (addBtn) addBtn.addEventListener("click", () => openAdminModal());

    const searchInput = document.getElementById("adminSearch");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            currentAdminSearch = this.value.trim().toLowerCase();
            loadAdmins();
        });
    }
}

function loadAdmins() {
    const body = document.getElementById("adminsTableBody");
    if (!body) return;

    let admins = getAdmins();

    if (currentAdminSearch) {
        admins = admins.filter((admin) =>
            String(admin.name || "").toLowerCase().includes(currentAdminSearch) ||
            String(admin.email || "").toLowerCase().includes(currentAdminSearch) ||
            String(admin.phone || "").toLowerCase().includes(currentAdminSearch)
        );
    }

    body.innerHTML = "";

    if (!admins.length) {
        body.innerHTML = `<tr><td colspan="6" class="table-loading">No administrators found.</td></tr>`;
        return;
    }

    admins.forEach((admin) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHTML(admin.id || "-")}</td>
            <td>${escapeHTML(admin.name || "-")}</td>
            <td>${escapeHTML(admin.email || "-")}</td>
            <td>${escapeHTML(admin.phone || "-")}</td>
            <td>${escapeHTML(admin.status || "Active")}</td>
            <td>
                <button class="secondary-button" onclick="viewAdmin('${escapeJS(admin.id)}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
        body.appendChild(row);
    });
}

function openAdminModal() {
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    if (!title || !body) return;

    title.innerText = "Add Admin";
    body.innerHTML = `
        <div class="form-group">
            <label>Name</label>
            <input id="newAdminName" type="text" placeholder="Admin name">
        </div>
        <div class="form-group">
            <label>Email</label>
            <input id="newAdminEmail" type="email" placeholder="admin@email.com">
        </div>
        <div class="form-group">
            <label>Phone</label>
            <input id="newAdminPhone" type="tel" placeholder="Phone number">
        </div>
        <div class="modal-actions">
            <button class="secondary-button" onclick="closeModal()">Cancel</button>
            <button class="primary-button" onclick="saveNewAdmin()">Add Admin</button>
        </div>
    `;
    openModal();
}

function saveNewAdmin() {
    const name = document.getElementById("newAdminName")?.value.trim();
    const email = document.getElementById("newAdminEmail")?.value.trim();
    const phone = document.getElementById("newAdminPhone")?.value.trim();

    if (!name) {
        alert("Enter admin name.");
        return;
    }

    const admins = getAdmins();
    admins.push({
        id: generateId("ADM"),
        name, email, phone,
        status: "Active",
        createdAt: new Date().toISOString()
    });

    writeJSON("admins", admins);
    addLog("ADD ADMIN", "Super Admin", "Added administrator: " + name);
    closeModal();
    loadAdmins();
    loadDashboardStats();
    showToast("Admin added");
}

function viewAdmin(id) {
    const admin = getAdmins().find((item) => String(item.id) === String(id));
    if (!admin) return;
    alert(`Administrator\n\nName: ${admin.name || "-"}\nEmail: ${admin.email || "-"}\nPhone: ${admin.phone || "-"}\nStatus: ${admin.status || "Active"}`);
}

/* =====================================================
   RIDERS MANAGEMENT
===================================================== */
function getRiders() {
    return readJSON("riders", []);
}

function setupRiderControls() {
    const searchInput = document.getElementById("riderSearch");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            currentRiderSearch = this.value.trim().toLowerCase();
            loadRiders();
        });
    }
}

function loadRiders() {
    const body = document.getElementById("ridersTableBody");
    if (!body) return;

    let riders = getRiders();

    if (currentRiderSearch) {
        riders = riders.filter((rider) =>
            String(rider.name || "").toLowerCase().includes(currentRiderSearch) ||
            String(rider.email || "").toLowerCase().includes(currentRiderSearch) ||
            String(rider.phone || "").toLowerCase().includes(currentRiderSearch)
        );
    }

    body.innerHTML = "";

    if (!riders.length) {
        body.innerHTML = `<tr><td colspan="6" class="table-loading">No riders found.</td></tr>`;
        return;
    }

    riders.forEach((rider) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHTML(rider.id || "-")}</td>
            <td>${escapeHTML(rider.name || "-")}</td>
            <td>${escapeHTML(rider.email || "-")}</td>
            <td>${escapeHTML(rider.phone || "-")}</td>
            <td>${escapeHTML(rider.status || "Active")}</td>
            <td>
                <button class="secondary-button" onclick="viewRider('${escapeJS(rider.id)}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        `;
        body.appendChild(row);
    });
}

function viewRider(id) {
    const rider = getRiders().find((item) => String(item.id) === String(id));
    if (!rider) return;
    alert(`Rider Details\n\nName: ${rider.name || "-"}\nEmail: ${rider.email || "-"}\nPhone: ${rider.phone || "-"}\nStatus: ${rider.status || "Active"}`);
}

/* =====================================================
   RIDES / TRIPS MANAGEMENT
===================================================== */
function getAllRides() {
    const result = [];
    const keys = ["rides", "rideHistory", "allRides", "rideRequests"];

    keys.forEach((key) => {
        const data = readJSON(key, []);
        if (Array.isArray(data)) data.forEach((ride) => result.push(ride));
    });

    const activeRide = readJSON("activeRide", null);
    if (activeRide && typeof activeRide === "object") result.push(activeRide);

    const driverHistory = readJSON("driverRideHistory", []);
    if (Array.isArray(driverHistory)) driverHistory.forEach((ride) => result.push(ride));

    const unique = [];
    const seen = new Set();
    result.forEach((ride) => {
        const key = ride.id ? String(ride.id) : JSON.stringify(ride);
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(ride);
        }
    });

    return unique;
}

function setupRideControls() {
    // Auto-refresh via loadRides
}

function loadRides() {
    const body = document.getElementById("ridesTableBody");
    if (!body) return;

    const rides = getAllRides();
    body.innerHTML = "";

    if (!rides.length) {
        body.innerHTML = `<tr><td colspan="6" class="table-loading">No rides found.</td></tr>`;
        return;
    }

    rides.slice().reverse().forEach((ride) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHTML(ride.id || "-")}</td>
            <td>${escapeHTML(ride.rider || "-")}</td>
            <td>${ride.driver ? escapeHTML(ride.driver) : "<span>Searching...</span>"}</td>
            <td>${escapeHTML(ride.pickup || "-")}</td>
            <td>${escapeHTML(ride.destination || "-")}</td>
            <td>
                <span class="status-badge ${getRideStatusClass(ride.status)}">
                    ${escapeHTML(ride.status || "Pending")}
                </span>
            </td>
        `;
        body.appendChild(row);
    });
}

function getRideStatusClass(status) {
    const val = String(status || "").toLowerCase();
    if (val.includes("complete")) return "completed";
    if (val.includes("cancel")) return "cancelled";
    if (val.includes("start") || val.includes("progress")) return "started";
    if (val.includes("accept")) return "accepted";
    return "waiting";
}

function isActiveRide(ride) {
    if (!ride) return false;
    const status = String(ride.status || "").toLowerCase();
    return !(status === "completed" || status === "cancelled" || status === "rejected");
}

function getRidesForDriver(driver) {
    return getAllRides().filter((ride) => {
        const driverId = String(ride.driverId || "");
        const driverName = String(ride.driver || "").toLowerCase();
        return driverId === String(driver.id) || driverName === String(driver.name || "").toLowerCase();
    });
}

function getDriverLocation(driver, activeRide) {
    const lat = driver.latitude ?? driver.lat ?? activeRide?.driverLatitude ?? activeRide?.driverLat;
    const lng = driver.longitude ?? driver.lng ?? driver.lon ?? activeRide?.driverLongitude ?? activeRide?.driverLng;

    if (lat !== undefined && lng !== undefined) {
        return Number(lat).toFixed(5) + ", " + Number(lng).toFixed(5);
    }

    if (driver.location) {
        if (typeof driver.location === "string") return driver.location;
        if (driver.location.lat !== undefined && driver.location.lng !== undefined) {
            return Number(driver.location.lat).toFixed(5) + ", " + Number(driver.location.lng).toFixed(5);
        }
    }

    if (activeRide?.driverLocation) {
        if (typeof activeRide.driverLocation === "string") return activeRide.driverLocation;
        if (activeRide.driverLocation.lat !== undefined && activeRide.driverLocation.lng !== undefined) {
            return Number(activeRide.driverLocation.lat).toFixed(5) + ", " + Number(activeRide.driverLocation.lng).toFixed(5);
        }
    }

    return "Location unavailable";
}

/* =====================================================
   DASHBOARD STATS
===================================================== */
function loadDashboardStats() {
    const drivers = getDrivers();
    const riders = getRiders();
    const admins = getAdmins();
    const rides = getAllRides();
    const logs = getLogs();
    const totalUsers = riders.length + drivers.length + admins.length;

    setText("totalUsers", totalUsers);
    setText("totalDrivers", drivers.length);
    setText("totalRides", rides.length);
    setText("totalLogs", logs.length);

    const activeDrivers = drivers.filter((d) => !isSuspended(d)).length;
    setText("activeUsers", activeDrivers);
    setText("totalNotifications", getNotificationCount());

    setText("reportUsers", totalUsers);
    setText("reportDrivers", drivers.length);
    setText("reportRides", rides.length);
    setText("reportLogs", logs.length);
}

/* =====================================================
   LOGS & ACTIVITY
===================================================== */
function getLogs() {
    return readJSON("activityLogs", []);
}

function addLog(action, user, description) {
    const logs = getLogs();
    logs.push({
        id: generateId("LOG"),
        time: new Date().toISOString(),
        action, user, description
    });

    if (logs.length > 500) logs.splice(0, logs.length - 500);
    writeJSON("activityLogs", logs);
}

function setupLogControls() {
    const refresh = document.getElementById("refreshLogsBtn");
    if (refresh) {
        refresh.addEventListener("click", () => {
            loadLogs();
            loadRecentActivity();
            showToast("Logs refreshed");
        });
    }

    const search = document.getElementById("logSearch");
    if (search) {
        search.addEventListener("input", function () {
            currentLogSearch = this.value.trim().toLowerCase();
            loadLogs();
        });
    }
}

function loadLogs() {
    const body = document.getElementById("logsTableBody");
    if (!body) return;

    let logs = getLogs();
    if (currentLogSearch) {
        logs = logs.filter((log) =>
            String(log.action || "").toLowerCase().includes(currentLogSearch) ||
            String(log.user || "").toLowerCase().includes(currentLogSearch) ||
            String(log.description || "").toLowerCase().includes(currentLogSearch)
        );
    }

    body.innerHTML = "";
    logs.slice().reverse().forEach((log) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHTML(formatDate(log.time))}</td>
            <td>${escapeHTML(log.action || "-")}</td>
            <td>${escapeHTML(log.user || "-")}</td>
            <td>${escapeHTML(log.description || "-")}</td>
        `;
        body.appendChild(row);
    });

    if (!body.children.length) {
        body.innerHTML = `<tr><td colspan="4" class="table-loading">No logs found.</td></tr>`;
    }
}

function loadRecentActivity() {
    const container = document.getElementById("recentActivity");
    if (!container) return;

    const logs = getLogs().slice().reverse().slice(0, 8);
    if (!logs.length) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-clock"></i><p>No activity recorded yet.</p></div>`;
        return;
    }

    container.innerHTML = "";
    logs.forEach((log) => {
        const item = document.createElement("div");
        item.className = "activity-item";
        item.innerHTML = `
            <div>
                <strong>${escapeHTML(log.action || "Activity")}</strong>
                <p>${escapeHTML(log.description || "")}</p>
                <small>${formatDate(log.time)}</small>
            </div>
        `;
        container.appendChild(item);
    });
}

/* =====================================================
   REPORTS
===================================================== */
function setupReportControls() {
    // Direct binding for reports view
}

function loadReports() {
    const drivers = getDrivers();
    const riders = getRiders();
    const rides = getAllRides();
    const logs = getLogs();

    setText("reportUsers", drivers.length + riders.length);
    setText("reportDrivers", drivers.length);
    setText("reportRides", rides.length);
    setText("reportLogs", logs.length);

    const completed = rides.filter((r) => String(r.status || "").toLowerCase() === "completed");
    const cancelled = rides.filter((r) => String(r.status || "").toLowerCase() === "cancelled");
    const active = rides.filter((r) => isActiveRide(r));
    const earnings = completed.reduce((sum, r) => sum + (Number(r.fare) || 0), 0);

    const summary = document.getElementById("reportSummary");
    if (summary) {
        summary.innerHTML = `
            <div class="report-grid">
                <div><strong>${drivers.length}</strong><span>Drivers</span></div>
                <div><strong>${riders.length}</strong><span>Riders</span></div>
                <div><strong>${rides.length}</strong><span>Total Trips</span></div>
                <div><strong>${active.length}</strong><span>Active Trips</span></div>
                <div><strong>${completed.length}</strong><span>Completed</span></div>
                <div><strong>${cancelled.length}</strong><span>Cancelled</span></div>
                <div><strong>₹${earnings}</strong><span>Recorded Fare</span></div>
                <div><strong>${logs.length}</strong><span>Activities</span></div>
            </div>
        `;
    }
}

/* =====================================================
   CHART.JS INTEGRATION
===================================================== */
function createActivityChart() {
    const canvas = document.getElementById("activityChart");
    if (!canvas) return;
    if (typeof Chart === "undefined") {
        console.warn("Chart.js library is not loaded.");
        return;
    }

    const drivers = getDrivers();
    const riders = getRiders();
    const rides = getAllRides();
    const logs = getLogs();

    if (activityChart) activityChart.destroy();

    activityChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: ["Drivers", "Riders", "Trips", "Logs"],
            datasets: [{
                label: "Platform Activity",
                data: [drivers.length, riders.length, rides.length, logs.length]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
    });
}

/* =====================================================
   NOTIFICATIONS
===================================================== */
function getNotificationCount() {
    const notifications = readJSON("notifications", []);
    if (Array.isArray(notifications) && notifications.length > 0) {
        return notifications.length;
    }

    let count = 0;
    count += getDrivers().filter((d) => isSuspended(d)).length;
    count += getAllRides().filter((r) => !r.driver && isActiveRide(r)).length;
    return count;
}

function updateNotificationCount() {
    setText("totalNotifications", getNotificationCount());
}

/* =====================================================
   SETTINGS & SYSTEM ACTIONS
===================================================== */
function setupSettingsControls() {
    const darkBtn = document.getElementById("darkModeBtn");
    const settingsDark = document.getElementById("settingsDarkMode");
    if (darkBtn) darkBtn.addEventListener("click", toggleDarkMode);
    if (settingsDark) settingsDark.addEventListener("click", toggleDarkMode);

    const dbBtn = document.getElementById("databaseStatusBtn");
    if (dbBtn) {
        dbBtn.addEventListener("click", function () {
            alert(`🟢 Local Database Status\n\nStorage: Browser LocalStorage\nDrivers: ${getDrivers().length}\nRiders: ${getRiders().length}\nRides: ${getAllRides().length}\n\nDatabase is online and functional.`);
        });
    }

    const secBtn = document.getElementById("securityBtn");
    if (secBtn) {
        secBtn.addEventListener("click", function () {
            alert("🔐 Security\n\nSuper Admin dashboard is active.\nNote: Server authorization required in production environments.");
        });
    }

    const backupBtn = document.getElementById("backupBtn");
    if (backupBtn) backupBtn.addEventListener("click", createBackup);

    const exportBtn = document.getElementById("exportReportBtn");
    if (exportBtn) exportBtn.addEventListener("click", exportReportData);
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const enabled = document.body.classList.contains("dark-mode");
    localStorage.setItem("adminDarkMode", enabled ? "true" : "false");
    showToast(enabled ? "Dark mode enabled" : "Light mode enabled");
}

function loadTheme() {
    if (localStorage.getItem("adminDarkMode") === "true") {
        document.body.classList.add("dark-mode");
    }
}

function exportReportData() {
    const data = {
        generatedAt: new Date().toISOString(),
        drivers: getDrivers(),
        riders: getRiders(),
        admins: getAdmins(),
        rides: getAllRides(),
        logs: getLogs()
    };

    downloadFile("rideshare-report.json", JSON.stringify(data, null, 2), "application/json");
    addLog("EXPORT REPORT", "Super Admin", "Exported system platform report.");
    showToast("Report exported");
}

function createBackup() {
    const backup = {
        backupDate: new Date().toISOString(),
        localStorage: {}
    };

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        backup.localStorage[key] = localStorage.getItem(key);
    }

    downloadFile("rideshare-backup.json", JSON.stringify(backup, null, 2), "application/json");
    addLog("BACKUP", "Super Admin", "Created local dashboard data backup.");
    showToast("Backup created");
}

function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

/* =====================================================
   MODAL DIALOG CONTROLS
===================================================== */
function setupModalControls() {
    const closeBtn = document.getElementById("closeModal");
    const overlay = document.getElementById("modalOverlay");

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (overlay) {
        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) closeModal();
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closeModal();
    });
}

function openModal() {
    const overlay = document.getElementById("modalOverlay");
    if (!overlay) return;
    overlay.classList.add("show");
    overlay.style.display = "flex";
}

function closeModal() {
    const overlay = document.getElementById("modalOverlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    overlay.style.display = "none";
    editingDriverId = null;
}

/* =====================================================
   TOAST NOTIFICATIONS
===================================================== */
function showToast(message) {
    const toast = document.getElementById("toast");
    const messageElement = document.getElementById("toastMessage");
    if (!toast) return;

    if (messageElement) messageElement.innerText = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

/* =====================================================
   AUTOMATIC PERIODIC REFRESH
===================================================== */
setInterval(function () {
    loadDashboardStats();
    loadDrivers();
    loadRides();
    loadRecentActivity();
    loadReports();
    updateNotificationCount();
}, 3000);

/* =====================================================
   EXPOSE GLOBAL FUNCTIONS FOR INLINE ONCLICK EVENT HANDLERS
===================================================== */
window.editDriver = editDriver;
window.suspendDriver = suspendDriver;
window.unsuspendDriver = unsuspendDriver;
window.removeDriver = removeDriver;
window.viewDriver = viewDriver;
window.viewRider = viewRider;
window.viewAdmin = viewAdmin;
window.saveDriverForm = saveDriverForm;
window.saveNewAdmin = saveNewAdmin;
window.closeModal = closeModal;

/* =====================================================
   SYSTEM INITIALIZATION LOG
===================================================== */
if (!localStorage.getItem("superAdminInitialized")) {
    addLog("SYSTEM", "Super Admin", "Super Admin dashboard initialized.");
    localStorage.setItem("superAdminInitialized", "true");
}

console.log("✅ Smart RideShare Super Admin JavaScript ready.");
