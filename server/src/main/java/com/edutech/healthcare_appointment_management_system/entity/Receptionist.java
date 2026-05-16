package com.edutech.healthcare_appointment_management_system.entity;

import javax.persistence.Entity;

@Entity
public class Receptionist extends User {
    
    public Receptionist(){

    }

    public Receptionist(String username, String password, String email, String role) {
        super(username, password, email, role);
    }

    public Receptionist(Long id, String username, String password, String email, String role) {
        super(id, username, password, email, role);
    }
    
}