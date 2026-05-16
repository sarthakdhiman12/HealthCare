package com.edutech.healthcare_appointment_management_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.healthcare_appointment_management_system.entity.MedicalRecord;
import com.edutech.healthcare_appointment_management_system.repository.*;

import java.util.List;

@Service
public class MedicalRecordService {

  @Autowired
  MedicalRecordRepository medicalRecordRepository;
  
  public List<MedicalRecord> getMedicalRecordByPatientId(Long patientId){
    return medicalRecordRepository.findByPatientId(patientId);
  }
}