```javascript
// ==============================
// LOAD LATE REGULARIZATION REQUESTS
// ==============================

async function loadRegularizations() {
    const tableBody = document.getElementById("regularizationTable");

    if (!tableBody) {
        console.error("regularizationTable not found");
        return;
    }

    const { data, error } = await supabaseClient
        .from("late_regularizations")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error("Error loading regularizations:", error);
        tableBody.innerHTML =
            `<tr><td colspan="5">Error: ${error.message}</td></tr>`;
        return;
    }

    tableBody.innerHTML = "";

    if (!data || data.length === 0) {
        tableBody.innerHTML =
            "<tr><td colspan='5'>No regularization requests found</td></tr>";
        return;
    }

    data.forEach(function (request) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${request.employee_id ?? ""}</td>
            <td>${request.date ?? ""}</td>
            <td>${request.reason ?? ""}</td>
            <td>${request.status ?? ""}</td>
            <td>
                ${request.status === "Pending"
                    ? `<button onclick="updateRegularization(${Number(request.id)}, 'Approved')">Approve</button>
                       <button onclick="updateRegularization(${Number(request.id)}, 'Rejected')">Reject</button>`
                    : "-"
                }
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// ==============================
// UPDATE REGULARIZATION STATUS
// ==============================

async function updateRegularization(id, status) {
    if (!confirm("Are you sure you want to " + status.toLowerCase() + " this request?")) {
        return;
    }

    const { data, error } = await supabaseClient
        .from("late_regularizations")
        .update({ status: status })
        .eq("id", id)
        .eq("status", "Pending")
        .select();

    if (error) {
        alert("Error updating regularization: " + error.message);
        return;
    }

    if (!data || data.length === 0) {
        alert("Request was not updated. It may already be processed.");
        await loadRegularizations();
        return;
    }

    alert("Regularization " + status.toLowerCase() + " successfully!");
    await loadRegularizations();
}


// ==============================
// LOAD LEAVE REQUESTS
// ==============================

async function loadLeaveRequests() {
    const tableBody = document.getElementById("leaveTable");

    if (!tableBody) {
        console.error("leaveTable not found");
        return;
    }

    const { data, error } = await supabaseClient
        .from("leaves")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error("Error loading leaves:", error);
        tableBody.innerHTML =
            `<tr><td colspan="7">Error: ${error.message}</td></tr>`;
        return;
    }

    tableBody.innerHTML = "";

    if (!data || data.length === 0) {
        tableBody.innerHTML =
            "<tr><td colspan='7'>No leave requests found</td></tr>";
        return;
    }

    data.forEach(function (leave) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${leave.employee_id ?? ""}</td>
            <td>${leave.leave_type ?? ""}</td>
            <td>${leave.start_date ?? ""}</td>
            <td>${leave.end_date ?? ""}</td>
            <td>${leave.reason ?? ""}</td>
            <td>${leave.status ?? ""}</td>
            <td>
                ${leave.status === "Pending"
                    ? `<button onclick="updateLeaveStatus(${Number(leave.id)}, 'Approved')">Approve</button>
                       <button onclick="updateLeaveStatus(${Number(leave.id)}, 'Rejected')">Reject</button>`
                    : "-"
                }
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// ==============================
// APPROVE OR REJECT LEAVE
// ==============================

async function updateLeaveStatus(id, status) {
    if (!confirm("Are you sure you want to " + status.toLowerCase() + " this leave request?")) {
        return;
    }

    const { data, error } = await supabaseClient.rpc(
        "process_leave_request",
        {
            p_leave_id: id,
            p_decision: status
        }
    );

    if (error) {
        console.error("Error processing leave:", error);
        alert("Error processing leave: " + error.message);
        return;
    }

    alert(data || "Leave request processed successfully!");

    await loadLeaveRequests();
}


// ==============================
// START WHEN PAGE LOADS
// ==============================

document.addEventListener("DOMContentLoaded", function () {
    loadRegularizations();
    loadLeaveRequests();
});
```
