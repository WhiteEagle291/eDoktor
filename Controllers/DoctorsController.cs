// Controllers/DoctorsController.cs
using WebTemplate.Enums;

namespace WebTemplate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorsController : ControllerBase
    {
        private readonly IspitContext _context;
        private readonly ILogger<DoctorsController> _logger;
        public DoctorsController(IspitContext context,ILogger<DoctorsController> logger)
        {
            _logger = logger;
            _context = context;
        }

        // GET: api/doctors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Doctor>>> GetDoctors()
        {
            return await _context.Doctors.ToListAsync();
        }


[HttpGet("specializations")]
public IActionResult GetSpecializations()
{
    Console.WriteLine("Fetching all doctor specializations (localized)...");

    var specializations = Enum.GetValues(typeof(Specialization))
        .Cast<Specialization>()
        .ToDictionary(
            specialization => ((int)specialization).ToString(), // Key: ID (int as string)
            specialization => specialization.ToString() // Value: Name of specialization
        );

    return Ok(specializations);
}



[HttpGet("bySpecialization/{specializationId}")]
public IActionResult GetDoctorsBySpecialization(int specializationId)
{
    if (!Enum.IsDefined(typeof(Specialization), specializationId))
    {
        _logger.LogWarning("Invalid specialization ID: {SpecializationId}", specializationId);
        return BadRequest("Invalid specialization.");
    }

    var specialization = (Specialization)specializationId;

    _logger.LogInformation("Parsed specialization: {Specialization}", specialization);

    var doctors = _context.Doctors
        .Where(d => d.Specialization == specialization)
        .Select(d => new { d.Id, d.Name })
        .ToList();

    return Ok(doctors);
}



        // GET: api/doctors/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Doctor>> GetDoctor(int id)
        {
            var doctor = await _context.Doctors.FindAsync(id);

            if (doctor == null)
            {
                return NotFound();
            }

            return doctor;
        }

        // POST: api/doctors
[HttpPost]
public async Task<IActionResult> AddDoctor([FromBody] Doctor doctor)
{
    if (!ModelState.IsValid)
    {
        // Return the validation error details
        return BadRequest(ModelState);
    }

    _context.Doctors.Add(doctor);
    await _context.SaveChangesAsync();
    return Ok(doctor);
}

        // PUT: api/doctors/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDoctor(int id, Doctor doctor)
        {
            if (id != doctor.Id)
            {
                return BadRequest();
            }

            _context.Entry(doctor).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DoctorExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/doctors/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null)
            {
                return NotFound();
            }

            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DoctorExists(int id)
        {
            return _context.Doctors.Any(e => e.Id == id);
        }
    }
}
