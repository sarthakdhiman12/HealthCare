package com.edutech.healthcare_appointment_management_system.controller;

import com.edutech.healthcare_appointment_management_system.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/otp")
public class OtpController {

    @Autowired
    private OtpService otpService;

    // ✅ Send OTP to email
    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestParam String email) {

        Map<String, Object> response = new HashMap<>();

        // ✅ Basic email validation
        if (email == null || email.isEmpty() || !email.contains("@")) {
            response.put("success", false);
            response.put("message", "Invalid email address");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        boolean sent = otpService.sendOtp(email);

        if (sent) {
            response.put("success", true);
            response.put("message", "OTP sent successfully to " + email);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            response.put("success", false);
            response.put("message", "Failed to send OTP. Please try again.");
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ Verify OTP
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyOtp(
            @RequestParam String email,
            @RequestParam String otp) {

        Map<String, Object> response = new HashMap<>();

        boolean verified = otpService.verifyOtp(email, otp);

        if (verified) {
            response.put("success", true);
            response.put("message", "Email verified successfully ✅");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            response.put("success", false);
            response.put("message", "Invalid or expired OTP ❌");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }
}