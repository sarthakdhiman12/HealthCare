package com.edutech.healthcare_appointment_management_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.repository.DoctorRepository;

import java.util.List;

@Service
public class DoctorService {
    @Autowired
    private DoctorRepository doctorRepository;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    @Transactional
    public Doctor updateAvailability(Long doctorId, String availability) {
        Doctor doctor = doctorRepository.findById(doctorId)
        .orElseThrow(() -> new RuntimeException("Doctor not found"));

        doctor.setAvailability(availability);
        return doctorRepository.save(doctor);
    }

}