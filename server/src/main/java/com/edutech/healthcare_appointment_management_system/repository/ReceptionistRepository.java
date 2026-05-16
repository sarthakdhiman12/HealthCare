package com.edutech.healthcare_appointment_management_system.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.healthcare_appointment_management_system.entity.Receptionist;

@Repository
public interface ReceptionistRepository extends JpaRepository<Receptionist, Long> {
    // Custom query methods if needed
    
    Optional<Receptionist> findByUsername(String username);

    Optional<Receptionist> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

}
