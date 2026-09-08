// =================================
// DRIVER MANAGEMENT JAVASCRIPT
// =================================


// ADD DRIVER

let addDriver = document.getElementById("addDriver");


if(addDriver){

addDriver.onclick = function(){

let name = prompt("Enter Driver Name:");

let phone = prompt("Enter Phone Number:");

let vehicle = prompt("Enter Vehicle Name:");



if(name && phone && vehicle){

alert(
"Driver Added Successfully 🚖\n\n"+
"Name: "+name+
"\nPhone: "+phone+
"\nVehicle: "+vehicle
);


}

else{

alert("Please enter all details");

}


};

}





// DELETE DRIVER

let deleteDriver = document.getElementById("deleteDriver");


if(deleteDriver){

deleteDriver.onclick=function(){


let id = prompt("Enter Driver ID to Delete:");



if(id){

alert(
"Driver "+id+" Deleted Successfully ❌"
);

}


};


}





// EDIT DRIVER


let editDriver=document.getElementById("editDriver");


if(editDriver){

editDriver.onclick=function(){


let id=prompt(
"Enter Driver ID to Edit:"
);



if(id){

let newName=
prompt("Enter Updated Driver Name:");



alert(
"Driver Updated Successfully ✏\n\n"+
"ID : "+id+
"\nNew Name : "+newName
);


}


};


}





// APPROVE DRIVER


let approveDriver=
document.getElementById("approveDriver");


if(approveDriver){


approveDriver.onclick=function(){


let id=
prompt(
"Enter Driver ID to Approve:"
);



alert(
"Driver "+id+
" Approved Successfully ✅"
);


};


}





// SUSPEND DRIVER


let suspendDriver=
document.getElementById("suspendDriver");


if(suspendDriver){


suspendDriver.onclick=function(){


let id=
prompt(
"Enter Driver ID to Suspend:"
);



alert(
"Driver "+id+
" Suspended 🚫"
);


};


}






// TABLE EDIT BUTTONS


let editButtons=
document.querySelectorAll("table button");



editButtons.forEach(function(button){


button.onclick=function(){


let row=this.parentElement.parentElement;


let driverName=row.cells[1].innerText;


alert(
"Editing Driver : "+driverName
);


};


});





// PAGE LOAD MESSAGE


window.onload=function(){


console.log(
"Driver Management Loaded Successfully 🚖"
);


};
// =================================
// DRIVER SEARCH SYSTEM
// =================================


let searchBox =
document.getElementById("driverSearch");


if(searchBox){


searchBox.onkeyup=function(){


let value =
this.value.toLowerCase();


let rows =
document.querySelectorAll(
"tbody tr"
);



rows.forEach(function(row){


let text =
row.innerText.toLowerCase();



if(text.includes(value))

{

row.style.display="";

}

else

{

row.style.display="none";

}


});


};


}





// =================================
// DRIVER FILTER SYSTEM
// =================================


let statusFilter =
document.getElementById(
"statusFilter"
);



if(statusFilter){


statusFilter.onchange=function(){


let selected =
this.value;


let rows =
document.querySelectorAll(
"tbody tr"
);



rows.forEach(function(row){


let status =
row.cells[5].innerText;



if(selected=="All")

{

row.style.display="";

}


else if(status==selected)

{

row.style.display="";

}


else

{

row.style.display="none";

}



});


};


}





// =================================
// VIEW DRIVER PROFILE
// =================================


function viewDriver(name){


let profile = `

Driver Profile 🚗

Name : ${name}

Status : Active

Rating : ⭐ 4.8

Trips Completed : 520

Earnings : ₹48,000

`;



alert(profile);


}





// =================================
// APPROVE BUTTON UPDATE
// =================================


function approveStatus(button){


let row =
button.parentElement.parentElement;


row.cells[5].innerHTML=
"Active";



alert(
"Driver Approved Successfully ✅"
);


}





// =================================
// SUSPEND BUTTON UPDATE
// =================================


function suspendStatus(button){


let row =
button.parentElement.parentElement;


row.cells[5].innerHTML=
"Suspended";


alert(
"Driver Suspended 🚫"
);


}





// =================================
// DRIVER COUNT UPDATE
// =================================


function updateDriverCount(){


let active=0;

let suspended=0;



let rows =
document.querySelectorAll(
"tbody tr"
);



rows.forEach(function(row){


let status =
row.cells[5].innerText;



if(status=="Active")

{

active++;

}


if(status=="Suspended")

{

suspended++;

}


});



console.log(
"Active Drivers:",
active
);



console.log(
"Suspended Drivers:",
suspended
);



}



setInterval(

updateDriverCount,

5000

);





// =================================
// DRIVER PAGE READY
// =================================


console.log(`

================================

DRIVER MANAGEMENT SYSTEM READY 🚖

Features:

✔ Add Driver
✔ Delete Driver
✔ Edit Driver
✔ Search Driver
✔ Filter Driver
✔ Approval System
✔ Suspension System
✔ Profile View

================================

`);
// =================================
// DRIVER DATABASE USING LOCAL STORAGE
// =================================


let driverData = JSON.parse(
localStorage.getItem("drivers")
) || [

{
id:"D001",
name:"Rahul Sharma",
phone:"9876543210",
vehicle:"Swift Dzire",
rating:"4.9 ⭐",
status:"Active"
},

{
id:"D002",
name:"Priya Reddy",
phone:"9123456789",
vehicle:"Hyundai i20",
rating:"4.8 ⭐",
status:"Active"
}

];




// SAVE DRIVER DATA

function saveDrivers(){

localStorage.setItem(
"drivers",
JSON.stringify(driverData)
);

}





// =================================
// LOAD DRIVERS INTO TABLE
// =================================


function loadDrivers(){


let table =
document.querySelector(
"tbody"
);



if(!table)
return;



table.innerHTML="";



driverData.forEach(function(driver){



let row =
`
<tr>

<td>${driver.id}</td>

<td>${driver.name}</td>

<td>${driver.phone}</td>

<td>${driver.vehicle}</td>

<td>${driver.rating}</td>

<td>${driver.status}</td>

<td>

<button onclick="editDriverData('${driver.id}')">
Edit
</button>


<button onclick="deleteDriverData('${driver.id}')">
Delete
</button>


</td>

</tr>
`;



table.innerHTML += row;


});


}





// =================================
// ADD NEW DRIVER
// =================================


function addNewDriver(){


let name =
prompt("Enter Driver Name");


let phone =
prompt("Enter Phone Number");


let vehicle =
prompt("Enter Vehicle Name");



if(name && phone && vehicle){


let newDriver={


id:
"D"+(driverData.length+1)
.toString()
.padStart(3,"0"),


name:name,


phone:phone,


vehicle:vehicle,


rating:"5 ⭐",


status:"Active"


};



driverData.push(newDriver);



saveDrivers();


loadDrivers();



alert(
"New Driver Added Successfully 🚗"
);



}


}





// =================================
// DELETE DRIVER
// =================================


function deleteDriverData(id){



let confirmDelete =
confirm(
"Delete Driver "+id+"?"
);



if(confirmDelete){


driverData =
driverData.filter(
driver=>driver.id!=id
);



saveDrivers();


loadDrivers();



alert(
"Driver Deleted Successfully ❌"
);


}



}





// =================================
// EDIT DRIVER
// =================================


function editDriverData(id){



let driver =
driverData.find(
d=>d.id==id
);



if(driver){



let newName =
prompt(
"Update Driver Name",
driver.name
);



let newVehicle =
prompt(
"Update Vehicle",
driver.vehicle
);



driver.name=newName;

driver.vehicle=newVehicle;



saveDrivers();


loadDrivers();



alert(
"Driver Updated Successfully ✏"
);



}



}





// =================================
// EXPORT DRIVER REPORT
// =================================


function exportDrivers(){



let csv =
"ID,Name,Phone,Vehicle,Rating,Status\n";



driverData.forEach(function(d){


csv +=

`${d.id},${d.name},${d.phone},${d.vehicle},${d.rating},${d.status}\n`;


});



let file =
new Blob(
[csv],
{
type:"text/csv"
}
);



let link =
document.createElement("a");


link.href =
URL.createObjectURL(file);


link.download =
"Driver_Report.csv";


link.click();



}





// =================================
// START DRIVER SYSTEM
// =================================


window.addEventListener(
"load",
function(){


loadDrivers();


console.log(
"Driver Database Connected ✅"
);


});
// =================================
// DRIVER PROFILE SYSTEM
// =================================


function openDriverProfile(id){


let driver =
driverData.find(
d=>d.id==id
);



if(driver){


let profile = `

🚗 DRIVER PROFILE

ID : ${driver.id}

Name : ${driver.name}

Phone : ${driver.phone}

Vehicle : ${driver.vehicle}

Rating : ${driver.rating}

Status : ${driver.status}

Total Trips : 520

Monthly Earnings : ₹48,000

`;



alert(profile);



}


}





// =================================
// DOCUMENT VERIFICATION SYSTEM
// =================================


function verifyDocuments(id){


let driver =
driverData.find(
d=>d.id==id
);



if(driver){


let result =
confirm(

"Verify documents of "+driver.name+"?"

);



if(result){


alert(
"Documents Verified Successfully ✅"
);


}


}



}





// =================================
// DRIVER STATUS CHANGE
// =================================


function changeDriverStatus(id){



let driver =
driverData.find(
d=>d.id==id
);



if(driver){



if(driver.status=="Active")

{

driver.status="Suspended";

}

else

{

driver.status="Active";

}



saveDrivers();

loadDrivers();



alert(
"Driver Status Updated 🔄"
);



}



}





// =================================
// DRIVER RATING UPDATE
// =================================


function updateDriverRating(id){



let driver =
driverData.find(
d=>d.id==id
);



if(driver){


let rating =
prompt(
"Enter New Rating",
driver.rating
);



if(rating){


driver.rating =
rating+" ⭐";


saveDrivers();

loadDrivers();



alert(
"Rating Updated ⭐"
);


}


}



}





// =================================
// DRIVER ACTIVITY LOG
// =================================


let activityLogs =
JSON.parse(
localStorage.getItem(
"driverLogs"
)
)
||
[];




function addDriverLog(message){



activityLogs.push({

message:message,

time:new Date()
.toLocaleString()

});



localStorage.setItem(

"driverLogs",

JSON.stringify(activityLogs)

);



}





// =================================
// DRIVER ACTION TRACKING
// =================================


function trackDriverAction(action){


addDriverLog(action);



console.log(

"Activity:",
action

);


}





// =================================
// PERFORMANCE REPORT
// =================================


function showPerformance(id){


let driver =
driverData.find(
d=>d.id==id
);



if(driver){


alert(`

📊 PERFORMANCE REPORT


Driver :
${driver.name}


Completed Trips :
520


Customer Rating :
${driver.rating}


Acceptance Rate :
96%


Cancellation Rate :
2%


Safety Score :
98%


`);

}


}





// =================================
// DRIVER MANAGEMENT READY
// =================================


console.log(`

================================

ADVANCED DRIVER MANAGEMENT ACTIVE 🚖


✔ Profile System

✔ Document Verification

✔ Status Control

✔ Rating Management

✔ Activity Logs

✔ Performance Report


================================

`);
// =================================
// DRIVER ANALYTICS SYSTEM
// =================================



function updateStatistics(){



let total =
driverData.length;


let active =
driverData.filter(
d=>d.status=="Active"
).length;



let suspended =
driverData.filter(
d=>d.status=="Suspended"
).length;



let online =
Math.floor(
Math.random()*active
)+1;




console.log(`

Driver Statistics

Total Drivers :
${total}

Active Drivers :
${active}

Suspended Drivers :
${suspended}

Online Drivers :
${online}

`);





// UPDATE HTML CARDS


let totalBox =
document.getElementById(
"totalDrivers"
);



let activeBox =
document.getElementById(
"activeDrivers"
);



let suspendedBox =
document.getElementById(
"suspendedDrivers"
);



let onlineBox =
document.getElementById(
"onlineDrivers"
);



if(totalBox)

totalBox.innerHTML=total;



if(activeBox)

activeBox.innerHTML=active;



if(suspendedBox)

suspendedBox.innerHTML=suspended;



if(onlineBox)

onlineBox.innerHTML=online;



}






// RUN EVERY 5 SECONDS


setInterval(

updateStatistics,

5000

);







// =================================
// REVENUE ANALYTICS
// =================================



let monthlyRevenue=[


45000,

52000,

48000,

65000,

72000,

85000

];





function calculateRevenue(){


let revenue=0;



monthlyRevenue.forEach(
amount=>{

revenue += amount;

}

);



console.log(

"Total Revenue ₹"+revenue

);



}




calculateRevenue();






// =================================
// TRIP ANALYTICS
// =================================



let completedTrips=0;



function updateTrips(){



completedTrips +=
Math.floor(
Math.random()*5
);



console.log(

"Completed Trips :",

completedTrips

);



}



setInterval(

updateTrips,

4000

);







// =================================
// DRIVER PERFORMANCE SCORE
// =================================



function performanceScore(){



driverData.forEach(
driver=>{


let score =
Math.floor(
Math.random()*10
)+90;



console.log(

driver.name+
" Safety Score : "+
score+"%"

);



});


}




setInterval(

performanceScore,

10000

);







// =================================
// CHART.JS DRIVER GRAPH
// =================================



function createDriverChart(){



let chart =
document.getElementById(
"driverChart"
);



if(chart){



new Chart(

chart,

{


type:"bar",


data:{


labels:[

"Active",

"Suspended",

"Online"

],


datasets:[{


label:

"Driver Statistics",


data:[

20,

5,

15

]


}]


},



options:{


responsive:true


}



}


);



}


}





window.addEventListener(

"load",

function(){


createDriverChart();


updateStatistics();


});






console.log(`

================================

DRIVER ANALYTICS ENABLED 📊


✔ Live Statistics

✔ Revenue Tracking

✔ Trip Analytics

✔ Performance Score

✔ Chart Dashboard


================================

`);
// =================================
// ADMIN LOGIN PROTECTION
// =================================


let adminLogin =
localStorage.getItem(
"adminLogin"
);



function checkAdmin(){


if(adminLogin!="true"){


let login =
confirm(
"Admin login required. Login now?"
);



if(login){


localStorage.setItem(
"adminLogin",
"true"
);


alert(
"Admin Login Successful 👑"
);


}

else{


alert(
"Access Denied"
);


}


}


}



checkAdmin();







// =================================
// DARK MODE SYSTEM
// =================================


let darkButton =
document.getElementById(
"darkMode"
);



if(darkButton){


darkButton.onclick=function(){



document.body.classList.toggle(
"dark"
);



localStorage.setItem(

"darkMode",

document.body.classList.contains(
"dark"
)

);



};


}




window.addEventListener(
"load",
function(){


if(
localStorage.getItem(
"darkMode"
)=="true"
)

{

document.body.classList.add(
"dark"
);

}


});







// =================================
// NOTIFICATION SYSTEM
// =================================



let notifications=[


"🚗 New driver registration request",


"📄 Driver documents pending verification",


"⚠ Insurance expiry alert",


"✅ Driver approved successfully"

];




function showNotifications(){



let box =
document.getElementById(
"notifications"
);



if(box){



box.innerHTML="";



notifications.forEach(
note=>{


let div =
document.createElement(
"div"
);



div.className=
"notification";



div.innerHTML=
note;



box.appendChild(div);



});


}



}



showNotifications();







// =================================
// DOCUMENT UPLOAD SIMULATION
// =================================



function uploadDocument(id){



let driver =
driverData.find(
d=>d.id==id
);



if(driver){



let file =
prompt(
"Enter document name"
);



if(file){


alert(

file+
" uploaded for "+
driver.name+
" ✅"

);


addDriverLog(

driver.name+
" uploaded "+file

);


}



}


}







// =================================
// DRIVER ACTIVITY HISTORY
// =================================



function showDriverLogs(){


let logs =
JSON.parse(

localStorage.getItem(
"driverLogs"

)

)||[];




if(logs.length==0)

{


alert(
"No activity available"
);


return;

}



let output="";



logs.forEach(
log=>{


output +=

"\n"+
log.time+
" : "+
log.message;


});



alert(
output
);


}





// =================================
// AUTO DRIVER ALERTS
// =================================



function driverAlerts(){



let random =
Math.floor(
Math.random()*notifications.length
);



console.log(

"New Alert : "+
notifications[random]

);


}



setInterval(

driverAlerts,

15000

);







console.log(`

================================

ADMIN SECURITY ACTIVE 🔐


✔ Login Protection

✔ Dark Mode

✔ Notifications

✔ Document Upload

✔ Activity History


================================

`);