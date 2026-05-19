package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.entity.MedicalRecord;
import com.edutech.healthcare_appointment_management_system.service.MedicalRecordService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    // ✅ CREATE — Doctor creates medical record for a patient
    @PostMapping("/doctor/medical-record")
    public ResponseEntity<Map<String, Object>> createRecord(
            @RequestParam Long patientId,
            @RequestParam Long doctorId,
            @RequestParam String diagnosis,
            @RequestParam String treatment) {

        Map<String, Object> response = new HashMap<>();

        try {
            MedicalRecord record = medicalRecordService.createRecord(patientId, doctorId, diagnosis, treatment);
            response.put("success", true);
            response.put("message", "Medical record created successfully");
            response.put("data", record);
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    // ✅ READ — Doctor gets medical records they created
    @GetMapping("/doctor/medical-records")
    public ResponseEntity<Map<String, Object>> getRecordsByDoctor(@RequestParam Long doctorId) {

        Map<String, Object> response = new HashMap<>();

        try {
            List<MedicalRecord> records = medicalRecordService.getRecordsByDoctor(doctorId);
            response.put("success", true);
            response.put("data", records);
            response.put("count", records.size());
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    // ✅ READ — Get records for a patient by a specific doctor
    @GetMapping("/doctor/medical-records/patient")
    public ResponseEntity<Map<String, Object>> getRecordsByPatientAndDoctor(
            @RequestParam Long patientId,
            @RequestParam Long doctorId) {

        Map<String, Object> response = new HashMap<>();

        try {
            List<MedicalRecord> records = medicalRecordService.getRecordsByPatientAndDoctor(patientId, doctorId);
            response.put("success", true);
            response.put("data", records);
            response.put("count", records.size());
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    // ✅ READ — Get single record by ID
    @GetMapping("/doctor/medical-record/{id}")
    public ResponseEntity<Map<String, Object>> getRecordById(@PathVariable Long id) {

        Map<String, Object> response = new HashMap<>();

        try {
            MedicalRecord record = medicalRecordService.getRecordById(id);
            response.put("success", true);
            response.put("data", record);
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    // ✅ UPDATE — Doctor updates medical record
    @PutMapping("/doctor/medical-record/{id}")
    public ResponseEntity<Map<String, Object>> updateRecord(
            @PathVariable Long id,
            @RequestParam String diagnosis,
            @RequestParam String treatment) {

        Map<String, Object> response = new HashMap<>();

        try {
            MedicalRecord record = medicalRecordService.updateRecord(id, diagnosis, treatment);
            response.put("success", true);
            response.put("message", "Medical record updated successfully");
            response.put("data", record);
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    // ✅ DELETE — Doctor deletes medical record
    @DeleteMapping("/doctor/medical-record/{id}")
    public ResponseEntity<Map<String, Object>> deleteRecord(@PathVariable Long id) {

        Map<String, Object> response = new HashMap<>();

        try {
            medicalRecordService.deleteRecord(id);
            response.put("success", true);
            response.put("message", "Medical record deleted successfully");
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }
}