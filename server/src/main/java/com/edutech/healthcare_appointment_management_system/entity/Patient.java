package com.edutech.healthcare_appointment_management_system.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.Set;

@Entity
public class Patient extends User {

    @OneToMany(mappedBy = "patient",cascade = CascadeType.ALL)
    @JsonIgnore
    Set<MedicalRecord> medicalRecords;

    @OneToMany(mappedBy = "patient",cascade = CascadeType.ALL)
    @JsonIgnore
    Set<Appointment> appointments;

    public Patient(){}
    
    public Patient(Set<MedicalRecord> medicalRecords, Set<Appointment> appointments) {
        this.medicalRecords = medicalRecords;
        this.appointments = appointments;
    }

    public Patient(String username, String password, String email, String role, Set<MedicalRecord> medicalRecords,
            Set<Appointment> appointments) {
        super(username, password, email, role);
        this.medicalRecords = medicalRecords;
        this.appointments = appointments;
    }

    public Patient(Long id, String username, String password, String email, String role,
            Set<MedicalRecord> medicalRecords, Set<Appointment> appointments) {
        super(id, username, password, email, role);
        this.medicalRecords = medicalRecords;
        this.appointments = appointments;
    }

    public Set<MedicalRecord> getMedicalRecords() {
        return medicalRecords;
    }

    public void setMedicalRecords(Set<MedicalRecord> medicalRecords) {
        this.medicalRecords = medicalRecords;
    }

    public Set<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(Set<Appointment> appointments) {
        this.appointments = appointments;
    }

}