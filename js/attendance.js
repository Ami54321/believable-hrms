// ==========================
// OFFICE GPS LOCATION CHECK
// ==========================

const OFFICE_LATITUDE = 22.504412568554915;
const OFFICE_LONGITUDE = 88.39692957624753;
const OFFICE_RADIUS_METRES = 100;

function checkOfficeLocation() {
    return new Promise((resolve) => {

        if (!navigator.geolocation) {
            alert("Your browser does not support GPS location.");
            resolve(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function (position) {

                const employeeLat = position.coords.latitude;
                const employeeLon = position.coords.longitude;

                function toRadians(degrees) {
                    return degrees * Math.PI / 180;
                }

                const earthRadius = 6371000;

                const latDifference =
                    toRadians(employeeLat - OFFICE_LATITUDE);

                const lonDifference =
                    toRadians(employeeLon - OFFICE_LONGITUDE);

                const a =
                    Math.sin(latDifference / 2) ** 2 +
                    Math.cos(toRadians(OFFICE_LATITUDE)) *
                    Math.cos(toRadians(employeeLat)) *
                    Math.sin(lonDifference / 2) ** 2;

                const distance =
                    2 * earthRadius *
                    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                if (distance <= OFFICE_RADIUS_METRES) {
                    resolve(true);
                } else {
                    alert(
                        "Attendance allowed only at the office. " +
                        "You are approximately " +
                        Math.round(distance) +
                        " metres away."
                    );
                    resolve(false);
                }
            },

            function () {
                alert(
                    "Unable to verify your location. " +
                    "Please allow location access and try again."
                );
                resolve(false);
            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    });
}

// ==========================
// CHECK IN
// ==========================
async function checkIn() {
        const isAtOffice = await checkOfficeLocation();
    if (!isAtOffice) return;

    let employeeId = document.getElementById("employeeId").value.trim();

    if (employeeId === "") {
        alert("Please enter Employee ID");
        return;
    }

    let nowDate = new Date();

    let today =
        nowDate.getFullYear() + "-" +
        String(nowDate.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(nowDate.getDate()).padStart(2, "0");

    let hours = nowDate.getHours();
    let minutes = nowDate.getMinutes();

    let now =
        today + " " +
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(nowDate.getSeconds()).padStart(2, "0");


    // Decide On Time or Late
    let attendanceStatus;

    if (hours < 10 || (hours === 10 && minutes <= 15)) {
        attendanceStatus = "On Time";
    } else {
        attendanceStatus = "Late";
    }


    // Save attendance
    const { error } = await supabaseClient
        .from("attendance")
        .insert([
            {
                employee_id: employeeId,
                attendance_date: today,
                check_in: now,
                attendance_status: attendanceStatus
            }
        ]);

   
if (error) {
    if (error.code === "23505") {
        alert("You have already checked in today.");
    } else {
        alert("Error: " + error.message);
    }
    return;
}


    document.getElementById("message").innerText =
        "Check In successful! Status: " + attendanceStatus;


    alert(
        "Attendance marked successfully!\n\n" +
        "Status: " + attendanceStatus
    );
}


// ==========================
// CHECK OUT
// ==========================
async function checkOut() {
        const isAtOffice = await checkOfficeLocation();
    if (!isAtOffice) return;

    let employeeId = document.getElementById("employeeId").value.trim();

    if (employeeId === "") {
        alert("Please enter Employee ID");
        return;
    }

    let nowDate = new Date();

    let today =
        nowDate.getFullYear() + "-" +
        String(nowDate.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(nowDate.getDate()).padStart(2, "0");

    let now =
        today + " " +
        String(nowDate.getHours()).padStart(2, "0") + ":" +
        String(nowDate.getMinutes()).padStart(2, "0") + ":" +
        String(nowDate.getSeconds()).padStart(2, "0");


    
    // Find today's attendance
    const { data: attendance, error: fetchError } = await supabaseClient
        .from("attendance")
        .select("check_in, check_out")
        .eq("employee_id", employeeId)
        .eq("attendance_date", today)
        .maybeSingle();

    if (fetchError) {
        alert("Error finding attendance: " + fetchError.message);
        return;
    }

    if (!attendance) {
        alert("Please check in before checking out.");
        return;
    }

    if (attendance.check_out) {
        alert("You have already checked out today.");
        return;
    }



    if (fetchError) {
        alert("Error finding check-in: " + fetchError.message);
        return;
    }


    // Calculate working hours
    let checkInTime = new Date(attendance.check_in);

    let checkOutTime = new Date();

    let difference = checkOutTime - checkInTime;

    let totalMinutes = Math.floor(difference / 60000);

    let hours = Math.floor(totalMinutes / 60);

    let minutes = totalMinutes % 60;

    let workingHours =
        hours + " hours " + minutes + " minutes";


    // Save checkout and working hours
    const { error } = await supabaseClient
        .from("attendance")
        .update({
            check_out: now,
            working_hours: workingHours
        })
        .eq("employee_id", employeeId)
        .eq("attendance_date", today);


if (error) {
    if (error.code === "23505") {
        alert("You have already checked out today.");
    } else {
        alert("Error: " + error.message);
    }
    return;
}


    document.getElementById("message").innerText =
        "Check Out successful!";

    alert(
        "Check Out marked successfully!\n\n" +
        "Working Hours: " + workingHours
    );
}

async function applyLateRegularization() {

    let employeeId =
        document.getElementById("regularizationEmployeeId").value.trim();

    let attendanceDate =
        document.getElementById("regularizationDate").value;

    let reason =
        document.getElementById("regularizationReason").value.trim();


    if (employeeId === "" || attendanceDate === "" || reason === "") {

        alert("Please fill all fields");

        return;
    }


    // Check whether this attendance was actually Late
    const { data: attendance, error: attendanceError } =
        await supabaseClient
            .from("attendance")
            .select("attendance_status")
            .eq("employee_id", employeeId)
            .eq("attendance_date", attendanceDate)
            .single();


    if (attendanceError) {

        alert("Attendance record not found for this date.");

        return;
    }


    if (attendance.attendance_status !== "Late") {

        alert("Regularization is only available for Late attendance.");

        return;
    }


    // Find first and last date of current month
    let now = new Date();

    let firstDay =
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-01";

    let nextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
    );

    let nextMonthFirstDay =
        nextMonth.getFullYear() + "-" +
        String(nextMonth.getMonth() + 1).padStart(2, "0") +
        "-01";


    // Count regularization requests this month
    const { count, error: countError } =
        await supabaseClient
            .from("late_regularizations")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("employee_id", employeeId)
            .gte("attendance_date", firstDay)
            .lt("attendance_date", nextMonthFirstDay);


    if (countError) {

        alert("Error checking regularization limit: " + countError.message);

        return;
    }


    // Maximum 6 regularizations per month
    if (count >= 6) {

        alert(
            "You have already used 6 late regularizations this month."
        );

        return;
    }


    // Save request
    const { error } = await supabaseClient
        .from("late_regularizations")
        .insert([
            {
                employee_id: employeeId,
                attendance_date: attendanceDate,
                reason: reason,
                status: "Pending"
            }
        ]);


    if (error) {

        alert("Error submitting request: " + error.message);

        return;
    }


    document.getElementById("regularizationMessage").innerText =
        "Late regularization request submitted successfully!";


    alert(
        "Regularization request submitted!\n\nStatus: Pending"
    );


    // Clear form
    document.getElementById("regularizationEmployeeId").value = "";
    document.getElementById("regularizationDate").value = "";
    document.getElementById("regularizationReason").value = "";
}
