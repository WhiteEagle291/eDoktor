// Controllers/PatientsController.cs
namespace WebTemplate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientsController : ControllerBase
    {
        private readonly IspitContext _context;

        public PatientsController(IspitContext context)
        {
            _context = context;
        }

        // GET: api/patients
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Patient>>> GetPatients()
        {
            return await _context.Patients.ToListAsync();
        }

[HttpPost("bookAppointment")]
public IActionResult BookAppointment([FromBody] Appointment appointment)
{
    // Validate if the time slot is still available
    var existingAppointment = _context.Appointments
        .FirstOrDefault(a => a.DoctorId == appointment.DoctorId &&
                             a.AppointmentTime == appointment.AppointmentTime);

    if (existingAppointment != null)
    {
        return BadRequest(new { message = "Termin je već zauzet." });
    }

    // Add appointment
    _context.Appointments.Add(appointment);
    _context.SaveChanges();

    return Ok(new { message = "Pregled je uspešno zakazan!" });
}




[HttpGet("availableTimes/{doctorId}/{date}")]
public IActionResult GetAvailableTimes(int doctorId, string date)
{
    if (!DateTime.TryParse(date, out var appointmentDate))
    {
        return BadRequest("Invalid date format.");
    }

    var doctor = _context.Doctors.Find(doctorId);
    if (doctor == null)
    {
        return BadRequest("Doctor does not exist.");
    }

    // Example logic: Fetch booked times for the doctor
    var bookedTimes = _context.Appointments
        .Where(a => a.DoctorId == doctorId && a.AppointmentTime.Date == appointmentDate.Date)
        .Select(a => a.AppointmentTime.ToString("HH:mm"))
        .ToList();

    var allPossibleTimes = new List<string> { "09:00", "10:00", "11:00", "13:00", "14:00" }; // Example times
    var availableTimes = allPossibleTimes.Except(bookedTimes).ToList();

    return Ok(availableTimes);
}


[HttpPost("Login")]
public IActionResult Login([FromBody] Patient patientInfo)
{
    Console.WriteLine("===== LOGIN ATTEMPT STARTED =====");

    if (patientInfo == null)
    {
        Console.WriteLine("Invalid payload: null");
        return BadRequest(new { message = "Request payload is missing or invalid." });
    }

    Console.WriteLine($"Received login request: Name={patientInfo.Name}, Email={patientInfo.Email}, JMBG={patientInfo.JMBG}");

    if (string.IsNullOrEmpty(patientInfo.Name) || 
        string.IsNullOrEmpty(patientInfo.Email) || 
        string.IsNullOrEmpty(patientInfo.JMBG))
    {
        Console.WriteLine("Validation failed: One or more fields are empty.");
        return BadRequest(new { message = "All fields (Name, Email, JMBG) are required." });
    }

    Console.WriteLine("Checking for existing patient in database...");
    var existingPatient = _context.Patients.FirstOrDefault(p =>
        p.Name == patientInfo.Name &&
        p.Email == patientInfo.Email &&
        p.JMBG == patientInfo.JMBG);

    if (existingPatient != null)
    {
        Console.WriteLine($"Existing patient found: ID={existingPatient.Id}, Name={existingPatient.Name}, Email={existingPatient.Email}");
        return Ok(new { message = "Login successful", patientId = existingPatient.Id });
    }

    Console.WriteLine("No existing patient found. Creating a new patient...");
    var newPatient = new Patient
    {
        Name = patientInfo.Name,
        Email = patientInfo.Email,
        JMBG = patientInfo.JMBG,
        Appointments = new List<Appointment>()
    };

    try
    {
        _context.Patients.Add(newPatient);
        _context.SaveChanges();
        Console.WriteLine($"New patient created successfully: ID={newPatient.Id}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error while saving new patient: {ex.Message}");
        return StatusCode(500, new { message = "An error occurred while saving the patient to the database." });
    }

    Console.WriteLine("===== LOGIN ATTEMPT COMPLETED =====");
    return Ok(new { message = "Patient created and logged in successfully", patientId = newPatient.Id });
}



        // GET: api/patients/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Patient>> GetPatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);

            if (patient == null)
            {
                return NotFound();
            }

            return patient;
        }

        // POST: api/patients
        [HttpPost("AddPatient")]
        public async Task<ActionResult<Patient>> PostPatient(Patient patient)
        {
            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPatient), new { id = patient.Id }, patient);
        }

 [HttpPut("updateAppointment/{id}")]
public IActionResult UpdateAppointment(int id, [FromBody] Appointment updatedAppointment)
{
    // Find the existing appointment
    var existingAppointment = _context.Appointments.FirstOrDefault(a => a.Id == id);

    if (existingAppointment == null)
    {
        return NotFound(new { message = "Appointment not found." });
    }

    // Update the appointment properties
    existingAppointment.DoctorId = updatedAppointment.DoctorId;
    existingAppointment.AppointmentTime = updatedAppointment.AppointmentTime;

    try
    {
        _context.SaveChanges();
        return Ok(new { message = "Appointment updated successfully.", appointment = existingAppointment });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Error updating appointment.", error = ex.Message });
    }
}

        // DELETE: api/patients/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null)
            {
                return NotFound();
            }

            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PatientExists(int id)
        {
            return _context.Patients.Any(e => e.Id == id);
        }
    }
}

