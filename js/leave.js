
async function applyLeave() {
    const employeeId = document.getElementById("leaveEmployeeId").value.trim();
    const leaveType = document.getElementById("leaveType").value;
    const startDate = document.getElementById("leaveStartDate").value;
    const endDate = document.getElementById("leaveEndDate").value;
    const reason = document.getElementById("leaveReason").value.trim();
    const message = document.getElementById("leaveMessage");

    if (!employeeId || !startDate || !endDate || !reason) {
        alert("Please fill in all fields.");
        return;
    }

    if (endDate < startDate) {
        alert("End date cannot be before start date.");
        return;
    }

    const { data: employee, error: employeeError } = await supabaseClient
        .from("employees")
        .select("employee_id, status")
        .eq("employee_id", employeeId)
        .maybeSingle();

    if (employeeError || !employee || employee.status !== "Active") {
        alert("Employee ID not found or employee is inactive.");
        return;
    }

    const { error } = await supabaseClient
        .from("leaves")
        .insert([{
            employee_id: employeeId,
            leave_type: leaveType,
            start_date: startDate,
            end_date: endDate,
            reason: reason,
            status: "Pending"
        }]);

    if (error) {
        alert("Could not submit leave application: " + error.message);
        return;
    }

    message.innerText = "Leave application submitted successfully! Status: Pending";
    alert("Leave application submitted successfully!");

    document.getElementById("leaveStartDate").value = "";
    document.getElementById("leaveEndDate").value = "";
    document.getElementById("leaveReason").value = "";
}

