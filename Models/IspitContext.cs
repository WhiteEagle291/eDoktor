namespace WebTemplate.Models;

public class IspitContext : DbContext
{
    // DbSet kolekcije!
    public DbSet<Doctor> Doctors { get; set; }
    public DbSet<Patient> Patients { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public IspitContext(DbContextOptions options) : base(options)
    {
        
    }
}
