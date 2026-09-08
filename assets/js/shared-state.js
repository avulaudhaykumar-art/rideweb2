"use strict";

/*
===========================================================
 SMART RIDESHARE
 SHARED APPLICATION STATE
===========================================================

 All portals use this same data:

 SUPER ADMIN
      ↓
 Drivers / Riders / Trips / Notifications
      ↓
 DRIVER PORTAL
      ↓
 RIDER PORTAL

===========================================================
*/

const STORAGE_KEY = "smartRideShareState";

/* =========================================================
   SAMPLE DATA
========================================================= */

const DEFAULT_STATE = {

    drivers: [

        {
            id: "DRV001",
            name: "Rahul Sharma",
            email: "rahul.sharma@example.com",
            phone: "+91 90000 10001",
            vehicle: "Swift Dzire",
            vehicleNumber: "TS09AB1234",
            status: "Active",
            rating: 4.8,
            trips: 124,
            online: true
        },

        {
            id: "DRV002",
            name: "Arjun Reddy",
            email: "arjun.reddy@example.com",
            phone: "+91 90000 10002",
            vehicle: "Hyundai Aura",
            vehicleNumber: "TS10CD5678",
            status: "Active",
            rating: 4.7,
            trips: 98,
            online: true
        },

        {
            id: "DRV003",
            name: "Kiran Kumar",
            email: "kiran.kumar@example.com",
            phone: "+91 90000 10003",
            vehicle: "Maruti Swift",
            vehicleNumber: "TS11EF9012",
            status: "Active",
            rating: 4.6,
            trips: 76,
            online: false
        },

        {
            id: "DRV004",
            name: "Naveen Kumar",
            email: "naveen.kumar@example.com",
            phone: "+91 90000 10004",
            vehicle: "Tata Tigor",
            vehicleNumber: "TS12GH3456",
            status: "Active",
            rating: 4.9,
            trips: 151,
            online: true
        }

    ],


    riders: [

        {
            id: "RID001",
            name: "Udhay Kumar",
            email: "udhay.kumar@example.com",
            phone: "+91 90000 20001",
            status: "Active",
            trips: 12
        },

        {
            id: "RID002",
            name: "Vijay Kumar",
            email: "vijay.kumar@example.com",
            phone: "+91 90000 20002",
            status: "Active",
            trips: 8
        },

        {
            id: "RID003",
            name: "Sandeep Reddy",
            email: "sandeep.reddy@example.com",
            phone: "+91 90000 20003",
            status: "Active",
            trips: 15
        },

        {
            id: "RID004",
            name: "Rohit Kumar",
            email: "rohit.kumar@example.com",
            phone: "+91 90000 20004",
            status: "Active",
            trips: 6
        }

    ],


    trips: [

        {
            id: "RIDE001",
            rider: "Udhay Kumar",
            driver: "Rahul Sharma",
            pickup: "Hayathnagar",
            destination: "LB Nagar",
            status: "Completed",
            fare: 180
        },

        {
            id: "RIDE002",
            rider: "Vijay Kumar",
            driver: "Arjun Reddy",
            pickup: "Dilsukhnagar",
            destination: "Koti",
            status: "Completed",
            fare: 150
        },

        {
            id: "RIDE003",
            rider: "Sandeep Reddy",
            driver: "Naveen Kumar",
            pickup: "Uppal",
            destination: "Habsiguda",
            status: "Active",
            fare: 120
        }

    ],


    notifications: [

        {
            id: "N001",
            title: "Welcome to Smart RideShare",
            message: "System is ready.",
            type: "info",
            audience: "All",
            time: new Date().toLocaleString()
        }

    ],


    logs: [

        {
            id: "LOG001",
            action: "System Started",
            user: "Super Admin",
            description: "Smart RideShare system initialized.",
            time: new Date().toLocaleString()
        }

    ]

};


/* =========================================================
   INITIALIZE DATABASE
========================================================= */

function initializeSharedState() {

    const existing =
        localStorage.getItem(STORAGE_KEY);

    if (!existing) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(DEFAULT_STATE)
        );

    }

}


/* =========================================================
   GET STATE
========================================================= */

function getAppState() {

    initializeSharedState();

    try {

        return JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

    }

    catch (error) {

        console.error(
            "Unable to load application state",
            error
        );

        return JSON.parse(
            JSON.stringify(DEFAULT_STATE)
        );

    }

}


/* =========================================================
   SAVE STATE
========================================================= */

function saveAppState(state) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );

    /*
       Notify the current page.
    */

    window.dispatchEvent(
        new CustomEvent("rideShareStateChanged")
    );

}


/* =========================================================
   ADD LOG
========================================================= */

function addSystemLog(
    action,
    description
) {

    const state = getAppState();

    state.logs.unshift({

        id:
            "LOG" +
            Date.now(),

        action: action,

        user: "Super Admin",

        description: description,

        time:
            new Date().toLocaleString()

    });

    saveAppState(state);

}


/* =========================================================
   UPDATE DRIVER
========================================================= */

function updateDriver(
    driverId,
    changes
) {

    const state = getAppState();

    const driver =
        state.drivers.find(
            d => d.id === driverId
        );

    if (!driver) {

        return false;

    }

    Object.assign(
        driver,
        changes
    );

    saveAppState(state);

    addSystemLog(
        "Driver Updated",
        `${driver.name} profile was updated.`
    );

    return true;

}


/* =========================================================
   SUSPEND DRIVER
========================================================= */

function suspendDriver(
    driverId
) {

    const state = getAppState();

    const driver =
        state.drivers.find(
            d => d.id === driverId
        );

    if (!driver) {

        return false;

    }

    driver.status = "Suspended";

    driver.online = false;

    saveAppState(state);

    addSystemLog(
        "Driver Suspended",
        `${driver.name} was suspended by Super Admin.`
    );

    sendNotification(

        "Driver Account Suspended",

        `${driver.name}'s driver account has been suspended.`,

        "warning",

        driver.email

    );

    return true;

}


/* =========================================================
   ACTIVATE DRIVER
========================================================= */

function activateDriver(
    driverId
) {

    const state = getAppState();

    const driver =
        state.drivers.find(
            d => d.id === driverId
        );

    if (!driver) {

        return false;

    }

    driver.status = "Active";

    saveAppState(state);

    addSystemLog(
        "Driver Activated",
        `${driver.name} was activated by Super Admin.`
    );

    sendNotification(

        "Driver Account Activated",

        `${driver.name}'s account is active again.`,

        "success",

        driver.email

    );

    return true;

}


/* =========================================================
   UPDATE RIDER
========================================================= */

function updateRider(
    riderId,
    changes
) {

    const state = getAppState();

    const rider =
        state.riders.find(
            r => r.id === riderId
        );

    if (!rider) {

        return false;

    }

    Object.assign(
        rider,
        changes
    );

    saveAppState(state);

    addSystemLog(
        "Rider Updated",
        `${rider.name} profile was updated.`
    );

    return true;

}


/* =========================================================
   SUSPEND RIDER
========================================================= */

function suspendRider(
    riderId
) {

    const state = getAppState();

    const rider =
        state.riders.find(
            r => r.id === riderId
        );

    if (!rider) {

        return false;

    }

    rider.status = "Suspended";

    saveAppState(state);

    addSystemLog(
        "Rider Suspended",
        `${rider.name} was suspended.`
    );

    sendNotification(

        "Rider Account Suspended",

        `${rider.name}'s rider account has been suspended.`,

        "warning",

        rider.email

    );

    return true;

}


/* =========================================================
   ACTIVATE RIDER
========================================================= */

function activateRider(
    riderId
) {

    const state = getAppState();

    const rider =
        state.riders.find(
            r => r.id === riderId
        );

    if (!rider) {

        return false;

    }

    rider.status = "Active";

    saveAppState(state);

    addSystemLog(
        "Rider Activated",
        `${rider.name} was activated.`
    );

    return true;

}


/* =========================================================
   SEND NOTIFICATION
========================================================= */

function sendNotification(

    title,

    message,

    type = "info",

    audience = "All"

) {

    const state = getAppState();

    state.notifications.unshift({

        id:
            "N" +
            Date.now(),

        title,

        message,

        type,

        audience,

        time:
            new Date().toLocaleString()

    });

    saveAppState(state);

    return true;

}


/* =========================================================
   STATISTICS
========================================================= */

function getStatistics() {

    const state = getAppState();

    const activeDrivers =
        state.drivers.filter(
            d => d.status === "Active"
        ).length;

    const activeRiders =
        state.riders.filter(
            r => r.status === "Active"
        ).length;

    const activeTrips =
        state.trips.filter(
            r =>
                r.status === "Active" ||
                r.status === "Started"
        ).length;

    return {

        totalUsers:
            state.drivers.length +
            state.riders.length,

        totalDrivers:
            state.drivers.length,

        totalRiders:
            state.riders.length,

        totalTrips:
            state.trips.length,

        totalLogs:
            state.logs.length,

        totalNotifications:
            state.notifications.length,

        activeDrivers,

        activeRiders,

        activeUsers:
            activeDrivers +
            activeRiders,

        activeTrips

    };

}


/* =========================================================
   CROSS-TAB SYNCHRONIZATION
========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key === STORAGE_KEY
        ) {

            window.dispatchEvent(
                new CustomEvent(
                    "rideShareStateChanged"
                )
            );

        }

    }
);


/* =========================================================
   START
========================================================= */

initializeSharedState();

console.log(
    "✅ Smart RideShare Shared State Loaded"
);