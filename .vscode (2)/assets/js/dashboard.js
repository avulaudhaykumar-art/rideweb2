"use strict";

// ======================================
// SUPER ADMIN DASHBOARD JAVASCRIPT
// ======================================

window.addEventListener("load", function () {
    console.log("Super Admin Dashboard Loaded Successfully 🚖");
});

// ======================================
// ADD DRIVER
// ======================================

const addDriverBtn = document.getElementById("addDriver");

if (addDriverBtn) {
    addDriverBtn.addEventListener("click", function () {

        const name = prompt("Enter Driver Name:");

        if (!name || name.trim() === "") {
            alert("Driver name is required.");
            return;
        }

        const vehicle = prompt("Enter Vehicle Name:");

        if (!vehicle || vehicle.trim() === "") {
            alert("Vehicle name is required.");
            return;
        }

        alert(
            "Driver Added Successfully ✅\n\n" +
            "Name: " + name +
            "\nVehicle: " + vehicle
        );
    });
}

// ======================================
// REMOVE DRIVER
// ======================================

const removeDriverBtn = document.getElementById("removeDriver");

if (removeDriverBtn) {
    removeDriverBtn.addEventListener("click", function () {

        const driverId = prompt("Enter Driver ID to remove:");

        if (!driverId) {
            return;
        }

        const confirmRemove = confirm(
            "Are you sure you want to remove Driver " +
            driverId + "?"
        );

        if (confirmRemove) {
            alert("Driver " + driverId + " removed successfully ❌");
        }
    });
}

// ======================================
// EDIT DRIVER
// ======================================

const editDriverBtn = document.getElementById("editDriver");

if (editDriverBtn) {
    editDriverBtn.addEventListener("click", function () {

        const driverId = prompt("Enter Driver ID to edit:");

        if (!driverId) {
            return;
        }

        const newName = prompt("Enter new Driver Name:");

        if (!newName) {
            return;
        }

        alert(
            "Driver Updated Successfully ✅\n\n" +
            "Driver ID: " + driverId +
            "\nNew Name: " + newName
        );
    });
}

// ======================================
// SUSPEND DRIVER
// ======================================

const suspendDriverBtn = document.getElementById("suspendDriver");

if (suspendDriverBtn) {
    suspendDriverBtn.addEventListener("click", function () {

        const driverId = prompt("Enter Driver ID to suspend:");

        if (!driverId) {
            return;
        }

        const confirmSuspend = confirm(
            "Suspend Driver " + driverId + "?"
        );

        if (confirmSuspend) {
            alert(
                "Driver " + driverId +
                " has been suspended ⛔"
            );
        }
    });
}

// ======================================
// ADD ADMIN
// ======================================

const addAdminBtn = document.getElementById("addAdmin");

if (addAdminBtn) {
    addAdminBtn.addEventListener("click", function () {

        const name = prompt("Enter Admin Name:");

        if (!name) {
            return;
        }

        const email = prompt("Enter Admin Email:");

        if (!email) {
            return;
        }

        alert(
            "Admin Added Successfully ✅\n\n" +
            "Name: " + name +
            "\nEmail: " + email
        );
    });
}

// ======================================
// REMOVE ADMIN
// ======================================

const removeAdminBtn = document.getElementById("removeAdmin");

if (removeAdminBtn) {
    removeAdminBtn.addEventListener("click", function () {

        const adminId = prompt("Enter Admin ID to remove:");

        if (!adminId) {
            return;
        }

        if (confirm("Remove Admin " + adminId + "?")) {

            alert(
                "Admin " + adminId +
                " removed successfully ❌"
            );

        }
    });
}

// ======================================
// RESET ADMIN PASSWORD
// ======================================

const resetAdminBtn = document.getElementById("resetAdmin");

if (resetAdminBtn) {
    resetAdminBtn.addEventListener("click", function () {

        const adminEmail = prompt(
            "Enter Admin Email:"
        );

        if (!adminEmail) {
            return;
        }

        alert(
            "Password reset link generated 🔑\n\n" +
            "Admin: " + adminEmail
        );
    });
}

// ======================================
// EDIT TABLE BUTTONS
// ======================================

const editButtons =
    document.querySelectorAll("table button");

editButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const row = this.closest("tr");

        if (!row) {
            return;
        }

        const cells = row.querySelectorAll("td");

        let details = "";

        cells.forEach(function (cell) {
            details += cell.innerText + "\n";
        });

        alert(
            "Record Details\n\n" +
            details
        );

    });

});

// ======================================
// NOTIFICATIONS
// ======================================

const notifications =
    document.querySelectorAll(".notification");

notifications.forEach(function (notification) {

    notification.style.cursor = "pointer";

    notification.addEventListener("click", function () {

        alert(
            "Notification Opened 🔔\n\n" +
            this.innerText
        );

    });

});

// ======================================
// DARK MODE
// ======================================

const settingsButtons =
    document.querySelectorAll(
        ".management .toolbar button"
    );

settingsButtons.forEach(function (button) {

    if (button.innerText.includes("Dark Mode")) {

        button.addEventListener("click", function () {

            document.body.classList.toggle("dark-mode");

            if (
                document.body.classList.contains(
                    "dark-mode"
                )
            ) {

                localStorage.setItem(
                    "darkMode",
                    "enabled"
                );

                alert("Dark Mode Enabled 🌙");

            } else {

                localStorage.setItem(
                    "darkMode",
                    "disabled"
                );

                alert("Dark Mode Disabled ☀️");
            }

        });

    }

});

// ======================================
// RESTORE DARK MODE
// ======================================

if (
    localStorage.getItem("darkMode") ===
    "enabled"
) {

    document.body.classList.add("dark-mode");

}

// ======================================
// CHANGE PASSWORD
// ======================================

settingsButtons.forEach(function (button) {

    if (button.innerText.includes("Change Password")) {

        button.addEventListener("click", function () {

            const newPassword =
                prompt("Enter New Password:");

            if (!newPassword) {
                return;
            }

            localStorage.setItem(
                "adminPassword",
                newPassword
            );

            alert(
                "Password Changed Successfully 🔐"
            );

        });

    }

});

// ======================================
// DATABASE BACKUP
// ======================================

settingsButtons.forEach(function (button) {

    if (button.innerText.includes("Backup Database")) {

        button.addEventListener("click", function () {

            const backup = {

                drivers: 245,

                riders: 850,

                trips: 1350,

                revenue: "₹4.8L",

                backupTime:
                    new Date().toLocaleString()

            };

            localStorage.setItem(
                "rideShareBackup",
                JSON.stringify(backup)
            );

            alert(
                "Database Backup Completed Successfully 📤"
            );

        });

    }

});

// ======================================
// SYSTEM CONFIGURATION
// ======================================

settingsButtons.forEach(function (button) {

    if (
        button.innerText.includes(
            "System Configuration"
        )
    ) {

        button.addEventListener("click", function () {

            alert(
                "System Configuration ⚙️\n\n" +
                "Ride Matching: Active\n" +
                "Driver Tracking: Active\n" +
                "Payment System: Active\n" +
                "Notifications: Active"
            );

        });

    }

});

// ======================================
// EMERGENCY CONTROLS
// ======================================

const managementSections =
    document.querySelectorAll(".management");

managementSections.forEach(function (section) {

    const buttons =
        section.querySelectorAll(".toolbar button");

    buttons.forEach(function (button) {

        const text = button.innerText;

        if (text.includes("Block Driver")) {

            button.addEventListener("click", function () {

                const id =
                    prompt("Enter Driver ID:");

                if (id) {

                    alert(
                        "Driver " + id +
                        " blocked 🚨"
                    );

                }

            });

        }

        if (text.includes("Block Rider")) {

            button.addEventListener("click", function () {

                const id =
                    prompt("Enter Rider ID:");

                if (id) {

                    alert(
                        "Rider " + id +
                        " blocked 🚫"
                    );

                }

            });

        }

        if (text.includes("Stop Ride")) {

            button.addEventListener("click", function () {

                const rideId =
                    prompt("Enter Ride ID:");

                if (rideId) {

                    alert(
                        "Ride " + rideId +
                        " stopped successfully 🛑"
                    );

                }

            });

        }

        if (text.includes("Emergency Contact")) {

            button.addEventListener("click", function () {

                alert(
                    "Emergency Control Center 📞\n\n" +
                    "Emergency support has been contacted."
                );

            });

        }

    });

});

// ======================================
// LOGOUT
// ======================================

const sidebarItems =
    document.querySelectorAll(".sidebar li");

sidebarItems.forEach(function (item) {

    if (
        item.innerText
            .toLowerCase()
            .includes("logout")
    ) {

        item.addEventListener("click", function () {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );

            if (confirmLogout) {

                localStorage.removeItem(
                    "rideShareUser"
                );

                alert(
                    "Logged out successfully 👋"
                );

                window.location.href =
                    "../pages/login.html";

            }

        });

    }

});

// ======================================
// REVENUE CHART
// ======================================

const chartCanvas =
    document.getElementById("revenueChart");

if (chartCanvas && typeof Chart !== "undefined") {

    new Chart(chartCanvas, {

        type: "line",

        data: {

            labels: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul"
            ],

            datasets: [{

                label: "Revenue",

                data: [
                    320000,
                    350000,
                    390000,
                    410000,
                    450000,
                    470000,
                    480000
                ],

                borderWidth: 3,

                fill: false

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    display: true
                }

            },

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}

// ======================================
// DASHBOARD READY
// ======================================

console.log(`
========================================

SUPER ADMIN DASHBOARD READY 👑

Features:

✔ Driver Management
✔ Admin Management
✔ Rider Management
✔ Revenue Analytics
✔ Notifications
✔ Dark Mode
✔ Database Backup
✔ Emergency Controls
✔ Logout
✔ Chart Analytics
✔ Local Storage

========================================
`);
// ======================================
// LIVE RIDE MONITOR
// ======================================

function monitorActiveRide() {

    const ride =
        JSON.parse(
            localStorage.getItem("activeRide")
        );


    if (!ride) {

        console.log(
            "No active ride currently."
        );

        return;
    }


    console.log(
        "🚖 ACTIVE RIDE MONITOR"
    );


    console.log(
        "Ride ID:",
        ride.id
    );


    console.log(
        "Rider:",
        ride.rider
    );


    console.log(
        "Driver:",
        ride.driver || "Not Assigned"
    );


    console.log(
        "Route:",
        ride.pickup +
        " → " +
        ride.destination
    );


    console.log(
        "Status:",
        ride.status
    );


    console.log(
        "Fare: ₹",
        ride.fare
    );

}


monitorActiveRide();

setInterval(
    monitorActiveRide,
    3000
);
