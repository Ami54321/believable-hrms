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