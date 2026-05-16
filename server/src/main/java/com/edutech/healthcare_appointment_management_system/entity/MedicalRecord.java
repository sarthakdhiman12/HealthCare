package com.edutech.healthcare_appointment_management_system.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String diagnosis;

    private String treatment;

    private LocalDateTime recordDate;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    public MedicalRecord() {
    }

    public MedicalRecord(String diagnosis, String treatment, LocalDateTime recordDate, Patient patient, Doctor doctor) {
        this.diagnosis = diagnosis;
        this.treatment = treatment;
        this.recordDate = recordDate;
        this.patient = patient;
        this.doctor = doctor;
    }

    public MedicalRecord(Long id, String diagnosis, String treatment, LocalDateTime recordDate, Patient patient,
            Doctor doctor) {
        this.id = id;
        this.diagnosis = diagnosis;
        this.treatment = treatment;
        this.recordDate = recordDate;
        this.patient = patient;
        this.doctor = doctor;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getTreatment() {
        return treatment;
    }

    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }

    public LocalDateTime getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(LocalDateTime recordDate) {
        this.recordDate = recordDate;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    

}