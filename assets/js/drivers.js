"use strict";

/*
=========================================================
 SMART RIDESHARE - DRIVER MANAGEMENT
 drivers.js
=========================================================

 Works with:
     admin/drivers.html

 Backend:
     http://localhost:3000

 Features:
     ✔ Load drivers from backend
     ✔ Add driver
     ✔ Edit driver
     ✔ Active / Suspended
     ✔ Delete driver
     ✔ Search
     ✔ Filter
     ✔ View details
     ✔ Send warning/news
     ✔ Refresh
     ✔ Statistics
     ✔ Notifications
     ✔ Navigation
     ✔ No driver photos required
=========================================================
*/

const API_BASE = "http://localhost:3000/api";

let drivers = [];
let selectedDriver = null;


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    console.log("🚖 Drivers Management Loaded");

    initializeDriversPage();

});


/* =====================================================
   INITIALIZE
===================================================== */

async function initializeDriversPage() {

    setupNavigation();
    setupButtons();
    setupSearch();
    setupFilters();

    await loadDrivers();

}


/* =====================================================
   LOAD DRIVERS
===================================================== */

async function loadDrivers() {

    showTableMessage("Loading drivers...");

    try {

        /*
         Expected backend:
         GET /api/drivers
        */

        const response = await fetch(
            `${API_BASE}/drivers`
        );

        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }

        const data = await response.json();

        if (Array.isArray(data)) {

            drivers = data;

        } else if (Array.isArray(data.drivers)) {

            drivers = data.drivers;

        } else {

            drivers = [];

        }


        /*
        If database has no drivers,
        create example drivers.
        */

        if (drivers.length === 0) {

            await createExampleDrivers();

            return;

        }


        renderDrivers();

        updateStatistics();

    }

    catch (error) {

        console.error(
            "Driver loading error:",
            error
        );

        /*
        Show examples if backend endpoint
        isn't available yet.
        */

        drivers = getExampleDrivers();

        renderDrivers();
        updateStatistics();

        showToast(
            "Backend driver API is not available. Showing example drivers.",
            "warning"
        );

    }

}


/* =====================================================
   EXAMPLE DRIVERS
===================================================== */

function getExampleDrivers() {

    return [

        {
            id: "DRV001",
            name: "Rahul Sharma",
            email: "rahul.sharma@rideshare.com",
            phone: "9876543210",
            vehicle: "Maruti Suzuki Dzire",
            vehicleNumber: "TS09AB1234",
            license: "TS09 20260012345",
            status: "active",
            rating: 4.8,
            trips: 324,
            createdAt: "2026-07-01T10:00:00.000Z"
        },

        {
            id: "DRV002",
            name: "Arjun Kumar",
            email: "arjun.kumar@rideshare.com",
            phone: "9123456780",
            vehicle: "Hyundai i20",
            vehicleNumber: "TS10CD5678",
            license: "TS10 20260056789",
            status: "active",
            rating: 4.7,
            trips: 287,
            createdAt: "2026-07-05T10:00:00.000Z"
        },

        {
            id: "DRV003",
            name: "Vikram Reddy",
            email: "vikram.reddy@rideshare.com",
            phone: "9988776655",
            vehicle: "Tata Nexon",
            vehicleNumber: "TS11EF9012",
            license: "TS11 20260090123",
            status: "suspended",
            rating: 4.2,
            trips: 198,
            createdAt: "2026-07-08T10:00:00.000Z"
        },

        {
            id: "DRV004",
            name: "Karthik Rao",
            email: "karthik.rao@rideshare.com",
            phone: "9012345678",
            vehicle: "Honda Amaze",
            vehicleNumber: "TS12GH3456",
            license: "TS12 20260123456",
            status: "active",
            rating: 4.9,
            trips: 412,
            createdAt: "2026-07-12T10:00:00.000Z"
        },

        {
            id: "DRV005",
            name: "Suresh Babu",
            email: "suresh.babu@rideshare.com",
            phone: "9345678123",
            vehicle: "Toyota Etios",
            vehicleNumber: "TS13IJ7890",
            license: "TS13 20260156789",
            status: "active",
            rating: 4.6,
            trips: 256,
            createdAt: "2026-07-15T10:00:00.000Z"
        },

        {
            id: "DRV006",
            name: "Manoj Kumar",
            email: "manoj.kumar@rideshare.com",
            phone: "8899776655",
            vehicle: "Mahindra XUV300",
            vehicleNumber: "TS14KL1234",
            license: "TS14 20260189012",
            status: "active",
            rating: 4.5,
            trips: 176,
            createdAt: "2026-07-18T10:00:00.000Z"
        }

    ];

}


/* =====================================================
   CREATE EXAMPLE DRIVERS
===================================================== */

async function createExampleDrivers() {

    const examples =
        getExampleDrivers();

    /*
    We display them immediately.

    They will become real database
    records once the backend supports
    POST /api/drivers.
    */

    drivers = examples;

    renderDrivers();
    updateStatistics();

}


/* =====================================================
   RENDER DRIVERS
===================================================== */

function renderDrivers(list = drivers) {

    const tbody =
        document.getElementById(
            "driversTableBody"
        );

    if (!tbody) {

        console.error(
            "driversTableBody not found."
        );

        return;

    }


    if (!list.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-table"
                >

                    <div class="empty-state">

                        <i class="fas fa-user-slash"></i>

                        <h3>
                            No drivers found
                        </h3>

                        <p>
                            No drivers match your search.
                        </p>

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        list.map(
            driver => createDriverRow(driver)
        ).join("");


    attachRowEvents();

}


/* =====================================================
   DRIVER ROW
===================================================== */

function createDriverRow(driver) {

    const status =
        normalizeStatus(
            driver.status
        );


    const statusClass =
        status === "active"
            ? "status-active"
            : "status-suspended";


    const statusText =
        status === "active"
            ? "Active"
            : "Suspended";


    return `

        <tr
            data-driver-id="${escapeHTML(driver.id)}"
        >

            <td>

                <strong>
                    ${escapeHTML(driver.id)}
                </strong>

            </td>


            <td>

                <div class="driver-name-cell">

                    <div class="driver-avatar">
                        <i class="fas fa-user"></i>
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(driver.name)}
                        </strong>

                        <small>
                            ${escapeHTML(
                                driver.vehicle || "Vehicle not assigned"
                            )}
                        </small>

                    </div>

                </div>

            </td>


            <td>

                ${escapeHTML(
                    driver.email || "-"
                )}

            </td>


            <td>

                ${escapeHTML(
                    driver.phone || "-"
                )}

            </td>


            <td>

                <span
                    class="status-badge ${statusClass}"
                >

                    <i class="fas fa-circle"></i>

                    ${statusText}

                </span>

            </td>


            <td>

                <div class="driver-actions">

                    <button
                        class="action-btn view-btn"
                        data-action="view"
                        data-id="${escapeHTML(driver.id)}"
                        title="View Driver"
                    >

                        <i class="fas fa-eye"></i>

                    </button>


                    <button
                        class="action-btn edit-btn"
                        data-action="edit"
                        data-id="${escapeHTML(driver.id)}"
                        title="Edit Driver"
                    >

                        <i class="fas fa-pen"></i>

                    </button>


                    <button
                        class="action-btn status-btn"
                        data-action="status"
                        data-id="${escapeHTML(driver.id)}"
                        title="${
                            status === "active"
                                ? "Suspend Driver"
                                : "Activate Driver"
                        }"
                    >

                        <i class="fas ${
                            status === "active"
                                ? "fa-ban"
                                : "fa-check"
                        }"></i>

                    </button>


                    <button
                        class="action-btn warning-btn"
                        data-action="warning"
                        data-id="${escapeHTML(driver.id)}"
                        title="Send Warning"
                    >

                        <i class="fas fa-bell"></i>

                    </button>


                    <button
                        class="action-btn delete-btn"
                        data-action="delete"
                        data-id="${escapeHTML(driver.id)}"
                        title="Delete Driver"
                    >

                        <i class="fas fa-trash"></i>

                    </button>

                </div>

            </td>

        </tr>

    `;

}


/* =====================================================
   ATTACH ROW EVENTS
===================================================== */

function attachRowEvents() {

    const buttons =
        document.querySelectorAll(
            "[data-action]"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            handleDriverAction
        );

    });

}


/* =====================================================
   DRIVER ACTION HANDLER
===================================================== */

function handleDriverAction(event) {

    const button =
        event.currentTarget;

    const action =
        button.dataset.action;

    const id =
        button.dataset.id;


    const driver =
        findDriver(id);


    if (!driver) {

        showToast(
            "Driver not found.",
            "error"
        );

        return;

    }


    selectedDriver = driver;


    switch (action) {

        case "view":
            viewDriver(driver);
            break;

        case "edit":
            editDriver(driver);
            break;

        case "status":
            toggleDriverStatus(driver);
            break;

        case "warning":
            sendDriverWarning(driver);
            break;

        case "delete":
            deleteDriver(driver);
            break;

        default:
            console.warn(
                "Unknown action:",
                action
            );

    }

}


/* =====================================================
   FIND DRIVER
===================================================== */

function findDriver(id) {

    return drivers.find(
        driver =>
            String(driver.id) === String(id)
    );

}


/* =====================================================
   VIEW DRIVER
===================================================== */

function viewDriver(driver) {

    openModal(
        "Driver Details",
        `

        <div class="driver-details">

            <div class="details-header">

                <div class="large-driver-avatar">

                    <i class="fas fa-user"></i>

                </div>

                <div>

                    <h3>
                        ${escapeHTML(driver.name)}
                    </h3>

                    <span>
                        ${escapeHTML(driver.id)}
                    </span>

                </div>

            </div>


            <div class="details-grid">

                ${detailItem(
                    "Email",
                    driver.email
                )}

                ${detailItem(
                    "Phone",
                    driver.phone
                )}

                ${detailItem(
                    "Vehicle",
                    driver.vehicle
                )}

                ${detailItem(
                    "Vehicle Number",
                    driver.vehicleNumber
                )}

                ${detailItem(
                    "Driving License",
                    driver.license
                )}

                ${detailItem(
                    "Rating",
                    driver.rating
                        ? `${driver.rating} / 5`
                        : "Not rated"
                )}

                ${detailItem(
                    "Completed Trips",
                    driver.trips || 0
                )}

                ${detailItem(
                    "Status",
                    normalizeStatus(driver.status) === "active"
                        ? "Active"
                        : "Suspended"
                )}

            </div>


            <div class="modal-actions">

                <button
                    class="primary-button"
                    onclick="editDriverFromModal('${escapeHTML(driver.id)}')"
                >

                    <i class="fas fa-pen"></i>

                    Edit Profile

                </button>


                <button
                    class="secondary-button"
                    onclick="sendWarningFromModal('${escapeHTML(driver.id)}')"
                >

                    <i class="fas fa-bell"></i>

                    Send Warning

                </button>

            </div>

        </div>

        `
    );

}


/* =====================================================
   DETAIL ITEM
===================================================== */

function detailItem(label, value) {

    return `

        <div class="detail-item">

            <span>
                ${escapeHTML(label)}
            </span>

            <strong>
                ${escapeHTML(
                    value === undefined ||
                    value === null ||
                    value === ""
                        ? "-"
                        : String(value)
                )}
            </strong>

        </div>

    `;

}


/* =====================================================
   EDIT DRIVER
===================================================== */

function editDriver(driver) {

    openModal(
        "Edit Driver Profile",
        getDriverFormHTML(driver)
    );


    const form =
        document.getElementById(
            "driverForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                await saveDriverChanges(
                    driver
                );

            }
        );

    }

}


/* =====================================================
   DRIVER FORM
===================================================== */

function getDriverFormHTML(driver = {}) {

    return `

        <form id="driverForm">

            <div class="form-grid">

                <div class="form-group">

                    <label>
                        Full Name
                    </label>

                    <input
                        type="text"
                        id="driverName"
                        value="${escapeAttribute(
                            driver.name || ""
                        )}"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        id="driverEmail"
                        value="${escapeAttribute(
                            driver.email || ""
                        )}"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>
                        Phone
                    </label>

                    <input
                        type="tel"
                        id="driverPhone"
                        value="${escapeAttribute(
                            driver.phone || ""
                        )}"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>
                        Vehicle
                    </label>

                    <input
                        type="text"
                        id="driverVehicle"
                        value="${escapeAttribute(
                            driver.vehicle || ""
                        )}"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Vehicle Number
                    </label>

                    <input
                        type="text"
                        id="driverVehicleNumber"
                        value="${escapeAttribute(
                            driver.vehicleNumber || ""
                        )}"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Driving License
                    </label>

                    <input
                        type="text"
                        id="driverLicense"
                        value="${escapeAttribute(
                            driver.license || ""
                        )}"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Status
                    </label>

                    <select id="driverStatus">

                        <option
                            value="active"
                            ${
                                normalizeStatus(driver.status)
                                === "active"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Active
                        </option>

                        <option
                            value="suspended"
                            ${
                                normalizeStatus(driver.status)
                                === "suspended"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Suspended
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Rating
                    </label>

                    <input
                        type="number"
                        id="driverRating"
                        min="0"
                        max="5"
                        step="0.1"
                        value="${escapeAttribute(
                            driver.rating || 0
                        )}"
                    >

                </div>

            </div>


            <div class="modal-actions">

                <button
                    type="button"
                    class="secondary-button"
                    id="cancelDriverEdit"
                >

                    Cancel

                </button>


                <button
                    type="submit"
                    class="primary-button"
                >

                    <i class="fas fa-save"></i>

                    Save Changes

                </button>

            </div>

        </form>

    `;

}


/* =====================================================
   SAVE DRIVER CHANGES
===================================================== */

async function saveDriverChanges(driver) {

    const updatedDriver = {

        ...driver,

        name:
            getValue("driverName"),

        email:
            getValue("driverEmail"),

        phone:
            getValue("driverPhone"),

        vehicle:
            getValue("driverVehicle"),

        vehicleNumber:
            getValue("driverVehicleNumber"),

        license:
            getValue("driverLicense"),

        status:
            getValue("driverStatus"),

        rating:
            Number(
                getValue("driverRating")
            )

    };


    if (
        !updatedDriver.name ||
        !updatedDriver.email ||
        !updatedDriver.phone
    ) {

        showToast(
            "Name, email and phone are required.",
            "error"
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/drivers/${encodeURIComponent(driver.id)}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            updatedDriver
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                "Backend update failed"
            );

        }


        const data =
            await response.json();


        /*
        Update local array immediately.
        */

        const index =
            drivers.findIndex(
                item =>
                    String(item.id) ===
                    String(driver.id)
            );


        if (index !== -1) {

            drivers[index] =
                data.driver ||
                updatedDriver;

        }


        closeModal();

        renderDrivers();

        updateStatistics();

        showToast(
            "Driver profile updated successfully.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "Update driver error:",
            error
        );


        /*
        Local fallback.

        This allows the interface to continue
        working even before the backend
        PUT route is added.
        */

        const index =
            drivers.findIndex(
                item =>
                    String(item.id) ===
                    String(driver.id)
            );


        if (index !== -1) {

            drivers[index] =
                updatedDriver;

        }


        closeModal();

        renderDrivers();

        updateStatistics();


        showToast(
            "Driver updated locally. Backend PUT API is not available yet.",
            "warning"
        );

    }

}


/* =====================================================
   TOGGLE STATUS
===================================================== */

async function toggleDriverStatus(driver) {

    const current =
        normalizeStatus(
            driver.status
        );


    const newStatus =
        current === "active"
            ? "suspended"
            : "active";


    const actionText =
        newStatus === "suspended"
            ? "suspend"
            : "activate";


    const confirmed =
        confirm(
            `Are you sure you want to ${actionText} ${driver.name}?`
        );


    if (!confirmed) {

        return;

    }


    const updatedDriver = {

        ...driver,

        status: newStatus

    };


    try {

        const response =
            await fetch(
                `${API_BASE}/drivers/${encodeURIComponent(driver.id)}/status`,
                {

                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            status:
                                newStatus
                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Status update failed"
            );

        }


        const data =
            await response.json();


        updateDriverInArray(
            driver.id,
            data.driver ||
            updatedDriver
        );


        renderDrivers();

        updateStatistics();


        showToast(
            `${driver.name} is now ${newStatus}.`,
            "success"
        );

    }

    catch (error) {

        console.error(
            "Status update error:",
            error
        );


        /*
        Local fallback
        */

        updateDriverInArray(
            driver.id,
            updatedDriver
        );


        renderDrivers();

        updateStatistics();


        showToast(
            `${driver.name} status changed locally to ${newStatus}. Add the backend PATCH route for permanent saving.`,
            "warning"
        );

    }

}


/* =====================================================
   UPDATE DRIVER ARRAY
===================================================== */

function updateDriverInArray(
    id,
    updatedDriver
) {

    const index =
        drivers.findIndex(
            driver =>
                String(driver.id) ===
                String(id)
        );


    if (index !== -1) {

        drivers[index] =
            updatedDriver;

    }

}


/* =====================================================
   DELETE DRIVER
===================================================== */

async function deleteDriver(driver) {

    const confirmed =
        confirm(
            `Delete driver "${driver.name}" permanently?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/drivers/${encodeURIComponent(driver.id)}`,
                {

                    method: "DELETE"

                }
            );


        if (!response.ok) {

            throw new Error(
                "Delete request failed"
            );

        }


        drivers =
            drivers.filter(
                item =>
                    String(item.id) !==
                    String(driver.id)
            );


        renderDrivers();

        updateStatistics();


        showToast(
            "Driver deleted successfully.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "Delete driver error:",
            error
        );


        showToast(
            "Backend delete API is not available. Driver was not permanently deleted.",
            "error"
        );

    }

}


/* =====================================================
   SEND DRIVER WARNING
===================================================== */

function sendDriverWarning(driver) {

    openModal(
        "Send Important Notice",
        `

        <div class="notice-form">

            <div class="notice-recipient">

                <i class="fas fa-user"></i>

                <div>

                    <strong>
                        ${escapeHTML(driver.name)}
                    </strong>

                    <span>
                        ${escapeHTML(driver.email)}
                    </span>

                </div>

            </div>


            <div class="form-group">

                <label>
                    Notice Type
                </label>

                <select id="noticeType">

                    <option value="important">
                        Important Announcement
                    </option>

                    <option value="warning">
                        Warning
                    </option>

                    <option value="safety">
                        Safety Notice
                    </option>

                    <option value="document">
                        Document Verification
                    </option>

                    <option value="system">
                        System Update
                    </option>

                </select>

            </div>


            <div class="form-group">

                <label>
                    Message
                </label>

                <textarea
                    id="noticeMessage"
                    rows="5"
                    placeholder="Enter important news or warning..."
                    required
                ></textarea>

            </div>


            <div class="modal-actions">

                <button
                    type="button"
                    class="secondary-button"
                    onclick="closeModal()"
                >
                    Cancel
                </button>


                <button
                    type="button"
                    class="primary-button"
                    id="sendNoticeBtn"
                >

                    <i class="fas fa-paper-plane"></i>

                    Send Notice

                </button>

            </div>

        </div>

        `
    );


    const sendButton =
        document.getElementById(
            "sendNoticeBtn"
        );


    if (sendButton) {

        sendButton.addEventListener(
            "click",
            () => sendNotice(driver)
        );

    }

}


/* =====================================================
   SEND NOTICE
===================================================== */

async function sendNotice(driver) {

    const type =
        getValue(
            "noticeType"
        );


    const message =
        getValue(
            "noticeMessage"
        );


    if (!message.trim()) {

        showToast(
            "Please enter a message.",
            "error"
        );

        return;

    }


    const notice = {

        id:
            "NOT" +
            Date.now(),

        driverId:
            driver.id,

        driverName:
            driver.name,

        type:
            type,

        message:
            message.trim(),

        sender:
            "Super Admin",

        timestamp:
            new Date().toISOString()

    };


    try {

        const response =
            await fetch(
                `${API_BASE}/notifications`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            notice
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                "Notification API unavailable"
            );

        }


        closeModal();


        showToast(
            "Important notice sent successfully.",
            "success"
        );


    }

    catch (error) {

        console.error(
            "Notice error:",
            error
        );


        /*
        Temporary local storage fallback.
        */

        const existing =
            JSON.parse(
                localStorage.getItem(
                    "driverNotifications"
                ) || "[]"
            );


        existing.push(notice);


        localStorage.setItem(
            "driverNotifications",
            JSON.stringify(existing)
        );


        closeModal();


        showToast(
            "Notice saved locally. Backend notification API is not available yet.",
            "warning"
        );

    }

}


/* =====================================================
   ADD DRIVER
===================================================== */

function openAddDriver() {

    openModal(
        "Add New Driver",
        getDriverFormHTML()
    );


    const form =
        document.getElementById(
            "driverForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await addNewDriver();

        }
    );


    const cancel =
        document.getElementById(
            "cancelDriverEdit"
        );


    if (cancel) {

        cancel.addEventListener(
            "click",
            closeModal
        );

    }

}


/* =====================================================
   ADD NEW DRIVER
===================================================== */

async function addNewDriver() {

    const newDriver = {

        id:
            "DRV" +
            String(
                drivers.length + 1
            ).padStart(
                3,
                "0"
            ),

        name:
            getValue("driverName"),

        email:
            getValue("driverEmail"),

        phone:
            getValue("driverPhone"),

        vehicle:
            getValue("driverVehicle"),

        vehicleNumber:
            getValue(
                "driverVehicleNumber"
            ),

        license:
            getValue(
                "driverLicense"
            ),

        status:
            getValue("driverStatus") ||
            "active",

        rating:
            Number(
                getValue("driverRating")
            ) || 0,

        trips: 0,

        createdAt:
            new Date().toISOString()

    };


    if (
        !newDriver.name ||
        !newDriver.email ||
        !newDriver.phone
    ) {

        showToast(
            "Please fill all required fields.",
            "error"
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/drivers`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            newDriver
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                "Add driver failed"
            );

        }


        const data =
            await response.json();


        drivers.push(
            data.driver ||
            newDriver
        );


        closeModal();

        renderDrivers();

        updateStatistics();


        showToast(
            "Driver added successfully.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "Add driver error:",
            error
        );


        /*
        Local fallback
        */

        drivers.push(
            newDriver
        );


        closeModal();

        renderDrivers();

        updateStatistics();


        showToast(
            "Driver added locally. Backend POST API is not available yet.",
            "warning"
        );

    }

}


/* =====================================================
   SEARCH
===================================================== */

function setupSearch() {

    const search =
        document.getElementById(
            "driverSearch"
        );


    if (!search) {

        return;

    }


    search.addEventListener(
        "input",
        applyFilters
    );

}


/* =====================================================
   FILTERS
===================================================== */

function setupFilters() {

    const filter =
        document.getElementById(
            "driverStatusFilter"
        );


    if (filter) {

        filter.addEventListener(
            "change",
            applyFilters
        );

    }

}


/* =====================================================
   APPLY FILTERS
===================================================== */

function applyFilters() {

    const searchElement =
        document.getElementById(
            "driverSearch"
        );


    const filterElement =
        document.getElementById(
            "driverStatusFilter"
        );


    const search =
        searchElement
            ? searchElement.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        filterElement
            ? filterElement.value
            : "all";


    const filtered =
        drivers.filter(
            driver => {

                const searchable = [

                    driver.id,
                    driver.name,
                    driver.email,
                    driver.phone,
                    driver.vehicle,
                    driver.vehicleNumber

                ]
                .join(" ")
                .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchable.includes(
                        search
                    );


                const matchesStatus =
                    status === "all" ||
                    normalizeStatus(
                        driver.status
                    ) === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderDrivers(
        filtered
    );

}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {

    const total =
        drivers.length;


    const active =
        drivers.filter(
            driver =>
                normalizeStatus(
                    driver.status
                ) === "active"
        ).length;


    const suspended =
        drivers.filter(
            driver =>
                normalizeStatus(
                    driver.status
                ) === "suspended"
        ).length;


    setText(
        "totalDrivers",
        total
    );


    setText(
        "activeDrivers",
        active
    );


    setText(
        "suspendedDrivers",
        suspended
    );


    setText(
        "driverCount",
        total
    );


    setText(
        "activeDriverCount",
        active
    );


    setText(
        "suspendedDriverCount",
        suspended
    );

}


/* =====================================================
   REFRESH
===================================================== */

async function refreshDrivers() {

    const button =
        document.getElementById(
            "refreshDriversBtn"
        );


    if (button) {

        button.classList.add(
            "loading"
        );

    }


    await loadDrivers();


    if (button) {

        button.classList.remove(
            "loading"
        );

    }


    showToast(
        "Driver list refreshed.",
        "success"
    );

}


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {

    /*
    Dashboard
    */

    const dashboard =
        document.getElementById(
            "dashboardBtn"
        );


    if (dashboard) {

        dashboard.addEventListener(
            "click",
            () => {

                window.location.href =
                    "dashboard.html";

            }
        );

    }


    /*
    Admins
    */

    const admins =
        document.getElementById(
            "adminsBtn"
        );


    if (admins) {

        admins.addEventListener(
            "click",
            () => {

                window.location.href =
                    "admins.html";

            }
        );

    }


    /*
    Riders
    */

    const riders =
        document.getElementById(
            "ridersBtn"
        );


    if (riders) {

        riders.addEventListener(
            "click",
            () => {

                window.location.href =
                    "riders.html";

            }
        );

    }


    /*
    Reports
    */

    const reports =
        document.getElementById(
            "reportsBtn"
        );


    if (reports) {

        reports.addEventListener(
            "click",
            () => {

                window.location.href =
                    "reports.html";

            }
        );

    }


    /*
    Logs
    */

    const logs =
        document.getElementById(
            "logsBtn"
        );


    if (logs) {

        logs.addEventListener(
            "click",
            () => {

                window.location.href =
                    "logs.html";

            }
        );

    }


    /*
    Settings
    */

    const settings =
        document.getElementById(
            "settingsBtn"
        );


    if (settings) {

        settings.addEventListener(
            "click",
            () => {

                window.location.href =
                    "settings.html";

            }
        );

    }


    /*
    Back button
    */

    const back =
        document.getElementById(
            "backBtn"
        );


    if (back) {

        back.addEventListener(
            "click",
            () => {

                window.location.href =
                    "dashboard.html";

            }
        );

    }

}


/* =====================================================
   BUTTONS
===================================================== */

function setupButtons() {

    const add =
        document.getElementById(
            "addDriverBtn"
        );


    if (add) {

        add.addEventListener(
            "click",
            openAddDriver
        );

    }


    const refresh =
        document.getElementById(
            "refreshDriversBtn"
        );


    if (refresh) {

        refresh.addEventListener(
            "click",
            refreshDrivers
        );

    }


    const close =
        document.getElementById(
            "closeModal"
        );


    if (close) {

        close.addEventListener(
            "click",
            closeModal
        );

    }


    const overlay =
        document.getElementById(
            "modalOverlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    overlay
                ) {

                    closeModal();

                }

            }
        );

    }


    /*
    Escape closes modal
    */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeModal();

            }

        }
    );

}


/* =====================================================
   MODAL
===================================================== */

function openModal(
    title,
    content
) {

    const overlay =
        document.getElementById(
            "modalOverlay"
        );


    const titleElement =
        document.getElementById(
            "modalTitle"
        );


    const body =
        document.getElementById(
            "modalBody"
        );


    if (!overlay || !body) {

        alert(
            title +
            "\n\n" +
            stripHTML(content)
        );

        return;

    }


    if (titleElement) {

        titleElement.textContent =
            title;

    }


    body.innerHTML =
        content;


    overlay.classList.add(
        "active"
    );


    document.body.classList.add(
        "modal-open"
    );


    /*
    Cancel button inside forms
    */

    const cancel =
        document.getElementById(
            "cancelDriverEdit"
        );


    if (cancel) {

        cancel.addEventListener(
            "click",
            closeModal
        );

    }

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {

    const overlay =
        document.getElementById(
            "modalOverlay"
        );


    if (overlay) {

        overlay.classList.remove(
            "active"
        );

    }


    document.body.classList.remove(
        "modal-open"
    );


    selectedDriver =
        null;

}


/* =====================================================
   TOAST
===================================================== */

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (!toast) {

        alert(message);

        return;

    }


    if (toastMessage) {

        toastMessage.textContent =
            message;

    }


    toast.className =
        `toast ${type} show`;


    clearTimeout(
        window.__toastTimer
    );


    window.__toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}


/* =====================================================
   HELPERS
===================================================== */

function getValue(id) {

    const element =
        document.getElementById(id);


    return element
        ? element.value.trim()
        : "";

}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


function normalizeStatus(
    status
) {

    return String(
        status || "active"
    )
    .toLowerCase()
    .trim();

}


function showTableMessage(
    message
) {

    const tbody =
        document.getElementById(
            "driversTableBody"
        );


    if (tbody) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="table-loading"
                >

                    <i class="fas fa-spinner fa-spin"></i>

                    ${escapeHTML(message)}

                </td>

            </tr>

        `;

    }

}


/* =====================================================
   HTML SAFETY
===================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
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


function escapeAttribute(value) {

    return escapeHTML(
        value
    );

}


function stripHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.innerHTML =
        value;

    return div.textContent ||
        div.innerText ||
        "";

}


/* =====================================================
   GLOBAL MODAL FUNCTIONS
===================================================== */

window.editDriverFromModal =
    function(id) {

        const driver =
            findDriver(id);

        if (driver) {

            editDriver(driver);

        }

    };


window.sendWarningFromModal =
    function(id) {

        const driver =
            findDriver(id);

        if (driver) {

            sendDriverWarning(
                driver
            );

        }

    };


/* =====================================================
   INITIAL CONSOLE MESSAGE
===================================================== */

console.log(`
=========================================================
🚖 SMART RIDESHARE
DRIVER MANAGEMENT SYSTEM
=========================================================

✔ Driver listing
✔ Add Driver
✔ Edit Profile
✔ Active / Suspended
✔ Delete Driver
✔ Search
✔ Status filtering
✔ Driver details
✔ Important notices
✔ Warning system
✔ Backend integration
✔ Local fallback
✔ Statistics
✔ Navigation
✔ No driver photos

=========================================================
`);