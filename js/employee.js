alert("employee.js loaded");

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