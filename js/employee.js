function addEmployee() {

    let empid = document.getElementById("empid").value;
    let fullname = document.getElementById("fullname").value;
    let status = document.getElementById("status").value;

    if(empid=="" || fullname==""){
        alert("Please fill all fields");
        return;
    }

    let table = document.getElementById("employeeTable");

    if(table.innerHTML.includes("No Employees Added Yet")){
    table.innerHTML = "";
}

table.innerHTML += `
<tr>
    <td>${empid}</td>
    <td>${fullname}</td>
    <td>${status}</td>
</tr>
`;

    document.getElementById("empid").value="";
    document.getElementById("fullname").value="";
    document.getElementById("password").value="";
    document.getElementById("status").value="Active";
}