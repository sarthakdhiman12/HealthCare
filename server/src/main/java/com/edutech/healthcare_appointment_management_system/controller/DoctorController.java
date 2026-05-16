package com.edutech.healthcare_appointment_management_system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.service.AppointmentService;
import com.edutech.healthcare_appointment_management_system.service.DoctorService;

import java.util.List;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

   //implement the required code here
   @Autowired
   DoctorService doctorService;

   @Autowired
   AppointmentService appointmentService;
   
   @GetMapping("/appointments")
   public ResponseEntity<List<Appointment>> getAppointmentsByDoctor(@RequestParam Long doctorId){
      return new ResponseEntity<>(appointmentService.getAppointmentsByDoctorId(doctorId), HttpStatus.OK);
   }

   @PutMapping("/availability")
   public ResponseEntity<Doctor> updateDoctorAvailability(@RequestParam Long doctorId, @RequestParam String availability){
      return new ResponseEntity<>(doctorService.updateAvailability(doctorId, availability), HttpStatus.OK);
   }

   
@GetMapping("/{doctorId}")
public ResponseEntity<Doctor> getDoctorById(@PathVariable Long doctorId) {
    return new ResponseEntity<>(doctorService.getDoctorById(doctorId), HttpStatus.OK);
}

// ✅ GET doctor by userId
@GetMapping("/user/{userId}")
public ResponseEntity<Doctor> getDoctorByUserId(@PathVariable Long userId) {
    return new ResponseEntity<>(doctorService.getDoctorById(userId), HttpStatus.OK);
}


}