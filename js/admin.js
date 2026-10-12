
console.log("Admin JS loaded");

// =====================================
// LOAD LATE REGULARIZATION REQUESTS
// =====================================
async function loadRegularizations() {
    const table = document.getElementById("regularizationTable");

    if (!table) {
        console.warn("Regularization table not found.");
        return;
    }

    table.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

    const { data, error } = await supabaseClient
        .from("late_regularizations")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error("Regularization error:", error);
        table.innerHTML =
            "<tr><td colspan='5'>Error loading requests</td></tr>";
        alert("Regularization error: " + error.message);
        return;
    }

    if (!data || data.length === 0) {
        table.innerHTML =
            "<tr><td colspan='5'>No regularization requests</td></tr>";
        return;
    }

    table.innerHTML = "";

    data.forEach(request => {
        const row = document.createElement("tr");

        [
            request.employee_id,
            request.attendance_date,
            request.reason,
            request.status
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "";
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");

        if (request.status === "Pending") {
            const approve = document.createElement("button");
            approve.textContent = "Approve";
            approve.className = "approve";
            approve.onclick = () => updateRegularization(request.id, "Approved");

            const reject = document.createElement("button");
            reject.textContent = "Reject";
            reject.className = "reject";
            reject.onclick = () => updateRegularization(request.id, "Rejected");

            actionCell.appendChild(approve);
            actionCell.appendChild(document.createTextNode(" "));
            actionCell.appendChild(reject);
        } else {
            actionCell.textContent = "No action needed";
        }

        row.appendChild(actionCell);
        table.appendChild(row);
    });
}

// =====================================
// APPROVE OR REJECT REGULARIZATION
// =====================================
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
        alert("Request was not updated. It may already have been processed, or database permissions may prevent the change.");
        await loadRegularizations();
        return;
    }

    alert("Regularization " + status.toLowerCase() + "!");
    await loadRegularizations();
}

// =====================================
// LOAD EMPLOYEE LEAVE REQUESTS
// =====================================
async function loadLeaveRequests() {
    const table = document.getElementById("leaveRequestsTable");

    if (!table) {
        console.warn("Leave requests table not found.");
        return;
    }

    table.innerHTML =
        "<tr><td colspan='7'>Loading leave requests...</td></tr>";

    try {
        console.log("Loading leave requests from Supabase...");

        const { data, error } = await supabaseClient
            .from("leaves")
            .select("*")
            .order("id", { ascending: false });

        console.log("Leave data:", data);
        console.log("Leave error:", error);

        if (error) {
            console.error("Leave loading error:", error);
            table.innerHTML =
                "<tr><td colspan='7'>Could not load leave requests.</td></tr>";
            alert("Leave loading error: " + error.message);
            return;
        }

        if (!data || data.length === 0) {
            table.innerHTML =
                "<tr><td colspan='7'>No leave requests yet.</td></tr>";
            return;
        }

        table.innerHTML = "";

        data.forEach(leave => {
            const row = document.createElement("tr");

            [
                leave.employee_id,
                leave.leave_type,
                leave.start_date,
                leave.end_date,
                leave.reason,
                leave.status
            ].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");

            if (leave.status === "Pending") {
                const approve = document.createElement("button");
                approve.textContent = "Approve";
                approve.onclick = () => updateLeaveStatus(leave.id, "Approved");

                const reject = document.createElement("button");
                reject.textContent = "Reject";
                reject.onclick = () => updateLeaveStatus(leave.id, "Rejected");

                actionCell.appendChild(approve);
                actionCell.appendChild(document.createTextNode(" "));
                actionCell.appendChild(reject);
            } else {
                actionCell.textContent = "No action needed";
            }

            row.appendChild(actionCell);
            table.appendChild(row);
        });
    } catch (err) {
        console.error("Unexpected leave error:", err);
        table.innerHTML =
            "<tr><td colspan='7'>Unexpected error loading leave requests.</td></tr>";
        alert("Unexpected leave error: " + err.message);
    }
}

// =====================================
// APPROVE OR REJECT LEAVE
// =====================================
async function updateLeaveStatus(id, status) {
    if (!confirm("Are you sure you want to " + status.toLowerCase() + " this leave request?")) {
        return;
    }

    const { data, error } = await supabaseClient
        .from("leaves")
        .update({ status: status })
        .eq("id", id)
        .eq("status", "Pending")
        .select();

    if (error) {
        alert("Error updating leave: " + error.message);
        return;
    }

    if (!data || data.length === 0) {
        alert("Leave request was not updated. It may already have been processed, or database permissions may prevent the change.");
        await loadLeaveRequests();
        return;
    }

    alert("Leave request " + status.toLowerCase() + "!");
    await loadLeaveRequests();
}

// =====================================
// LOAD TABLES WHEN ADMIN PAGE OPENS
// =====================================
loadRegularizations();
loadLeaveRequests();

