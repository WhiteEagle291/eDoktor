// Models/Appointment.cs
using System;
using System.Collections.Generic;  // Required for List<T>
public class Appointment
{
    public int Id { get; set; }
    public int DoctorId { get; set; }
    public Doctor? Doctor { get; set; }
    public int PatientId { get; set; }
    public Patient? Patient { get; set; }
    public DateTime AppointmentTime { get; set; }
}