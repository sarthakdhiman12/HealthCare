package com.edutech.healthcare_appointment_management_system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edutech.healthcare_appointment_management_system.dto.LoginRequest;
import com.edutech.healthcare_appointment_management_system.dto.LoginResponse;
import com.edutech.healthcare_appointment_management_system.entity.Doctor;
import com.edutech.healthcare_appointment_management_system.entity.Patient;
import com.edutech.healthcare_appointment_management_system.entity.Receptionist;
import com.edutech.healthcare_appointment_management_system.entity.User;
import com.edutech.healthcare_appointment_management_system.jwt.JwtUtil;
import com.edutech.healthcare_appointment_management_system.repository.UserRepository;
import com.edutech.healthcare_appointment_management_system.service.UserService;

@RestController
@RequestMapping("/api")
public class RegisterAndLoginController {

    @Autowired
    UserService userService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    JwtUtil jwtUtil;

    @Autowired
    PasswordEncoder passwordEncoder;

    // ================= REGISTER =================

    @PostMapping("/patient/register")
    public ResponseEntity<?> registerPatient(@RequestBody Patient patientObj) {
        return new ResponseEntity<>(userService.registerPatient(patientObj), HttpStatus.CREATED);
    }

    @PostMapping("/doctors/register")
    public ResponseEntity<?> registerDoctor(@RequestBody Doctor doctorObj) {
        return new ResponseEntity<>(userService.registerDoctor(doctorObj), HttpStatus.CREATED);
    }

    @PostMapping("/receptionist/register")
    public ResponseEntity<?> registerReceptionist(@RequestBody Receptionist receptionistObj) {
        return new ResponseEntity<>(userService.registerReceptionist(receptionistObj), HttpStatus.CREATED);
    }

    // ================= LOGIN =================

    @PostMapping("/user/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }

        if (user.getPassword() == null) {
            return ResponseEntity.badRequest().body("Password is required");
        }

        if (!passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }

        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getRole());

        LoginResponse response = new LoginResponse(
                user.getId(),
                token,
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(response);
    }

    // ================= DELETE (original) =================

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<?> deleteUserById(@PathVariable Long userId) {
        userService.deleteUserById(userId);
        return ResponseEntity.ok("User deleted successfully with id: " + userId);
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<?> deleteDoctorById(@PathVariable Long id) {
        userService.deleteDoctorById(id);
        return ResponseEntity.ok("Doctor deleted successfully with id: " + id);
    }

    @DeleteMapping("/patient/{id}")
    public ResponseEntity<?> deletePatientById(@PathVariable Long id) {
        userService.deletePatientById(id);
        return ResponseEntity.ok("Patient deleted successfully with id: " + id);
    }

    @DeleteMapping("/receptionist/{id}")
    public ResponseEntity<?> deleteReceptionistById(@PathVariable Long id) {
        userService.deleteReceptionistById(id);
        return ResponseEntity.ok("Receptionist deleted successfully with id: " + id);
    }

    // ✅ ✅ POST WORKAROUND (if sandbox blocks DELETE method)
    @PostMapping("/delete/patient/{id}")
    public ResponseEntity<?> deletePatientByPost(@PathVariable Long id) {
        userService.deletePatientById(id);
        return ResponseEntity.ok("Patient deleted successfully");
    }

    @PostMapping("/delete/doctor/{id}")
    public ResponseEntity<?> deleteDoctorByPost(@PathVariable Long id) {
        userService.deleteDoctorById(id);
        return ResponseEntity.ok("Doctor deleted successfully");
    }

    @PostMapping("/delete/receptionist/{id}")
    public ResponseEntity<?> deleteReceptionistByPost(@PathVariable Long id) {
        userService.deleteReceptionistById(id);
        return ResponseEntity.ok("Receptionist deleted successfully");
    }

    @PostMapping("/delete/user/{userId}")
    public ResponseEntity<?> deleteUserByPost(@PathVariable Long userId) {
        userService.deleteUserById(userId);
        return ResponseEntity.ok("User deleted successfully");
    }

    // ================= UPDATE =================

    @PutMapping("/patient/{id}")
    public ResponseEntity<?> updatePatientById(@PathVariable Long id, @RequestBody Patient patientObj) {
        return ResponseEntity.ok(userService.updatePatientById(id, patientObj));
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<?> updateDoctorById(@PathVariable Long id, @RequestBody Doctor doctorObj) {
        return ResponseEntity.ok(userService.updateDoctorById(id, doctorObj));
    }

    @PutMapping("/receptionist/{id}")
    public ResponseEntity<?> updateReceptionistById(@PathVariable Long id,
            @RequestBody Receptionist receptionistObj) {
        return ResponseEntity.ok(userService.updateReceptionistById(id, receptionistObj));
    }
    
}