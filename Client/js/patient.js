// Load doctor types when the page is loaded
// async function loadSpecializations() {
//     try {
//         const response = await fetch("https://localhost:7080/api/Doctors/specializations");
//         const specializations = await response.json();

//         const specializationDropdown = document.getElementById("doctorSpecialization");
//         specializationDropdown.innerHTML = ""; // Clear existing options

//         // Populate dropdown with Serbian translations
//         Object.entries(specializations).forEach(([key, value]) => {
//             const option = document.createElement("option");
//             option.value = key; // Use the key (e.g., "Cardiologist") as the value
//             option.textContent = value; // Display the Serbian translation
//             specializationDropdown.appendChild(option);
//         });
//     } catch (error) {
//         console.error("Error fetching specializations:", error);
//         alert("Грешка приликом учитавања специјализација.");
//     }
// }
// Fetch available time slots when doctor type and date are selected
async function loadAvailableTimes() {
    const doctorTypeId = document.getElementById("doctorSpecialization").value;
    const selectedDate = document.getElementById("appointmentDateInput").value;

    console.log(doctorTypeId,selectedDate);

    if (!selectedDate) {
        return;
    }

    try {
        const response = await fetch(`https://localhost:7080/api/Patients/availableTimes/${doctorTypeId}/${selectedDate}`);
        const timeSlots = await response.json();

        const timeSlotsDiv = document.getElementById("timeSlots");
        timeSlotsDiv.innerHTML = ""; // Clear previous time slots

        timeSlots.forEach(slot => {
            const slotElement = document.createElement("button");
            slotElement.textContent = slot;
            slotElement.onclick = () => selectTimeSlot(slot);
            timeSlotsDiv.appendChild(slotElement);
        });
    } catch (error) {
        console.error("Error fetching time slots:", error);
    }
}

// Handle time slot selection
let selectedTime = null;

function selectTimeSlot(timeSlot) {
    selectedTime = timeSlot;
    alert(`Одабрали сте време: ${timeSlot}`);
}

// Book the appointment
async function bookAppointment() {
    const doctorTypeId = document.getElementById("doctorType").value;
    const selectedDate = document.getElementById("appointmentDateInput").value;

    console.log(doctorTypeId,selectedDate);

    if (!selectedTime || !doctorTypeId || !selectedDate) {
        alert("Молимо одаберите лекара, датум и време пре резервације.");
        return;
    }

    const appointmentData = {
        patientId: 1, // Replace this with the actual logged-in patient ID
        doctorTypeId: doctorTypeId,
        appointmentDate: `${selectedDate} ${selectedTime}`,
    };

    try {
        const response = await fetch("https://localhost:7080/api/Patients/bookAppointment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointmentData),
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);
        } else {
            alert("Грешка при резервацији термина. Покушајте поново.");
        }
    } catch (error) {
        console.error("Error booking appointment:", error);
        alert("Дошло је до грешке.");
    }
}

// Initialize functions when the DOM is fully loaded
// document.addEventListener("DOMContentLoaded", () => {
//     loadSpecializations();
//     document.getElementById("appointmentDateInput").addEventListener("change", loadAvailableTimes);
// });
