// Models/Patient.cs
using System;
using System.Collections.Generic;  // Add this line
namespace WebTemplate.Models
{
public class Patient
{
    public int Id { get; set; }
    public string JMBG {get;set;}
    public string Name { get; set; }
    public string Email { get; set; }
   public List<Appointment> Appointments { get; set; } = new List<Appointment>(); // Initialize to avoid null issues
}

}
