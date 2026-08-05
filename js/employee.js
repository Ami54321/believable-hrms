console.log(supabaseClient);
async function addEmployee() {

    let empid = document.getElementById("empid").value;
    let fullname = document.getElementById("fullname").value;
    let password = document.getElementById("password").value;
    let status = document.getElementById("status").value;

    if (empid === "" || fullname === "") {
        alert("Please fill all fields");
        return;
    }

    let table = document.getElementById("employeeTable");

    if (table.innerHTML.includes("No Employees Added Yet")) {
        table.innerHTML = "";
    }

    let row = `
    <tr>
        <td>${empid}</td>
        <td>${fullname}</td>
        <td>${status}</td>
        <td>
    <button onclick="editEmployee(this)">Edit</button>
    <button onclick="deleteEmployee(this)">Delete</button>
</td>
    </tr>
    `;

 table.innerHTML += row;

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
} else {
    alert("Employee saved to Supabase successfully!");
}

document.getElementById("empid").value = "";
document.getElementById("fullname").value = "";
document.getElementById("password").value = "";
document.getElementById("status").value = "Active";
}

function deleteEmployee(button) {
    if (confirm("Are you sure you want to delete this employee?")) {
        button.closest("tr").remove();
    }
}
function searchEmployee() {

    let input = document.getElementById("searchBox").value.toLowerCase();

    let rows = document.querySelectorAll("#employeeTable tr");

    rows.forEach(function(row){

        if(row.innerText.toLowerCase().includes(input)){
            row.style.display = "";
        }
        else{
            row.style.display = "none";
        }

    });

}
function editEmployee(button){

    let row = button.closest("tr");

    let nameCell = row.cells[1];
    let statusCell = row.cells[2];

    let newName = prompt("Enter new employee name:", nameCell.innerText);

    if(newName == null || newName.trim() == ""){
        return;
    }

    let newStatus = prompt("Enter Status (Active/Inactive):", statusCell.innerText);

    if(newStatus == null || newStatus.trim() == ""){
        return;
    }

    nameCell.innerText = newName;
    statusCell.innerText = newStatus;

    alert("Employee updated successfully!");
}
async function loadEmployees() {

    const { data, error } = await supabaseClient
        .from("employees")
        .select("*");

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
loadEmployees();