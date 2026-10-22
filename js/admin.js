```javascript
// ==========================================
// BELIEVABLE HRMS - ADMIN JAVASCRIPT
// ==========================================


// Safely display database values
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


// ==========================================
// LOAD LATE REGULARIZATION REQUESTS
// ==========================================

async function loadRegularizations() {
    const tableBody = document.getElementById("regularizationTable");

    if (!tableBody) {
        console.error("Missing table body: regularizationTable");
        return;
    }

    tableBody.innerHTML = "<tr><td colspan='5'>Loading requests...</td></tr>";

    try {
        const { data, error } = await supabaseClient
            .from("late_regularizations")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            throw error;
        }

        tableBody.innerHTML = "";

        if (!data || data.length === 0) {
            tableBody.innerHTML =
                "<tr><td colspan='5'>No regularization requests found.</td></tr>";
            return;
        }

        data.forEach(function (request) {
            const row = document.createElement("tr");

            const actionButtons = request.status === "Pending"
                ? `<button type="button" onclick="updateRegularization(${Number(request.id)}, 'Approved')">Approve</button>
                   <button type="button" onclick="updateRegularization(${Number(request.id)}, 'Rejected')">Reject</button>`
                : "-";

            row.innerHTML = `
                <td>${escapeHtml(request.employee_id)}</td>
                <td>${escapeHtml(request.date)}</td>
                <td>${escapeHtml(request.reason)}</td>
                <td>${escapeHtml(request.status)}</td>
                <td>${actionButtons}</td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Could not load regularization requests:", error);
        tableBody.innerHTML =
            `<tr><td colspan="5">Error: ${escapeHtml(error.message)}</td></tr>`;
    }
}


// ==========================================
// APPROVE OR REJECT REGULARIZATION
// ==========================================

async function updateRegularization(id, status) {
    if (!["Approved", "Rejected"].includes(status)) {
        alert("Invalid request status.");
        return;
    }

    if (!confirm("Are you sure you want to " + status.toLowerCase() + " this request?")) {
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from("late_regularizations")
            .update({ status: status })
            .eq("id", id)
            .eq("status", "Pending")
            .select();

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            alert("The request was not changed. It may already have been processed.");
        } else {
            alert("Regularization request " + status.toLowerCase() + " successfully.");
        }

        await loadRegularizations();

    } catch (error) {
        console.error("Regularization update failed:", error);
        alert("Error updating regularization: " + error.message);
    }
}


// ==========================================
// LOAD EMPLOYEE LEAVE REQUESTS
// ==========================================

async function loadLeaveRequests() {
    const tableBody = document.getElementById("leaveTable");

    if (!tableBody) {
        console.error("Missing table body: leaveTable");
        return;
    }

    tableBody.innerHTML = "<tr><td colspan='7'>Loading leave requests...</td></tr>";

    try {
        const { data, error } = await supabaseClient
            .from("leaves")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            throw error;
        }

        tableBody.innerHTML = "";

        if (!data || data.length === 0) {
            tableBody.innerHTML =
                "<tr><td colspan='7'>No leave requests found.</td></tr>";
            return;
        }

        data.forEach(function (leave) {
            const row = document.createElement("tr");

            const actionButtons = leave.status === "Pending"
                ? `<button type="button" onclick="updateLeaveStatus(${Number(leave.id)}, 'Approved')">Approve</button>
                   <button type="button" onclick="updateLeaveStatus(${Number(leave.id)}, 'Rejected')">Reject</button>`
                : "-";

            row.innerHTML = `
                <td>${escapeHtml(leave.employee_id)}</td>
                <td>${escapeHtml(leave.leave_type)}</td>
                <td>${escapeHtml(leave.start_date)}</td>
                <td>${escapeHtml(leave.end_date)}</td>
                <td>${escapeHtml(leave.reason)}</td>
                <td>${escapeHtml(leave.status)}</td>
                <td>${actionButtons}</td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Could not load leave requests:", error);
        tableBody.innerHTML =
            `<tr><td colspan="7">Error: ${escapeHtml(error.message)}</td></tr>`;
    }
}


// ==========================================
// APPROVE OR REJECT LEAVE
// Calls the Supabase function that updates
// leave status and deducts the balance.
// ==========================================

async function updateLeaveStatus(id, status) {
    if (!["Approved", "Rejected"].includes(status)) {
        alert("Invalid leave status.");
        return;
    }

    if (!confirm("Are you sure you want to " + status.toLowerCase() + " this leave request?")) {
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
            throw error;
        }

        alert(data || "Leave request processed successfully.");

        await loadLeaveRequests();

    } catch (error) {
        console.error("Leave processing failed:", error);
        alert("Error processing leave: " + error.message);
    }
}


// ==========================================
// LOAD REQUESTS WHEN ADMIN PAGE OPENS
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    if (typeof supabaseClient === "undefined") {
        console.error("supabaseClient is missing. Check the Supabase script setup.");
        alert("Supabase is not connected. Please check the script setup.");
        return;
    }

    loadRegularizations();
    loadLeaveRequests();
});
```
