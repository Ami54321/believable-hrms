// ==========================
// CHECK IN
// ==========================
async function checkIn() {

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
        alert("Error: " + error.message);
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
        .select("check_in")
        .eq("employee_id", employeeId)
        .eq("attendance_date", today)
        .single();


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
        alert("Error: " + error.message);
        return;
    }


    document.getElementById("message").innerText =
        "Check Out successful!";

    alert(
        "Check Out marked successfully!\n\n" +
        "Working Hours: " + workingHours
    );
}