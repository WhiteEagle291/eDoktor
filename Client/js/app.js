const API_BASE_URL = "https://localhost:7080/api";

async function handleLogin(event) {
    event.preventDefault();

    const name = document.getElementById("patientName").value;
    const email = document.getElementById("patientEmail").value;
    const jmbg = document.getElementById("patientJMBG").value;

    const payload = { Name: name, Email: email, JMBG: jmbg };

    try {
        const response = await fetch("https://localhost:7080/api/Patients/Login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message);
            // Redirect to the patient dashboard after successful login
            window.location.href = "patient-dashboard.html";
        } else {
            const error = await response.json();
            alert(`Грешка: ${error.message || "Дошло је до грешке."}`);
        }
    } catch (err) {
        console.error("Login error:", err);
        alert("Дошло је до грешке приликом пријаве.");
    }
}




// Show selected section
function showSection(section) {
    const content = document.getElementById("content");
    content.innerHTML = "";  // Clear existing content

    if (section === 'doctor') {
        content.innerHTML = doctorSection();
        loadDoctors(); // Load existing doctors
    } else if (section === 'patient') {
        content.innerHTML = patientSection();
        loadPatients(); // Load existing patients
    } else if (section === 'appointment') {
        content.innerHTML = appointmentSection();
        loadAppointments(); // Load existing appointments
    }
}

// Doctor section template
function doctorSection() {
    return `
        <h2>Doctors</h2>
        <form id="doctorForm" onsubmit="addDoctor(event)">
            <label for="doctorName">Name</label>
            <input type="text" id="doctorName" required>
            <label for="specialization">Specialization</label>
            <input type="text" id="specialization" required>
            <button type="submit">Add Doctor</button>
        </form>
        <ul id="doctorList"></ul>
    `;
}

// Patient section template
function patientSection() {
    return `
        <h2>Patients</h2>
        <form id="patientForm" onsubmit="addPatient(event)">
            <label for="patientName">Name</label>
            <input type="text" id="patientName" required>
            <label for="patientEmail">Email</label>
            <input type="email" id="patientEmail" required>
            <label for="patientJMBG">JMBG</label>
            <input type="text" id="patientJMBG" required>
            <button type="submit">Add Patient</button>
        </form>
        <ul id="patientList"></ul>
    `;
}

// Appointment section template
function appointmentSection() {
    return `
        <h2>Appointments</h2>
        <form id="appointmentForm" onsubmit="addAppointment(event)">
            <label for="doctorId">Doctor ID</label>
            <input type="number" id="doctorId" required>
            <label for="patientId">Patient ID</label>
            <input type="number" id="patientId" required>
            <label for="appointmentTime">Appointment Time</label>
            <input type="datetime-local" id="appointmentTime" required>
            <button type="submit">Add Appointment</button>
        </form>
        <ul id="appointmentList"></ul>
    `;
}

// Add a doctor to the database
async function addDoctor(event) {
    event.preventDefault();
    const name = document.getElementById("doctorName").value;
    const specialization = document.getElementById("specialization").value;

    try {
        const response = await fetch(`${API_BASE_URL}/Doctors`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                Name: name,                 // Ensure case-sensitive match with C# model
                Specialization: specialization 
            })
        });

        if (response.ok) {
            alert("Doctor added successfully!");
            document.getElementById("doctorForm").reset();
            loadDoctors(); // Refresh doctor list
        } else {
            const errorResponse = await response.json();
            console.error("Failed to add doctor:", errorResponse);
        }
    } catch (error) {
        console.error("Error adding doctor:", error);
    }
}




// Load and display all doctors
async function loadDoctors() {
    try {
        const response = await fetch(`${API_BASE_URL}/Doctors`);
        if (response.ok) {
            const doctors = await response.json();
            const doctorList = document.getElementById("doctorList");
            doctorList.innerHTML = doctors.map(d => `<li>${d.name} - ${d.specialization}</li>`).join("");
        } else {
            console.error("Failed to load doctors:", await response.json());
        }
    } catch (error) {
        console.error("Error loading doctors:", error);
    }
}

// Add a patient to the database
async function addPatient(event) {
    event.preventDefault();
    const name = document.getElementById("patientName").value;
    const email = document.getElementById("patientEmail").value;
    const jmbg = document.getElementById("patientJMBG").value;

    try {
        const response = await fetch(`${API_BASE_URL}/Patients`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, jmbg })
        });

        if (response.ok) {
            alert("Patient added successfully!");
            document.getElementById("patientForm").reset();
            loadPatients(); // Refresh patient list
        } else {
            console.error("Failed to add patient:", await response.json());
        }
    } catch (error) {
        console.error("Error adding patient:", error);
    }
}

// Load and display all patients
async function loadPatients() {
    try {
        const response = await fetch(`${API_BASE_URL}/Patients`);
        if (response.ok) {
            const patients = await response.json();
            const patientList = document.getElementById("patientList");
            patientList.innerHTML = patients.map(p => `<li>${p.name} - ${p.email}</li>`).join("");
        } else {
            console.error("Failed to load patients:", await response.json());
        }
    } catch (error) {
        console.error("Error loading patients:", error);
    }
}

// Add an appointment to the database
async function addAppointment(event) {
    event.preventDefault();
    const doctorId = document.getElementById("doctorId").value;
    const patientId = document.getElementById("patientId").value;
    const appointmentTime = document.getElementById("appointmentTime").value;

    try {
        const response = await fetch(`${API_BASE_URL}/Appointments/AddAppointment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                doctorId: parseInt(doctorId),
                patientId: parseInt(patientId),
                appointmentTime,
                isConfirmed: false
            })
        });

        if (response.ok) {
            alert("Appointment added successfully!");
            document.getElementById("appointmentForm").reset();
            loadAppointments(); // Refresh appointment list
        } else {
            console.error("Failed to add appointment:", await response.json());
        }
    } catch (error) {
        console.error("Error adding appointment:", error);
    }
}

// Load and display all appointments
async function loadAppointments() {
    try {
        const response = await fetch(`${API_BASE_URL}/Appointments`);
        if (response.ok) {
            const appointments = await response.json();
            const appointmentList = document.getElementById("appointmentList");
            appointmentList.innerHTML = appointments.map(a =>
                `<li>${a.doctorName} with ${a.patientName} on ${new Date(a.appointmentTime).toLocaleString()}</li>`
            ).join("");
        } else {
            console.error("Failed to load appointments:", await response.json());
        }
    } catch (error) {
        console.error("Error loading appointments:", error);
    }
}
