console.log(supabaseClient);
function addEmployee() {

    let empid = document.getElementById("empid").value;
    let fullname = document.getElementById("fullname").value;
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