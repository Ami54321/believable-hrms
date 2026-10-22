
/* BELIEVABLE HRMS - ADMIN.JS */

// Load Late Regularization Requests
async function loadRegularizations() {
    const tableBody = document.getElementById("regularizationTable");
    if (!tableBody) return;

    tableBody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

    try {
        const { data, error } = await supabaseClient
            .from("late_regularizations")
            .select("*")
            .order("id", { ascending: false });

        if (error) throw error;

        tableBody.innerHTML = "";

        if (!data || data.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='5'>No requests found.</td></tr>";
            return;
        }

        data.forEach(function (request) {
            const row = document.createElement("tr");

            const employee = document.createElement("td");
            employee.textContent = request.employee_id || "";

            const date = document.createElement("td");
            date.textContent = request.attendance_date || request.date || "";

            const reason = document.createElement("td");
            reason.textContent = request.reason || "";

            const status = document.createElement("td");
            status.textContent = request.status || "";

            const actions = document.createElement("td");

            if (request.status === "Pending") {
                const approve = document.createElement("button");
                approve.textContent = "Approve";
                approve.onclick = function () {
                    updateRegularization(request.id, "Approved");
                };

                const reject = document.createElement("button");
                reject.textContent = "Reject";
                reject.onclick = function () {
                    updateRegularization(request.id, "Rejected");
                };

                actions.appendChild(approve);
                actions.appendChild(reject);
            } else {
                actions.textContent = "-";
            }

            row.append(employee, date, reason, status, actions);
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        tableBody.innerHTML =
            "<tr><td colspan='5'>Error loading requests: " +
            String(error.message) + "</td></tr>";
    }
}


// Approve or Reject Regularization
async function updateRegularization(id, status) {
    if (!confirm("Are you sure you want to " + status + " this request?")) return;

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
        console.error(error);
        alert("Regularization error: " + error.message);
    }
}


// Load Leave Requests
async function loadLeaveRequests() {
    const tableBody = document.getElementById("leaveRequestsTable");
    if (!tableBody) return;

    tableBody.innerHTML = "<tr><td colspan='7'>Loading leave requests...</td></tr>";

    try {
        const { data, error } = await supabaseClient
            .from("leaves")
            .select("*")
            .order("id", { ascending: false });

        if (error) throw error;

        tableBody.innerHTML = "";

        if (!data || data.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='7'>No leave requests found.</td></tr>";
            return;
        }

        data.forEach(function (leave) {
            const row = document.createElement("tr");

            const employee = document.createElement("td");
            employee.textContent = leave.employee_id || "";

            const type = document.createElement("td");
            type.textContent = leave.leave_type || "";

            const start = document.createElement("td");
            start.textContent = leave.start_date || "";

            const end = document.createElement("td");
            end.textContent = leave.end_date || "";

            const reason = document.createElement("td");
            reason.textContent = leave.reason || "";

            const status = document.createElement("td");
            status.textContent = leave.status || "";

            const actions = document.createElement("td");

            if (leave.status === "Pending") {
                const approve = document.createElement("button");
                approve.textContent = "Approve";
                approve.onclick = function () {
                    updateLeaveStatus(leave.id, "Approved");
                };

                const reject = document.createElement("button");
                reject.textContent = "Reject";
                reject.onclick = function () {
                    updateLeaveStatus(leave.id, "Rejected");
                };

                actions.appendChild(approve);
                actions.appendChild(reject);
            } else {
                actions.textContent = "-";
            }

            row.append(employee, type, start, end, reason, status, actions);
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        tableBody.innerHTML =
            "<tr><td colspan='7'>Error loading leaves: " +
            String(error.message) + "</td></tr>";
    }
}


// Approve or Reject Leave and Deduct Balance
async function updateLeaveStatus(id, status) {
    if (!confirm("Are you sure you want to " + status + " this leave?")) return;

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
        console.error(error);
        alert("Leave processing error: " + error.message);
    }
}


// Load Tables When Admin Page Opens
document.addEventListener("DOMContentLoaded", function () {
    if (typeof supabaseClient === "undefined") {
        console.error("Supabase client is not loaded.");
        alert("Supabase connection is not loaded. Please check your existing script setup.");
        return;
    }

    loadRegularizations();
    loadLeaveRequests();
});
