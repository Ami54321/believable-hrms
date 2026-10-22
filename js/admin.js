```javascript
// ========================================
// BELIEVABLE HRMS - ADMIN.JS
// ========================================


// LOAD LATE REGULARIZATION REQUESTS

async function loadRegularizations() {
    const table = document.getElementById("regularizationTable");

    if (!table) {
        console.error("regularizationTable not found in admin.html");
        return;
    }

    table.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

    try {
        const { data, error } = await supabaseClient
            .from("late_regularizations")
            .select("*")
            .order("id", { ascending: true });

        if (error) throw error;

        table.innerHTML = "";

        if (!data || data.length === 0) {
            table.innerHTML =
                "<tr><td colspan='5'>No regularization requests found.</td></tr>";
            return;
        }

        data.forEach(function (item) {
            const row = document.createElement("tr");

            const employeeCell = document.createElement("td");
            employeeCell.textContent = item.employee_id || "";

            const dateCell = document.createElement("td");
            dateCell.textContent = item.attendance_date || "";

            const reasonCell = document.createElement("td");
            reasonCell.textContent = item.reason || "";

            const statusCell = document.createElement("td");
            statusCell.textContent = item.status || "";

            const actionCell = document.createElement("td");

            if (item.status === "Pending") {
                const approveButton = document.createElement("button");
                approveButton.textContent = "Approve";
                approveButton.onclick = function () {
                    updateRegularization(item.id, "Approved");
                };

                const rejectButton = document.createElement("button");
                rejectButton.textContent = "Reject";
                rejectButton.onclick = function () {
                    updateRegularization(item.id, "Rejected");
                };

                actionCell.appendChild(approveButton);
                actionCell.appendChild(rejectButton);
            } else {
                actionCell.textContent = "-";
            }

            row.appendChild(employeeCell);
            row.appendChild(dateCell);
            row.appendChild(reasonCell);
            row.appendChild(statusCell);
            row.appendChild(actionCell);

            table.appendChild(row);
        });

    } catch (error) {
        console.error("Regularization loading error:", error);
        table.innerHTML =
            "<tr><td colspan='5'>Could not load requests: " +
            String(error.message) + "</td></tr>";
    }
}


// APPROVE OR REJECT REGULARIZATION

async function updateRegularization(id, status) {
    const confirmed = confirm(
        "Are you sure you want to " + status.toLowerCase() + " this request?"
    );

    if (!confirmed) return;

    try {
        const { data, error } = await supabaseClient
            .from("late_regularizations")
            .update({ status: status })
            .eq("id", id)
            .eq("status", "Pending")
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            alert("Request was not updated. It may already be processed.");
        } else {
            alert("Regularization " + status.toLowerCase() + " successfully.");
        }

        await loadRegularizations();

    } catch (error) {
        console.error("Regularization update error:", error);
        alert("Error: " + error.message);
    }
}


// LOAD LEAVE REQUESTS

async function loadLeaveRequests() {
    const table = document.getElementById("leaveTable");

    if (!table) {
        console.error("leaveTable not found in admin.html");
        return;
    }

    table.innerHTML = "<tr><td colspan='7'>Loading leave requests...</td></tr>";

    try {
        const { data, error } = await supabaseClient
            .from("leaves")
            .select("*")
            .order("id", { ascending: false });

        if (error) throw error;

        table.innerHTML = "";

        if (!data || data.length === 0) {
            table.innerHTML =
                "<tr><td colspan='7'>No leave requests found.</td></tr>";
            return;
        }

        data.forEach(function (item) {
            const row = document.createElement("tr");

            const employeeCell = document.createElement("td");
            employeeCell.textContent = item.employee_id || "";

            const typeCell = document.createElement("td");
            typeCell.textContent = item.leave_type || "";

            const startCell = document.createElement("td");
            startCell.textContent = item.start_date || "";

            const endCell = document.createElement("td");
            endCell.textContent = item.end_date || "";

            const reasonCell = document.createElement("td");
            reasonCell.textContent = item.reason || "";

            const statusCell = document.createElement("td");
            statusCell.textContent = item.status || "";

            const actionCell = document.createElement("td");

            if (item.status === "Pending") {
                const approveButton = document.createElement("button");
                approveButton.textContent = "Approve";
                approveButton.onclick = function () {
                    updateLeaveStatus(item.id, "Approved");
                };

                const rejectButton = document.createElement("button");
                rejectButton.textContent = "Reject";
                rejectButton.onclick = function () {
                    updateLeaveStatus(item.id, "Rejected");
                };

                actionCell.appendChild(approveButton);
                actionCell.appendChild(rejectButton);
            } else {
                actionCell.textContent = "-";
            }

            row.appendChild(employeeCell);
            row.appendChild(typeCell);
            row.appendChild(startCell);
            row.appendChild(endCell);
            row.appendChild(reasonCell);
            row.appendChild(statusCell);
            row.appendChild(actionCell);

            table.appendChild(row);
        });

    } catch (error) {
        console.error("Leave loading error:", error);
        table.innerHTML =
            "<tr><td colspan='7'>Could not load leave requests: " +
            String(error.message) + "</td></tr>";
    }
}


// APPROVE OR REJECT LEAVE
// Uses the existing Supabase function to update
// the leave status and deduct the balance together.

async function updateLeaveStatus(id, status) {
    if (status !== "Approved" && status !== "Rejected") {
        alert("Invalid leave decision.");
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to " + status.toLowerCase() + " this leave request?"
    );

    if (!confirmed) return;

    try {
        const { data, error } = await supabaseClient.rpc(
            "process_leave_request",
            {
                p_leave_id: id,
                p_decision: status
            }
        );

        if (error) throw error;

        alert(data || "Leave request processed successfully.");

        await loadLeaveRequests();

    } catch (error) {
        console.error("Leave processing error:", error);
        alert("Error processing leave: " + error.message);
    }
}


// LOAD REQUESTS WHEN THE ADMIN PAGE OPENS

document.addEventListener("DOMContentLoaded", function () {
    loadRegularizations();
    loadLeaveRequests();
});
```
