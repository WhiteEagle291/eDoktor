const specializationSelect = document.getElementById("specializationSelect");
const doctorSelect = document.getElementById("doctorSelect");
const appointmentDate = document.getElementById("appointmentDate");
const timeSlotsDiv = document.getElementById("timeSlots");
const selectedSpecialization = document.getElementById("selectedSpecialization");
const selectedDate = document.getElementById("selectedDate");
const selectedTime = document.getElementById("selectedTime");
const confirmButton = document.getElementById("confirmButton");

let selectedTimeSlot = null;

// Set Minimum Date for Date Picker (today's date)
const today = new Date().toISOString().split("T")[0];
appointmentDate.min = today;

// Fetch doctors based on specialization
async function loadDoctors() {
    const specialization = specializationSelect.value;
    console.log(specialization);
    if (!specialization) {
        doctorSelect.innerHTML = "<option value=''>-- Prvo izaberite specijalizaciju --</option>";
        return;
    }

    try {
        const response = await fetch(`https://localhost:7080/api/Doctors/bySpecialization/${specialization}`);
        const doctors = await response.json();
        console.log(doctors);
        // Clear and populate doctor dropdown
        doctorSelect.innerHTML = "<option value=''>-- Izaberite lekara --</option>";

        if (doctors.length === 0) {
            doctorSelect.innerHTML = "<option value=''>Nema dostupnih lekara</option>";
            return;
        }

        doctors.forEach((doctor) => {
            const option = document.createElement("option");
            option.value = doctor.id; // Use the doctor's ID
            option.textContent = `${doctor.name}`;
            doctorSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        doctorSelect.innerHTML = "<option value=''>Greška pri učitavanju lekara</option>";
    }
}

// Load available time slots based on doctor and date
async function loadTimeSlots() {
    const doctorId = doctorSelect.value;
    const date = appointmentDate.value;

    if (!doctorId || !date) {
        timeSlotsDiv.innerHTML = "<p>Molimo izaberite lekara i datum.</p>";
        return;
    }

    try {
        const response = await fetch(`https://localhost:7080/api/Patients/availableTimes/${doctorId}/${date}`);
        const availableTimeSlots = await response.json();

        timeSlotsDiv.innerHTML = ""; // Clear previous slots

        if (!Array.isArray(availableTimeSlots) || availableTimeSlots.length === 0) {
            timeSlotsDiv.innerHTML = "<p>Nema slobodnih termina za ovaj datum.</p>";
            return;
        }

        availableTimeSlots.forEach((time) => {
            const button = document.createElement("button");
            button.textContent = time;
            button.classList.add("time-slot-button");
            button.onclick = () => selectTimeSlot(time);
            timeSlotsDiv.appendChild(button);
        });
    } catch (error) {
        console.error("Error fetching time slots:", error);
        timeSlotsDiv.innerHTML = "<p>Došlo je do greške prilikom učitavanja termina.</p>";
    }
}

// Handle time slot selection
function selectTimeSlot(time) {
    selectedTimeSlot = time;
    selectedTime.textContent = time;

    document.querySelectorAll(".time-slot-button").forEach((btn) => {
        btn.classList.remove("selected");
    });
    event.target.classList.add("selected");
}

// Book appointment
async function bookAppointment() {
    const doctorId = doctorSelect.value;
    const date = appointmentDate.value;

    if (!doctorId || !date || !selectedTimeSlot) {
        alert("Molimo popunite sve korake.");
        return;
    }

    const appointmentData = {
        doctorId: doctorId,
        patientId: 1, // Replace with actual logged-in patient ID
        appointmentTime: `${date}T${selectedTimeSlot}`,
    };

    try {
        const response = await fetch("https://localhost:7080/api/Patients/bookAppointment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointmentData),
        });

        if (response.ok) {
            alert("Vaš pregled je uspešno zakazan!");
            loadTimeSlots(); // Reload slots to lock the booked time
        } else {
            const result = await response.json();
            alert(result.message || "Greška pri zakazivanju termina.");
        }
    } catch (error) {
        console.error("Error booking appointment:", error);
        alert("Došlo je do greške prilikom zakazivanja.");
    }
}


// Event listeners
specializationSelect.addEventListener("change", () => {
    loadDoctors();
    doctorSelect.innerHTML = "<option value=''>-- Učitavanje lekara... --</option>";
    timeSlotsDiv.innerHTML = "<p>Izaberite datum i doktora da prikažete slobodne termine.</p>";
    selectedSpecialization.textContent = specializationSelect.options[specializationSelect.selectedIndex].text || "N/A";
});

doctorSelect.addEventListener("change", loadTimeSlots);

appointmentDate.addEventListener("change", () => {
    loadTimeSlots();
    // Update the selected date
    selectedDate.textContent = appointmentDate.value || "N/A";
});

confirmButton.addEventListener("click", bookAppointment);
