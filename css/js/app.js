function login() {

    const employeeId = document.getElementById("employeeId").value.trim().toUpperCase();
    const password = document.getElementById("password").value.trim();

    if (employeeId === "ADMIN" && password === "admin123") {
        window.location.href = "./admin.html";
    } else {
        alert("Invalid Employee ID or Password");
    }

}
