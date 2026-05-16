package com.edutech.healthcare_appointment_management_system.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.healthcare_appointment_management_system.dto.TimeDto;
import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import com.edutech.healthcare_appointment_management_system.repository.DoctorRepository;
import com.edutech.healthcare_appointment_management_system.repository.PatientRepository;
import com.edutech.healthcare_appointment_management_system.service.AppointmentService;

import java.util.List;

@RestController
@RequestMapping("/api/receptionist")
public class ReceptionistController {

   @Autowired
   AppointmentService appointmentService;

   @Autowired
   DoctorRepository doctorRepository;

   @Autowired
   PatientRepository patientRepository;

   @GetMapping("/appointments")
   public ResponseEntity<List<Appointment>> getAllAppointments() {
      return new ResponseEntity<>(appointmentService.getAllAppointments(), HttpStatus.OK);
   }

   @PostMapping("/appointment")
   public ResponseEntity<Appointment> scheduleAppointment(
         @RequestParam Long patientId,
         @RequestParam Long doctorId,
         @RequestBody TimeDto timeDto) {

      return new ResponseEntity<>(
            appointmentService.scheduleAppointment(patientId, doctorId, timeDto.getTime()),
            HttpStatus.OK
      );
   }

   @PutMapping("/appointment-reschedule/{appointmentId}")
   public ResponseEntity<Appointment> rescheduleAppointment(
         @PathVariable Long appointmentId,
         @RequestBody TimeDto timeDto) {

      return new ResponseEntity<>(
            appointmentService.rescheduleAppointment(appointmentId, timeDto.getTime()),
            HttpStatus.OK
      );
   }

   // Get all doctors for dropdown
   @GetMapping("/doctors")
   public ResponseEntity<List<Doctor>> getAllDoctors() {
      return new ResponseEntity<>(doctorRepository.findAll(), HttpStatus.OK);
   }

   // Get all patients for dropdown
   @GetMapping("/patients")
   public ResponseEntity<List<Patient>> getAllPatients() {
      return new ResponseEntity<>(patientRepository.findAll(), HttpStatus.OK);
   }
}
