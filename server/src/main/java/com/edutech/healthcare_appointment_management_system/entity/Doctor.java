package com.edutech.healthcare_appointment_management_system.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.Set;

@Entity
public class Doctor extends User {

    @OneToMany(mappedBy = "doctor" ,cascade = CascadeType.ALL)
    @JsonIgnore
    Set<Appointment> appointments;

    @OneToMany(mappedBy = "doctor",cascade = CascadeType.ALL)
    @JsonIgnore
    Set<MedicalRecord> medicalRecords;
    
    private String specialty;
    private String availability;

    public Doctor() {
    }

    public Doctor(Set<Appointment> appointments, Set<MedicalRecord> medicalRecords, String specialty,
            String availability) {
        this.appointments = appointments;
        this.medicalRecords = medicalRecords;
        this.specialty = specialty;
        this.availability = availability;
    }

    public Doctor(String username, String password, String email, String role, Set<Appointment> appointments,
            Set<MedicalRecord> medicalRecords, String specialty, String availability) {
        super(username, password, email, role);
        this.appointments = appointments;
        this.medicalRecords = medicalRecords;
        this.specialty = specialty;
        this.availability = availability;
    }

    public Doctor(Long id, String username, String password, String email, String role, Set<Appointment> appointments,
            Set<MedicalRecord> medicalRecords, String specialty, String availability) {
        super(id, username, password, email, role);
        this.appointments = appointments;
        this.medicalRecords = medicalRecords;
        this.specialty = specialty;
        this.availability = availability;
    }

    public Set<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(Set<Appointment> appointments) {
        this.appointments = appointments;
    }

    public Set<MedicalRecord> getMedicalRecords() {
        return medicalRecords;
    }

    public void setMedicalRecords(Set<MedicalRecord> medicalRecords) {
        this.medicalRecords = medicalRecords;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }
    
}