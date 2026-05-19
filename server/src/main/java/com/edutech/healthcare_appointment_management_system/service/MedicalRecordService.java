package com.edutech.healthcare_appointment_management_system.service;

import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.MedicalRecord;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import com.edutech.healthcare_appointment_management_system.repository.DoctorRepository;
import com.edutech.healthcare_appointment_management_system.repository.MedicalRecordRepository;
import com.edutech.healthcare_appointment_management_system.repository.PatientRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MedicalRecordService {

  @Autowired
  private MedicalRecordRepository medicalRecordRepository;

  @Autowired
  private PatientRepository patientRepository;

  @Autowired
  private DoctorRepository doctorRepository;

  // ✅ Create medical record
  public MedicalRecord createRecord(Long patientId, Long doctorId, String diagnosis, String treatment) {

    Optional<Patient> patientOpt = patientRepository.findById(patientId);
    Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);

    if (patientOpt.isEmpty()) {
      throw new RuntimeException("Patient not found with ID: " + patientId);
    }

    if (doctorOpt.isEmpty()) {
      throw new RuntimeException("Doctor not found with ID: " + doctorId);
    }

    MedicalRecord record = new MedicalRecord();
    record.setPatient(patientOpt.get());
    record.setDoctor(doctorOpt.get());
    record.setDiagnosis(diagnosis);
    record.setTreatment(treatment);
    record.setRecordDate(LocalDateTime.now());

    return medicalRecordRepository.save(record);
  }

  // ✅ Get all records for a patient
  public List<MedicalRecord> getRecordsByPatient(Long patientId) {
    return medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patientId);
  }

  // ✅ Get all records by a doctor
  public List<MedicalRecord> getRecordsByDoctor(Long doctorId) {
    return medicalRecordRepository.findByDoctorIdOrderByRecordDateDesc(doctorId);
  }

  // ✅ Get records for a patient by a specific doctor
  public List<MedicalRecord> getRecordsByPatientAndDoctor(Long patientId, Long doctorId) {
    return medicalRecordRepository.findByPatientIdAndDoctorIdOrderByRecordDateDesc(patientId, doctorId);
  }

  // ✅ Update medical record
  public MedicalRecord updateRecord(Long recordId, String diagnosis, String treatment) {

    Optional<MedicalRecord> recordOpt = medicalRecordRepository.findById(recordId);

    if (recordOpt.isEmpty()) {
      throw new RuntimeException("Medical record not found with ID: " + recordId);
    }

    MedicalRecord record = recordOpt.get();
    record.setDiagnosis(diagnosis);
    record.setTreatment(treatment);
    record.setRecordDate(LocalDateTime.now()); // update timestamp

    return medicalRecordRepository.save(record);
  }

  // ✅ Delete medical record
  public void deleteRecord(Long recordId) {

    if (!medicalRecordRepository.existsById(recordId)) {
      throw new RuntimeException("Medical record not found with ID: " + recordId);
    }

    medicalRecordRepository.deleteById(recordId);
  }

  // ✅ Get single record by ID
  public MedicalRecord getRecordById(Long recordId) {

    return medicalRecordRepository.findById(recordId)
        .orElseThrow(() -> new RuntimeException("Medical record not found with ID: " + recordId));
  }
}