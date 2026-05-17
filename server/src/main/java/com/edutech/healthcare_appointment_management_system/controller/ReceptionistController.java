package com.edutech.healthcare_appointment_management_system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import com.edutech.healthcare_appointment_management_system.repository.DoctorRepository;
import com.edutech.healthcare_appointment_management_system.repository.PatientRepository;
import com.edutech.healthcare_appointment_management_system.service.AppointmentService;

import java.util.Collections;
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

    // ✅ UPDATED: Slot-based booking
    @PostMapping("/appointment")
    public ResponseEntity<?> scheduleAppointment(
            @RequestParam Long patientId,
            @RequestParam Long doctorId,
            @RequestParam String date,
            @RequestParam String slot) {
        try {
            Appointment appointment = appointmentService.scheduleAppointment(patientId, doctorId, date, slot);
            return new ResponseEntity<>(appointment, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                Collections.singletonMap("message", e.getMessage())
            );
        }
    }

    // ✅ UPDATED: Slot-based reschedule
    @PutMapping("/appointment-reschedule/{appointmentId}")
    public ResponseEntity<?> rescheduleAppointment(
            @PathVariable Long appointmentId,
            @RequestParam String date,
            @RequestParam String slot) {
        try {
            Appointment appointment = appointmentService.rescheduleAppointment(appointmentId, date, slot);
            return new ResponseEntity<>(appointment, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                Collections.singletonMap("message", e.getMessage())
            );
        }
    }

    // ✅ NEW: Get available slots
    @GetMapping("/available-slots")
    public ResponseEntity<List<String>> getAvailableSlots(
            @RequestParam Long doctorId,
            @RequestParam String date) {
        return new ResponseEntity<>(appointmentService.getAvailableSlots(doctorId, date), HttpStatus.OK);
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return new ResponseEntity<>(doctorRepository.findAll(), HttpStatus.OK);
    }

    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return new ResponseEntity<>(patientRepository.findAll(), HttpStatus.OK);
    }
}