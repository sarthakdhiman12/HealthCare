package com.edutech.healthcare_appointment_management_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import com.edutech.healthcare_appointment_management_system.repository.*;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired
    AppointmentRepository appointmentRepository;

    @Autowired
    PatientRepository patientRepository;

    @Autowired
    DoctorRepository doctorRepository;

    // ✅ Fixed slots 10 AM to 5 PM
    public static final List<String> ALL_SLOTS = Arrays.asList(
        "10:00-11:00",
        "11:00-12:00",
        "12:00-13:00",
        "13:00-14:00",
        "14:00-15:00",
        "15:00-16:00",
        "16:00-17:00"
    );

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // ✅ NEW: Slot-based booking
    @Transactional
    public Appointment scheduleAppointment(Long patientId, Long doctorId, String date, String slot) {

        if (!ALL_SLOTS.contains(slot)) {
            throw new RuntimeException("Invalid slot: " + slot);
        }

        // ✅ DUPLICATE CHECK (most important)
        if (appointmentRepository.existsByDoctorIdAndAppointmentDateAndSlot(doctorId, date, slot)) {
            throw new RuntimeException("This slot is already booked for the selected doctor on " + date);
        }

        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient not found"));

        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(date);
        appointment.setSlot(slot);
        appointment.setStatus("Scheduled");

        return appointmentRepository.save(appointment);
    }

    // ✅ NEW: Slot-based reschedule
    @Transactional
    public Appointment rescheduleAppointment(Long appointmentId, String newDate, String newSlot) {

        if (!ALL_SLOTS.contains(newSlot)) {
            throw new RuntimeException("Invalid slot: " + newSlot);
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Long doctorId = appointment.getDoctor().getId();

        if (appointmentRepository.existsByDoctorIdAndAppointmentDateAndSlot(doctorId, newDate, newSlot)) {
            throw new RuntimeException("This slot is already booked");
        }

        appointment.setAppointmentDate(newDate);
        appointment.setSlot(newSlot);

        return appointmentRepository.save(appointment);
    }

    // ✅ Get available slots for a doctor on a date
    public List<String> getAvailableSlots(Long doctorId, String date) {
        List<Appointment> bookedAppointments = appointmentRepository
            .findByDoctorIdAndAppointmentDate(doctorId, date);

        List<String> bookedSlots = bookedAppointments.stream()
            .map(Appointment::getSlot)
            .collect(Collectors.toList());

        return ALL_SLOTS.stream()
            .filter(slot -> !bookedSlots.contains(slot))
            .collect(Collectors.toList());
    }

    public List<Appointment> getAppointmentsByDoctorId(Long id) {
        return appointmentRepository.findByDoctorId(id);
    }

    public List<Appointment> getAppointmentsByPatientId(Long id) {
        return appointmentRepository.findByPatientId(id);
    }
}