async function checkIn() {

    let employeeId = document.getElementById("employeeId").value.trim();

    if (employeeId === "") {
        alert("Please enter Employee ID");
        return;
    }

    let nowDate = new Date();

let today =
    nowDate.getFullYear() + "-" +
    String(nowDate.getMonth() + 1).padStart(2, "0") + "-" +
    String(nowDate.getDate()).padStart(2, "0");

let now =
    today + " " +
    String(nowDate.getHours()).padStart(2, "0") + ":" +
    String(nowDate.getMinutes()).padStart(2, "0") + ":" +
    String(nowDate.getSeconds()).padStart(2, "0");

    const { error } = await supabaseClient
        .from("attendance")
        .insert([
            {
                employee_id: employeeId,
                attendance_date: today,
                check_in: now
            }
        ]);

    if (error) {
        alert("Error: " + error.message);
        return;
    }

    document.getElementById("message").innerText =
        "Check In successful!";

    alert("Attendance marked successfully!");
}