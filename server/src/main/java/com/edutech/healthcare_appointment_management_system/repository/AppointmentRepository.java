package com.edutech.healthcare_appointment_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.healthcare_appointment_management_system.entity.Appointment;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByDoctorId(Long doctorId);

    // ✅ Slot system queries
    boolean existsByDoctorIdAndAppointmentDateAndSlot(Long doctorId, String appointmentDate, String slot);

    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, String appointmentDate);
}