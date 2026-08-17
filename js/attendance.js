async function checkIn() {

    let employeeId = document.getElementById("employeeId").value.trim();

    if (employeeId === "") {
        alert("Please enter Employee ID");
        return;
    }

    let today = new Date().toISOString().split("T")[0];

    let now = new Date().toISOString();

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