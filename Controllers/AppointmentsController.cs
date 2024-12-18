using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebTemplate.Models;

namespace WebTemplate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly IspitContext _context;

        public AppointmentsController(IspitContext context)
        {
            _context = context;
        }

        // GET: api/appointments
[HttpGet]
public IActionResult GetAppointments()
{
    try
    {
        // Fetch appointments from the database without projecting the enum
        var appointments = _context.Appointments
            .Include(a => a.Doctor)
            .Include(a => a.Patient)
            .Select(a => new
            {
                a.Id,
                a.AppointmentTime,
                DoctorName = a.Doctor.Name,
                DoctorSpecialization = a.Doctor.Specialization, // Keep enum value for now
                PatientName = a.Patient.Name
            })
            .ToList();

        // Handle enum validation in memory
        var result = appointments.Select(a => new
        {
            a.Id,
            a.AppointmentTime,
            a.DoctorName,
            DoctorSpecialization = Enum.IsDefined(typeof(WebTemplate.Enums.Specialization), a.DoctorSpecialization)
                ? Enum.GetName(typeof(WebTemplate.Enums.Specialization), a.DoctorSpecialization)
                : "Unknown Specialization", // Fallback for invalid enum values
            a.PatientName
        });

        return Ok(result);
    }
    catch (Exception ex)
    {
        // Log the exception for debugging
        Console.WriteLine($"Error in GetAppointments: {ex.Message}");
        Console.WriteLine(ex.StackTrace);

        // Return a 500 error with a user-friendly message
        return StatusCode(500, "Internal server error. Please check the server logs for more details.");
    }
}



        // GET: api/appointments/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetAppointment(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .Where(a => a.Id == id)
                .Select(a => new
                {
                    a.Id,
                    a.AppointmentTime,
                    DoctorName = a.Doctor.Name,
                    PatientName = a.Patient.Name
                })
                .FirstOrDefaultAsync();

            if (appointment == null)
            {
                return NotFound("Appointment not found.");
            }

            return Ok(appointment);
        }

        // POST: api/appointments
        [HttpPost]
        public async Task<IActionResult> AddAppointment([FromBody] Appointment appointment)
        {
            if (appointment == null)
            {
                return BadRequest("Appointment cannot be null.");
            }

            // Validate Doctor and Patient
            if (!_context.Doctors.Any(d => d.Id == appointment.DoctorId))
            {
                return NotFound("Doctor not found.");
            }

            if (!_context.Patients.Any(p => p.Id == appointment.PatientId))
            {
                return NotFound("Patient not found.");
            }

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, appointment);
        }

        // PUT: api/appointments/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] Appointment updatedAppointment)
        {
            if (id != updatedAppointment.Id)
            {
                return BadRequest("Appointment ID mismatch.");
            }

            // Validate Doctor and Patient
            if (!_context.Doctors.Any(d => d.Id == updatedAppointment.DoctorId))
            {
                return NotFound("Doctor not found.");
            }

            if (!_context.Patients.Any(p => p.Id == updatedAppointment.PatientId))
            {
                return NotFound("Patient not found.");
            }

            var existingAppointment = await _context.Appointments.FindAsync(id);
            if (existingAppointment == null)
            {
                return NotFound("Appointment not found.");
            }

            // Update fields
            existingAppointment.DoctorId = updatedAppointment.DoctorId;
            existingAppointment.AppointmentTime = updatedAppointment.AppointmentTime;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(existingAppointment);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AppointmentExists(id))
                {
                    return NotFound();
                }

                throw;
            }
        }

     [HttpDelete("{id}")]
public async Task<IActionResult> DeleteAppointment(int id)
{
    var appointment = await _context.Appointments.FindAsync(id);
    if (appointment == null)
    {
        return NotFound("Appointment not found.");
    }

    _context.Appointments.Remove(appointment);
    await _context.SaveChangesAsync();

    return Ok("Appointment successfully deleted.");
}

        // Helper to check if appointment exists
        private bool AppointmentExists(int id)
        {
            return _context.Appointments.Any(a => a.Id == id);
        }
    }
}
