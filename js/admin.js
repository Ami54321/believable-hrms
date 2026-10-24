
/* BELIEVABLE HRMS - ADMIN.JS */

// ------------------------------
// GENERAL HELPERS
// ------------------------------

function localDateString(date) {
    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}

function showMessage(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = message;
}

// ------------------------------
// DASHBOARD SUMMARY
// ------------------------------

async function loadDashboardSummary() {
    try {
        const today = localDateString(new Date());

        const [
            employeesResult,
            attendanceResult,
            regularizationsResult,
            leavesResult
        ] = await Promise.all([
            supabaseClient.from("employees")
                .select("id", { count: "exact", head: true }),

            supabaseClient.from("attendance")
                .select("employee_id, attendance_status")
                .eq("attendance_date", today),

            supabaseClient.from("late_regularizations")
                .select("id", { count: "exact", head: true })
                .eq("status", "Pending"),

            supabaseClient.from("leaves")
                .select("id", { count: "exact", head: true })
                .eq("status", "Pending")
        ]);

        if (employeesResult.error) throw employeesResult.error;
        if (attendanceResult.error) throw attendanceResult.error;
        if (regularizationsResult.error) throw regularizationsResult.error;
        if (leavesResult.error) throw leavesResult.error;

        const attendance = attendanceResult.data || [];
        const presentEmployees = new Set(
            attendance.filter(row => row.employee_id).map(row => row.employee_id)
        );

        const totalElement = document.getElementById("totalEmployees");
        const presentElement = document.getElementById("presentToday");
        const lateElement = document.getElementById("lateToday");
        const pendingElement = document.getElementById("pendingRequests");

        if (totalElement) totalElement.textContent = employeesResult.count ?? 0;
        if (presentElement) presentElement.textContent = presentEmployees.size;
        if (lateElement) {
            lateElement.textContent = attendance.filter(
                row => row.attendance_status === "Late"
            ).length;
        }
        if (pendingElement) {
            pendingElement.textContent =
                (regularizationsResult.count || 0) + (leavesResult.count || 0);
        }
    } catch (error) {
        console.error("Dashboard summary error:", error);
    }
}

// ------------------------------
// LOAD EMPLOYEES FOR CALENDAR
// ------------------------------

let calendarEmployees = [];
let calendarAttendance = [];
let calendarLeaves = [];
let selectedCalendarEmployee = null;
let selectedCalendarMonth = new Date().getFullYear() + "-" +
    String(new Date().getMonth() + 1).padStart(2, "0");

async function loadCalendarEmployees() {
    const options = document.getElementById("employeeOptions");
    if (!options) return;

    showMessage("calendarMessage", "Loading employees...");

    try {
        const { data, error } = await supabaseClient
            .from("employees")
            .select("employee_id, full_name, status")
            .order("full_name");

        if (error) throw error;

        calendarEmployees = data || [];
        options.innerHTML = "";

        calendarEmployees.forEach(employee => {
            const option = document.createElement("option");
            option.value = employee.employee_id + " - " + employee.full_name;
            options.appendChild(option);
        });

        showMessage(
            "calendarMessage",
            calendarEmployees.length
                ? "Select an employee and month, then click View Calendar."
                : "No employees were found."
        );
    } catch (error) {
        console.error("Employee list error:", error);
        showMessage("calendarMessage", "Could not load employees: " + error.message);
    }
}

function findCalendarEmployee(searchText) {
    const value = searchText.trim().toLowerCase();
    if (!value) return null;

    return calendarEmployees.find(employee =>
        employee.employee_id.toLowerCase() === value ||
        employee.full_name.toLowerCase() === value ||
        (employee.employee_id + " - " + employee.full_name).toLowerCase() === value
    ) || null;
}

// ------------------------------
// LOAD EMPLOYEE'S MONTHLY DATA
// ------------------------------

async function loadCalendar() {
    const searchInput = document.getElementById("employeeSearch");
    const monthInput = document.getElementById("calendarMonth");

    const employee = findCalendarEmployee(searchInput.value);

    if (!employee) {
        showMessage(
            "calendarMessage",
            "Please select an employee from the suggestions list."
        );
        return;
    }

    if (!monthInput.value) {
        showMessage("calendarMessage", "Please select a month.");
        return;
    }

    selectedCalendarEmployee = employee;
    selectedCalendarMonth = monthInput.value;

    const [year, month] = selectedCalendarMonth.split("-").map(Number);
    const monthStart = year + "-" + String(month).padStart(2, "0") + "-01";
    const nextMonthDate = new Date(year, month, 1);
    const nextMonthStart = localDateString(nextMonthDate);

    showMessage("calendarMessage", "Loading attendance and leave records...");

    try {
        const [attendanceResult, leavesResult] = await Promise.all([
            supabaseClient
                .from("attendance")
                .select("employee_id, attendance_date, check_in, check_out, working_hours, attendance_status")
                .eq("employee_id", employee.employee_id)
                .gte("attendance_date", monthStart)
                .lt("attendance_date", nextMonthStart)
                .order("attendance_date"),

            supabaseClient
                .from("leaves")
                .select("*")
                .eq("employee_id", employee.employee_id)
                .eq("status", "Approved")
                .lte("start_date", localDateString(new Date(year, month, 0)))
                .gte("end_date", monthStart)
        ]);

        if (attendanceResult.error) throw attendanceResult.error;
        if (leavesResult.error) throw leavesResult.error;

        calendarAttendance = attendanceResult.data || [];
        calendarLeaves = leavesResult.data || [];

        document.getElementById("calendarTitle").textContent =
            employee.full_name + " — " +
            new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric"
            });

        renderCalendar(year, month);
        showMessage(
            "calendarMessage",
            "Calendar loaded for " + employee.full_name + ". Select a date to view details."
        );
        showDayDetails(null);
    } catch (error) {
        console.error("Calendar loading error:", error);
        showMessage("calendarMessage", "Could not load calendar: " + error.message);
    }
}

// ------------------------------
// CALENDAR DISPLAY
// ------------------------------

function renderCalendar(year, month) {
    const grid = document.getElementById("calendarGrid");
    if (!grid) return;

    grid.innerHTML = "";

    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(day => {
        const heading = document.createElement("div");
        heading.className = "weekday";
        heading.textContent = day;
        grid.appendChild(heading);
    });

    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const startingOffset = (firstDay.getDay() + 6) % 7;
    const today = localDateString(new Date());

    for (let i = 0; i < startingOffset; i++) {
        const blank = document.createElement("div");
        blank.className = "day empty";
        grid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = year + "-" + String(month).padStart(2, "0") + "-" +
            String(day).padStart(2, "0");

        const dayDate = new Date(year, month - 1, day);
        const isSunday = dayDate.getDay() === 0;
        const isFuture = date > today;

        const attendance = calendarAttendance.find(
            row => row.attendance_date === date
        );

        const leave = calendarLeaves.find(row =>
            row.start_date <= date && row.end_date >= date
        );

        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "day";

        const number = document.createElement("div");
        number.className = "day-number";
        number.textContent = day;
        cell.appendChild(number);

        const status = document.createElement("span");
        status.className = "day-status";

        if (leave) {
            status.classList.add("leave");
            status.textContent = "Leave";
        } else if (attendance) {
            if (attendance.attendance_status === "Late") {
                status.classList.add("late");
                status.textContent = "Late";
            } else {
                status.classList.add("present");
                status.textContent = "Present";
            }
        } else if (isSunday) {
            status.classList.add("off");
            status.textContent = "Weekly Off";
        } else if (isFuture) {
            status.classList.add("off");
            status.textContent = "Upcoming";
        } else {
            status.classList.add("absent");
            status.textContent = "No Record";
        }

        cell.appendChild(status);
        cell.addEventListener("click", () => showDayDetails(date));
        grid.appendChild(cell);
    }
}

// ------------------------------
// DAILY DETAILS
// ------------------------------

function showDayDetails(date) {
    const box = document.getElementById("dayDetails");
    if (!box) return;

    box.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = date ? "Details for " + date : "Daily Details";
    box.appendChild(heading);

    if (!date) {
        const message = document.createElement("p");
        message.textContent = "Select a date in the calendar to see its records.";
        box.appendChild(message);
        return;
    }

    const attendance = calendarAttendance.find(
        row => row.attendance_date === date
    );

    const leave = calendarLeaves.find(row =>
        row.start_date <= date && row.end_date >= date
    );

    const details = [
        ["Employee", selectedCalendarEmployee.full_name],
        ["Employee ID", selectedCalendarEmployee.employee_id],
        ["Attendance", attendance
            ? (attendance.attendance_status || "Recorded")
            : "No attendance record"],
        ["Check In", attendance?.check_in || "—"],
        ["Check Out", attendance?.check_out || "—"],
        ["Working Hours", attendance?.working_hours || "—"],
        ["Leave", leave ? (leave.leave_type || "Approved leave") : "—"],
        ["Leave Reason", leave ? (leave.reason || "—") : "—"]
    ];

    details.forEach(([label, value]) => {
        const paragraph = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = label + ": ";
        paragraph.appendChild(strong);
        paragraph.appendChild(document.createTextNode(value));
        box.appendChild(paragraph);
    });
}

// ------------------------------
// LATE REGULARIZATION REQUESTS
// ------------------------------

async function loadRegularizations() {
    const tableBody = document.getElementById("regularizationTable");
    if (!tableBody) return;

    tableBody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

    try {
        const { data, error } = await supabaseClient
            .from("late_regularizations")
            .select("*")
            .order("id", { ascending: false });

        if (error) throw error;

        tableBody.innerHTML = "";

        if (!data || data.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='5'>No requests found.</td></tr>";
            return;
        }

        data.forEach(function (request) {
            const row = document.createElement("tr");

            const employee = document.createElement("td");
            employee.textContent = request.employee_id || "";

            const date = document.createElement("td");
            date.textContent = request.attendance_date || request.date || "";

            const reason = document.createElement("td");
            reason.textContent = request.reason || "";

            const status = document.createElement("td");
            status.textContent = request.status || "";

            const actions = document.createElement("td");

            if (request.status === "Pending") {
                const approve = document.createElement("button");
                approve.textContent = "Approve";
                approve.onclick = () => updateRegularization(request.id, "Approved");

                const reject = document.createElement("button");
                reject.textContent = "Reject";
                reject.onclick = () => updateRegularization(request.id, "Rejected");

                actions.append(approve, reject);
            } else {
                actions.textContent = "-";
            }

            row.append(employee, date, reason, status, actions);
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        tableBody.innerHTML =
            "<tr><td colspan='5'>Error loading requests: " +
            String(error.message) + "</td></tr>";
    }
}

async function updateRegularization(id, status) {
    if (!confirm("Are you sure you want to " + status + " this request?")) return;

    try {
        const { data, error } = await supabaseClient
            .from("late_regularizations")
            .update({ status })
            .eq("id", id)
            .eq("status", "Pending")
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            alert("Request was not updated. It may already be processed.");
        } else {
            alert("Regularization " + status.toLowerCase() + " successfully.");
        }

        await loadRegularizations();
        await loadDashboardSummary();
    } catch (error) {
        console.error(error);
        alert("Regularization error: " + error.message);
    }
}

// ------------------------------
// LEAVE REQUESTS
// ------------------------------

async function loadLeaveRequests() {
    const tableBody = document.getElementById("leaveRequestsTable");
    if (!tableBody) return;

    tableBody.innerHTML = "<tr><td colspan='7'>Loading leave requests...</td></tr>";

    try {
        const { data, error } = await supabaseClient
            .from("leaves")
            .select("*")
            .order("id", { ascending: false });

        if (error) throw error;

        tableBody.innerHTML = "";

        if (!data || data.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='7'>No leave requests found.</td></tr>";
            return;
        }

        data.forEach(function (leave) {
            const row = document.createElement("tr");

            const employee = document.createElement("td");
            employee.textContent = leave.employee_id || "";

            const type = document.createElement("td");
            type.textContent = leave.leave_type || "";

            const start = document.createElement("td");
            start.textContent = leave.start_date || "";

            const end = document.createElement("td");
            end.textContent = leave.end_date || "";

            const reason = document.createElement("td");
            reason.textContent = leave.reason || "";

            const status = document.createElement("td");
            status.textContent = leave.status || "";

            const actions = document.createElement("td");

            if (leave.status === "Pending") {
                const approve = document.createElement("button");
                approve.textContent = "Approve";
                approve.onclick = () => updateLeaveStatus(leave.id, "Approved");

                const reject = document.createElement("button");
                reject.textContent = "Reject";
                reject.onclick = () => updateLeaveStatus(leave.id, "Rejected");

                actions.append(approve, reject);
            } else {
                actions.textContent = "-";
            }

            row.append(employee, type, start, end, reason, status, actions);
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        tableBody.innerHTML =
            "<tr><td colspan='7'>Error loading leaves: " +
            String(error.message) + "</td></tr>";
    }
}

async function updateLeaveStatus(id, status) {
    if (!confirm("Are you sure you want to " + status + " this leave?")) return;

    try {
        const { data, error } = await supabaseClient.rpc(
            "process_leave_request",
            { p_leave_id: id, p_decision: status }
        );

        if (error) throw error;

        alert(data || "Leave request processed successfully.");
        await loadLeaveRequests();
        await loadDashboardSummary();
    } catch (error) {
        console.error(error);
        alert("Leave processing error: " + error.message);
    }
}

// ------------------------------
// STARTUP
// ------------------------------

document.addEventListener("DOMContentLoaded", async function () {
    if (typeof supabaseClient === "undefined") {
        console.error("Supabase client is not loaded.");
        alert("Supabase connection is not loaded. Please check your script setup.");
        return;
    }

    loadRegularizations();
    loadLeaveRequests();
    loadDashboardSummary();

    if (document.getElementById("employeeOptions")) {
        const monthInput = document.getElementById("calendarMonth");
        if (monthInput) monthInput.value = selectedCalendarMonth;

        await loadCalendarEmployees();

        document.getElementById("loadCalendarBtn")
            ?.addEventListener("click", loadCalendar);

        document.getElementById("previousMonth")
            ?.addEventListener("click", () => changeCalendarMonth(-1));

        document.getElementById("nextMonth")
            ?.addEventListener("click", () => changeCalendarMonth(1));
    }
});

function changeCalendarMonth(offset) {
    const input = document.getElementById("calendarMonth");
    if (!input || !input.value) return;

    const [year, month] = input.value.split("-").map(Number);
    const date = new Date(year, month - 1 + offset, 1);

    input.value = date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0");

    if (selectedCalendarEmployee) {
        document.getElementById("employeeSearch").value =
            selectedCalendarEmployee.employee_id + " - " +
            selectedCalendarEmployee.full_name;
        loadCalendar();
    }
}
