console.log(supabaseClient);

// Add Employee
async function addEmployee() {

    let empid = document.getElementById("empid").value;
    let fullname = document.getElementById("fullname").value;
    let password = document.getElementById("password").value;
    let status = document.getElementById("status").value;

    if (empid === "" || fullname === "" || password === "") {
        alert("Please fill all fields");
        return;
    }

    const { error } = await supabaseClient
        .from("employees")
        .insert([
            {
                employee_id: empid,
                full_name: fullname,
                password: password,
                leave_balance: 12,
                status: status,
                role: "Employee"
            }
        ]);

    if (error) {
        alert(error.message);
        return;
    }

    alert("Employee saved to Supabase successfully!");

    document.getElementById("empid").value = "";
    document.getElementById("fullname").value = "";
    document.getElementById("password").value = "";
    document.getElementById("status").value = "Active";

    loadEmployees();
}


// Load Employees
async function loadEmployees() {

    const { data, error } = await supabaseClient
        .from("employees")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        alert(error.message);
        return;
    }

    let table = document.getElementById("employeeTable");

    table.innerHTML = "";

    data.forEach(emp => {

        table.innerHTML += `
        <tr>
            <td>${emp.employee_id}</td>
            <td>${emp.full_name}</td>
            <td>${emp.status}</td>
            <td>
                <button onclick="editEmployee(this)">Edit</button>
                <button onclick="deleteEmployee(this)">Delete</button>
            </td>
        </tr>
        `;

    });
}


// Delete Employee
async function deleteEmployee(button) {

    let row = button.closest("tr");

    let employeeId = row.cells[0].innerText;

    if (!confirm("Are you sure you want to delete this employee?")) {
        return;
    }

    const { error } = await supabaseClient
        .from("employees")
        .delete()
        .eq("employee_id", employeeId);

    if (error) {
        alert("Error deleting employee: " + error.message);
        return;
    }

    alert("Employee deleted successfully!");

    loadEmployees();
}


// Search Employee
function searchEmployee() {

    let input = document.getElementById("searchBox").value.toLowerCase();

    let rows = document.querySelectorAll("#employeeTable tr");

    rows.forEach(function(row) {

        if (row.innerText.toLowerCase().includes(input)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }

    });
}


// Edit Employee
async function editEmployee(button) {

    let row = button.closest("tr");

    let employeeId = row.cells[0].innerText;

    let newName = prompt(
        "Enter new employee name:",
        row.cells[1].innerText
    );

    if (newName == null || newName.trim() === "") {
        return;
    }

    let newPassword = prompt(
        "Enter new password:",
        ""
    );

    if (newPassword == null || newPassword.trim() === "") {
        return;
    }

    let newStatus = prompt(
        "Enter Status (Active/Inactive):",
        row.cells[2].innerText
    );

    if (newStatus == null || newStatus.trim() === "") {
        return;
    }

    const { error } = await supabaseClient
        .from("employees")
        .update({
            full_name: newName,
            password: newPassword,
            status: newStatus
        })
        .eq("employee_id", employeeId);

    if (error) {
        alert("Error updating employee: " + error.message);
        return;
    }

    alert("Employee updated successfully!");

    loadEmployees();
}


// Load Employees When Page Opens
loadEmployees();