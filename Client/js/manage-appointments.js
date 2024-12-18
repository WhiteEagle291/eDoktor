const appointmentsList = document.getElementById("appointmentsList");
const doctorSelect = document.getElementById("doctorSelect");
const newAppointmentDate = document.getElementById("newAppointmentDate");
const newAppointmentTime = document.getElementById("newAppointmentTime");
const updateAppointmentButton = document.getElementById("updateAppointmentButton");

let selectedAppointmentId = null;

// Fetch and display appointments
async function loadAppointments() {
    try {
        const response = await fetch("https://localhost:7080/api/Appointments/");
        if (!response.ok) throw new Error(`Failed to load appointments. Status: ${response.status}`);



        const appointments = await response.json();
        console.log(appointments);
        appointmentsList.innerHTML = ""; // Clear existing appointments

        if (appointments.length === 0) {
            appointmentsList.innerHTML = "<p>Немате заказане прегледе.</p>";
            return;
        }

        appointments.forEach((appointment) => {
            const specialization = appointment.doctorSpecialization || "Непознато"; // Already mapped to a string by the backend
        
            const appointmentDateTime = new Date(appointment.appointmentTime);
            const date = appointmentDateTime.toLocaleDateString("sr-RS");
            const time = appointmentDateTime.toLocaleTimeString("sr-RS", {
                hour: "2-digit",
                minute: "2-digit",
            });
        
            const div = document.createElement("div");
            div.classList.add("appointment-item");
            div.innerHTML = `
                <p>Доктор: ${appointment.doctorName}</p>
                <p>Специјализација: ${specialization}</p>
                <p>Датум: ${date}</p>
                <p>Време: ${time}</p>
                <button class="edit-btn" data-id="${appointment.id}">Измени</button>
                <button class="delete-btn" data-id="${appointment.id}">Откажи</button>
            `;
            appointmentsList.appendChild(div);
        });

        // Add event listeners for buttons
        document.querySelectorAll(".edit-btn").forEach((btn) => {
            btn.addEventListener("click", () => editAppointment(btn.getAttribute("data-id")));
        });

        document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", () => deleteAppointment(btn.getAttribute("data-id")));
        });
    } catch (error) {
        console.error("Error loading appointments:", error);
        appointmentsList.innerHTML = "<p>Грешка при учитавању прегледа.</p>";
    }
}

// Edit appointment
async function editAppointment(appointmentId) {
    selectedAppointmentId = appointmentId;
    document.getElementById("editAppointmentForm").style.display = "block";

    try {
        const response = await fetch("https://localhost:7080/api/Doctors");
        if (!response.ok) throw new Error("Failed to load doctors.");

        const doctors = await response.json();
        doctorSelect.innerHTML = "<option value=''>-- Изаберите лекара --</option>";

        doctors.forEach((doctor) => {
            const option = document.createElement("option");
            option.value = doctor.id;
            option.textContent = doctor.name;
            doctorSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading doctors:", error);
        alert("Дошло је до грешке приликом учитавања листе лекара.");
    }
}

// Update appointment
async function updateAppointment() {
    if (!selectedAppointmentId || !doctorSelect.value || !newAppointmentDate.value || !newAppointmentTime.value) {
        alert("Попуните све потребне информације.");
        return;
    }

    const updatedAppointment = {
        doctorId: parseInt(doctorSelect.value),
        appointmentTime: `${newAppointmentDate.value}T${newAppointmentTime.value}`,
    };

    try {
        const response = await fetch(`https://localhost:7080/api/Patients/updateAppointment/${selectedAppointmentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedAppointment),
        });

        if (response.ok) {
            alert("Преглед успешно ажуриран.");
            loadAppointments();
            document.getElementById("editAppointmentForm").style.display = "none";
        } else {
            const result = await response.json();
            alert(result.message || "Грешка при ажурирању прегледа.");
        }
    } catch (error) {
        console.error("Error updating appointment:", error);
        alert("Дошло је до грешке.");
    }
}


// Delete appointment
async function deleteAppointment(appointmentId) {
    if (!confirm("Да ли сте сигурни да желите да откажете преглед?")) return;

    try {
        const response = await fetch(`https://localhost:7080/api/appointments/${appointmentId}`, {
            method: "DELETE",
        });

        if (response.ok) {
            alert("Преглед успешно отказан.");
            loadAppointments();
        } else {
            const result = await response.json();
            alert(result.message || "Грешка при отказивању прегледа.");
        }
    } catch (error) {
        console.error("Error deleting appointment:", error);
        alert("Дошло је до грешке.");
    }
}
// Load appointments on page load
loadAppointments();
updateAppointmentButton.addEventListener("click", updateAppointment);
