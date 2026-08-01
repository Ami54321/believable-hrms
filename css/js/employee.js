console.log("employee.js loaded");
console.log(supabase);

document.getElementById("saveEmployeeBtn").addEventListener("click", saveEmployee);

async function saveEmployee() {

    const employee_id = document.getElementById("employeeId").value.trim();
    const full_name = document.getElementById("fullName").value.trim();
    const password = document.getElementById("password").value.trim();
    const leave_balance = parseInt(document.getElementById("leaveBalance").value);
    const status = document.getElementById("status").value;
    const role = "Employee";

    if (!employee_id || !full_name || !password) {
        alert("Please fill all required fields.");
        return;
    }

    const { error } = await supabase
        .from("employees")
        .insert([
            {
                employee_id,
                full_name,
                password,
                leave_balance,
                status,
                role
            }
        ]);

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Employee Added Successfully!");

        document.getElementById("employeeId").value = "";
        document.getElementById("fullName").value = "";
        document.getElementById("password").value = "";
        document.getElementById("leaveBalance").value = 12;
        document.getElementById("status").value = "Active";
    }
}
