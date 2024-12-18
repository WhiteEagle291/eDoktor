// Models/Doctor.cs

using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using WebTemplate.Enums;  // Add this line

namespace WebTemplate.Models
{
public class Doctor
{
    public int Id { get; set; }
    public string Name { get; set; }
     public Specialization Specialization { get; set; }
  [JsonIgnore]  // This will exclude Appointments in JSON serialization and deserialization
    public ICollection<Appointment>? Appointments { get; set; }
}

}
