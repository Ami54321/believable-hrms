
// ================================
// LOAD LATE REGULARIZATION REQUESTS
// ================================

async function loadRegularizations() {
    const tableBody = document.getElementById("regularizationTable");

    if (!tableBody) {
        console.error("regularizationTable not found.");
        return;
    }

    tableBody.innerHTML = "<tr><td colspan='6'>Loading...</td></tr>";

    const { data, error } = await supabaseClient
        .from("late_regularizations")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error("Error loading regularizations:", error);
        tableBody.innerHTML =
            `<tr><td colspan="6">Error: ${escapeHtml(error.message)}</td></tr>`;
        return;
    }

    tableBody.innerHTML = "";

    if (!data || data.length === 0) {
        tableBody.innerHTML =
            "<tr><td colspan='6'>No regularization requests found.</td></tr>";
        return;
    }

    data.forEach((request) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(request.employee_id)}</td>
            <td>${escapeHtml(request.date)}</td>
            <td>${escapeHtml(request.reason)}</td>
            <td>${escapeHtml(request.status)}</td>
            <td>
                ${
                    request.status === "Pending"
                        ? `
                            <button type="button"
                                onclick="updateRegularization(${Number(request.id)}, 'Approved')">
                                Approve
                            </button>
                            <button type="button"
                                onclick="updateRegularization(${Number(request.id)}, 'Rejected')">
                                Reject
                            </button>
                        `
                        : "-"
                }
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// ================================
// APPROVE OR REJECT REGULARIZATION
// ================================

async function updateRegularization(id, status) {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) {
        return;
    }

    const { data, error } = await supabaseClient
        .from("late_regularizations")
        .update({ status: status })
        .eq("id", id)
        .eq("status", "Pending")
        .select();

    if (error) {
        console.error("Regularization update error:", error);
        alert("Error updating request: " + error.message);
        return;
    }

    if (!data || data.length === 0) {
        alert("Request was not updated. It may already have been processed.");
        await loadRegularizations();
        return;
    }

    alert("Regularization request " + status.toLowerCase() + "!");
    await loadRegularizations();
}


// ================================
// LOAD LEAVE REQUESTS
// ================================

async function loadLeaveRequests() {
    const tableBody = document.getElementById("leaveTable");

    if (!tableBody) {
        console.error("leaveTable not found.");
        return;
    }

    tableBody.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";

    const { data, error } = await supabaseClient
        .from("leaves")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error("Error loading leave requests:", error);
        tableBody.innerHTML =
            `<tr><td colspan="7">Error: ${escapeHtml(error.message)}</td></tr>`;
        return;
    }

    tableBody.innerHTML = "";

    if (!data || data.length === 0) {
        tableBody.innerHTML =
            "<tr><td colspan='7'>No leave requests found.</td></tr>";
        return;
    }

    data.forEach((leave) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(leave.employee_id)}</td>
            <td>${escapeHtml(leave.leave_type)}</td>
            <td>${escapeHtml(leave.start_date)}</td>
            <td>${escapeHtml(leave.end_date)}</td>
            <td>${escapeHtml(leave.reason)}</td>
            <td>${escapeHtml(leave.status)}</td>
            <td>
                ${
                    leave.status === "Pending"
                        ? `
                            <button type="button"
                                onclick="updateLeaveStatus(${Number(leave.id)}, 'Approved')">
                                Approve
                            </button>
                            <button type="button"
                                onclick="updateLeaveStatus(${Number(leave.id)}, 'Rejected')">
                                Reject
                            </button>
                        `
                        : "-"
                }
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// ================================
// APPROVE OR REJECT LEAVE
// Uses the Supabase process_leave_request function
// to update status and deduct leave balance together.
// ================================

async function updateLeaveStatus(id, status) {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) {
        return;
    }

    try {
        const { data, error } = await supabaseClient.rpc(
            "process_leave_request",
            {
                p_leave_id: id,
                p_decision: status
            }
        );

        if (error) {
            console.error("Leave processing error:", error);
            alert("Error processing leave: " + error.message);
            return;
        }

        alert(data || "Leave request processed successfully.");

        await loadLeaveRequests();

    } catch (err) {
        console.error("Unexpected leave processing error:", err);
        alert("Unexpected error: " + err.message);
    }
}


// ================================
// SAFELY DISPLAY DATABASE TEXT
// ================================

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


// ================================
// LOAD TABLES WHEN PAGE OPENS
// ================================

document.addEventListener("DOMContentLoaded", function () {
    loadRegularizations();
    loadLeaveRequests();
});
```
