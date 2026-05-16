package com.edutech.healthcare_appointment_management_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.edutech.healthcare_appointment_management_system.entity.Appointment;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import com.edutech.healthcare_appointment_management_system.repository.*;

import java.util.Date;
import java.util.List;

@Service
public class AppointmentService {

  @Autowired
  AppointmentRepository appointmentRepository;

  @Autowired
  PatientRepository patientRepository;

  @Autowired
  DoctorRepository doctorRepository;

  public List<Appointment> getAllAppointments() {
    return appointmentRepository.findAll();
  }

  @Transactional
  public Appointment scheduleAppointment(Long patientId, Long doctorId, Date appointmentTime){
    Patient patient = patientRepository.findById(patientId).orElseThrow(()-> new RuntimeException("Patient not found"));
    Doctor doctor = doctorRepository.findById(doctorId).orElseThrow(()-> new RuntimeException("Doctor not found"));

    Appointment appointment = new Appointment();
    appointment.setPatient(patient);
    appointment.setDoctor(doctor);
    appointment.setAppointmentTime(appointmentTime);
    appointment.setStatus("Scheduled");
    return appointmentRepository.save(appointment);
  }

  @Transactional
  public Appointment rescheduleAppointment(Long appointmentId, Date newTime){
    Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow(()-> new RuntimeException("Appointment not found"));
    appointment.setAppointmentTime(newTime);
    return appointmentRepository.save(appointment);
  }

  public List<Appointment> getAppointmentsByDoctorId(Long id) {
    return appointmentRepository.findByDoctorId(id);
  }

  public List<Appointment> getAppointmentsByPatientId(Long id) {
    return appointmentRepository.findByPatientId(id);
  }
}