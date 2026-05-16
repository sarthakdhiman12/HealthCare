package com.edutech.healthcare_appointment_management_system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import com.edutech.healthcare_appointment_management_system.dto.TimeDto;
import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.MedicalRecord;
import com.edutech.healthcare_appointment_management_system.service.AppointmentService;
import com.edutech.healthcare_appointment_management_system.service.DoctorService;
import com.edutech.healthcare_appointment_management_system.service.MedicalRecordService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
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
    public ResponseEntity<List<Doctor>> getAllDoctors(){
        return new ResponseEntity<>(doctorService.getAllDoctors(),HttpStatus.OK);
    }

    @PostMapping("/appointment")
    public ResponseEntity<Appointment> scheduleAppointment(@RequestParam Long patientId, @RequestParam Long doctorId, @RequestBody TimeDto timeDto){
        return new ResponseEntity<>(appointmentService.scheduleAppointment(patientId,doctorId, timeDto.getTime()),HttpStatus.OK);
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAppointmentsByPatients(@RequestParam Long patientId){
        return new ResponseEntity<>(appointmentService.getAppointmentsByPatientId(patientId),HttpStatus.OK);
    }

    @GetMapping("/medicalrecords")
    public ResponseEntity<List<MedicalRecord>> getMedicalRecordsByPatient(@RequestParam Long patientId){
        return new ResponseEntity<>(medicalRecordService.getMedicalRecordByPatientId(patientId),HttpStatus.OK);
    }


}