package com.edutech.healthcare_appointment_management_system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.MedicalRecord;
import com.edutech.healthcare_appointment_management_system.service.AppointmentService;
import com.edutech.healthcare_appointment_management_system.service.DoctorService;
import com.edutech.healthcare_appointment_management_system.service.MedicalRecordService;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

    @Autowired
    DoctorService doctorService;

    @Autowired
    AppointmentService appointmentService;

    @Autowired
    MedicalRecordService medicalRecordService;

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return new ResponseEntity<>(doctorService.getAllDoctors(), HttpStatus.OK);
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

    // ✅ NEW: Get available slots
    @GetMapping("/available-slots")
    public ResponseEntity<List<String>> getAvailableSlots(
            @RequestParam Long doctorId,
            @RequestParam String date) {
        return new ResponseEntity<>(appointmentService.getAvailableSlots(doctorId, date), HttpStatus.OK);
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAppointmentsByPatients(@RequestParam Long patientId) {
        return new ResponseEntity<>(appointmentService.getAppointmentsByPatientId(patientId), HttpStatus.OK);
    }

    @GetMapping("/medicalrecords")
    public ResponseEntity<List<MedicalRecord>> getMedicalRecordsByPatient(@RequestParam Long patientId) {
        return new ResponseEntity<>(medicalRecordService.getRecordsByPatient(patientId), HttpStatus.OK);
    }
}