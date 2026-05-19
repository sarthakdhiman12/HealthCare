package com.edutech.healthcare_appointment_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.healthcare_appointment_management_system.entity.MedicalRecord;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord,Long> {

// ✅ Get all records for a patient
    List<MedicalRecord> findByPatientIdOrderByRecordDateDesc(Long patientId);

    // ✅ Get all records created by a doctor
    List<MedicalRecord> findByDoctorIdOrderByRecordDateDesc(Long doctorId);

    // ✅ Get records for a specific patient by a specific doctor
    List<MedicalRecord> findByPatientIdAndDoctorIdOrderByRecordDateDesc(Long patientId, Long doctorId);

}