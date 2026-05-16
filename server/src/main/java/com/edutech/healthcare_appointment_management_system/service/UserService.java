package com.edutech.healthcare_appointment_management_system.service;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import com.edutech.healthcare_appointment_management_system.entity.Receptionist;
import com.edutech.healthcare_appointment_management_system.entity.User;
import com.edutech.healthcare_appointment_management_system.repository.DoctorRepository;
import com.edutech.healthcare_appointment_management_system.repository.PatientRepository;
import com.edutech.healthcare_appointment_management_system.repository.ReceptionistRepository;
import com.edutech.healthcare_appointment_management_system.repository.UserRepository;

import java.beans.PropertyDescriptor;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PatientRepository patientRepository;

    @Autowired
    DoctorRepository doctorRepository;

    @Autowired
    ReceptionistRepository receptionistRepository;

    // ================= REGISTER =================

    @Transactional
    public Patient registerPatient(Patient patient) {
        validateUserBeforeRegistration(
                patient.getEmail(),
                patient.getUsername());
        if (patient.getPassword() == null || patient.getPassword().isEmpty()) {
            patient.setPassword("defaultPassword123");
        }

        patient.setPassword(passwordEncoder.encode(patient.getPassword()));
        patient.setRole("PATIENT");

        return patientRepository.save(patient);
    }

    @Transactional
    public Doctor registerDoctor(Doctor doctor) {
        validateUserBeforeRegistration(
                doctor.getEmail(),
                doctor.getUsername());
        if (doctor.getPassword() == null || doctor.getPassword().isEmpty()) {
            doctor.setPassword("defaultPassword123");
        }

        doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        doctor.setRole("DOCTOR");

        return doctorRepository.save(doctor);
    }

    @Transactional
    public Receptionist registerReceptionist(Receptionist receptionist) {
        validateUserBeforeRegistration(
                receptionist.getEmail(),
                receptionist.getUsername());
        if (receptionist.getPassword() == null || receptionist.getPassword().isEmpty()) {
            receptionist.setPassword("defaultPassword123");
        }

        receptionist.setPassword(passwordEncoder.encode(receptionist.getPassword()));
        receptionist.setRole("RECEPTIONIST");

        return receptionistRepository.save(receptionist);
    }

    // ================= UPDATE =================

    @Transactional
    public Patient updatePatientById(Long id, Patient patient) {
        Patient existingPatient = patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Patient not found with id: " + id));

        BeanUtils.copyProperties(
                patient,
                existingPatient,
                getNullPropertyNames(patient, "id", "password", "role"));

        if (patient.getPassword() != null && !patient.getPassword().isEmpty()) {
            existingPatient.setPassword(passwordEncoder.encode(patient.getPassword()));
        }

        existingPatient.setRole("PATIENT");

        return patientRepository.save(existingPatient);
    }

    @Transactional
    public Doctor updateDoctorById(Long id, Doctor doctor) {
        Doctor existingDoctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Doctor not found with id: " + id));

        BeanUtils.copyProperties(
                doctor,
                existingDoctor,
                getNullPropertyNames(doctor, "id", "password", "role"));

        if (doctor.getPassword() != null && !doctor.getPassword().isEmpty()) {
            existingDoctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        }

        existingDoctor.setRole("DOCTOR");

        return doctorRepository.save(existingDoctor);
    }

    @Transactional
    public Receptionist updateReceptionistById(Long id, Receptionist receptionist) {
        Receptionist existingReceptionist = receptionistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Receptionist not found with id: " + id));

        BeanUtils.copyProperties(
                receptionist,
                existingReceptionist,
                getNullPropertyNames(receptionist, "id", "password", "role"));

        if (receptionist.getPassword() != null && !receptionist.getPassword().isEmpty()) {
            existingReceptionist.setPassword(passwordEncoder.encode(receptionist.getPassword()));
        }

        existingReceptionist.setRole("RECEPTIONIST");

        return receptionistRepository.save(existingReceptionist);
    }

    // ================= DELETE (OLD — by entity ID) =================

    @Transactional
    public void deleteDoctorById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Doctor not found with id: " + id);
        }

        userRepository.deleteById(id);
    }

    @Transactional
    public void deletePatientById(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Patient not found with id: " + id);
        }

        patientRepository.deleteById(id);
    }

    @Transactional
    public void deleteReceptionistById(Long id) {
        if (!receptionistRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Receptionist not found with id: " + id);
        }

        receptionistRepository.deleteById(id);
    }

    // ✅ ✅ NEW: DELETE BY USER ID (works for all roles)
    @Transactional
    public void deleteUserById(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "User not found with id: " + userId);
        }

        userRepository.deleteById(userId);
    }

    // ================= AUTH =================

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority(user.getRole())));
    }

    public User getUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return user;
    }

    private String[] getNullPropertyNames(Object source, String... extraIgnoredProperties) {
        final BeanWrapper src = new BeanWrapperImpl(source);
        PropertyDescriptor[] propertyDescriptors = src.getPropertyDescriptors();

        Set<String> emptyNames = new HashSet<>();

        for (PropertyDescriptor propertyDescriptor : propertyDescriptors) {
            Object srcValue = src.getPropertyValue(propertyDescriptor.getName());

            if (srcValue == null) {
                emptyNames.add(propertyDescriptor.getName());
            }
        }

        for (String property : extraIgnoredProperties) {
            emptyNames.add(property);
        }

        return emptyNames.toArray(new String[0]);
    }

    private void validateUserBeforeRegistration(String email, String username) {

        if (email == null || email.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required");
        }

        if (username == null || username.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Username is required");
        }

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email already registered");
        }

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Username already taken");
        }
    }
}