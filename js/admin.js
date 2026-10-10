console.log("Admin JS loaded");

// ==========================
// Load Regularization Requests
// ==========================
async function loadRegularizations() {

    const { data, error } = await supabaseClient
        .from("late_regularizations")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        alert("Error loading requests: " + error.message);
        return;
    }

    let table = document.getElementById("regularizationTable");

    table.innerHTML = "";

    if (data.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5">No regularization requests</td>
            </tr>
        `;
        return;
    }

    data.forEach(request => {

        table.innerHTML += `
            <tr>
                <td>${request.employee_id}</td>
                <td>${request.attendance_date}</td>
                <td>${request.reason}</td>
                <td>${request.status}</td>

                <td>

                    <button
                        class="approve"
                        onclick="approveRequest(${request.id})">
                        Approve
                    </button>

                    <button
                        class="reject"
                        onclick="rejectRequest(${request.id})">
                        Reject
                    </button>

                </td>
            </tr>
        `;

    });
}


// ==========================
// Approve Request
// ==========================
async function approveRequest(id) {

    if (!confirm("Approve this regularization request?")) {
        return;
    }

    const { error } = await supabaseClient
        .from("late_regularizations")
        .update({
            status: "Approved"
        })
        .eq("id", id);

    if (error) {
        alert("Error: " + error.message);
        return;
    }

    alert("Regularization approved!");

    loadRegularizations();
}


// ==========================
// Reject Request
// ==========================
async function rejectRequest(id) {

    if (!confirm("Reject this regularization request?")) {
        return;
    }

    const { error } = await supabaseClient
        .from("late_regularizations")
        .update({
            status: "Rejected"
        })
        .eq("id", id);

    if (error) {
        alert("Error: " + error.message);
        return;
    }

    alert("Regularization rejected!");

    loadRegularizations();
}


// ==========================
// Load when Admin page opens
// ==========================
loadRegularizations();

 // ==========================
 // Load Employee Leave Requests
 // ==========================
async function loadLeaveRequests() {
    const table = document.getElementById("leaveRequestsTable");

    if (!table) return;

    table.innerHTML = `
        <tr><td colspan="7">Loading...</td></tr>
    `;

    const { data, error } = await supabaseClient
        .from("leaves")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        table.innerHTML = `
            <tr><td colspan="7">Error loading leave requests</td></tr>
        `;
        alert("Error loading leave requests: " + error.message);
        return;
    }

    if (!data || data.length === 0) {
        table.innerHTML = `
            <tr><td colspan="7">No leave requests yet</td></tr>
        `;
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
            const approveButton = document.createElement("button");
            approveButton.textContent = "Approve";
            approveButton.onclick = () => updateLeaveStatus(leave.id, "Approved");

            const rejectButton = document.createElement("button");
            rejectButton.textContent = "Reject";
            rejectButton.onclick = () => updateLeaveStatus(leave.id, "Rejected");

            actionCell.appendChild(approveButton);
            actionCell.appendChild(document.createTextNode(" "));
            actionCell.appendChild(rejectButton);
        } else {
            actionCell.textContent = "No action needed";
        }

        row.appendChild(actionCell);
        table.appendChild(row);
    });
}

// ==========================
// Approve or Reject Leave
// ==========================
async function updateLeaveStatus(id, status) {
    if (!confirm("Are you sure you want to " + status.toLowerCase() + " this leave request?")) {
        return;
    }

    const { error } = await supabaseClient
        .from("leaves")
        .update({ status: status })
        .eq("id", id)
        .eq("status", "Pending");

    if (error) {
        alert("Error updating leave: " + error.message);
        return;
    }

    alert("Leave request " + status.toLowerCase() + "!");
    await loadLeaveRequests();
}

// Load leave requests when the Admin page opens
loadLeaveRequests();
