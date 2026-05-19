package com.edutech.healthcare_appointment_management_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    // ✅ Store OTP in memory (email → otp)
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();

    // ✅ Store OTP timestamp (email → time)
    private final Map<String, Long> otpTimestamp = new ConcurrentHashMap<>();

    // ✅ OTP valid for 5 minutes
    private static final long OTP_EXPIRY_MS = 5 * 60 * 1000;

    // ✅ Generate 6-digit OTP
    public String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // 100000 to 999999
        return String.valueOf(otp);
    }

    // ✅ Send OTP to email
    public boolean sendOtp(String email) {
        try {
            String otp = generateOtp();

            // ✅ Store OTP
            otpStore.put(email, otp);
            otpTimestamp.put(email, System.currentTimeMillis());

            // ✅ Send email
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("HAM System - Email Verification OTP");
            message.setText(
                "Dear User,\n\n" +
                "Your OTP for email verification is: " + otp + "\n\n" +
                "This OTP is valid for 5 minutes.\n" +
                "Do not share this OTP with anyone.\n\n" +
                "Regards,\n" +
                "HAM System Team"
            );

            mailSender.send(message);

            System.out.println("✅ OTP sent to " + email + " → " + otp);
            return true;

        } catch (Exception e) {
            System.out.println("❌ Failed to send OTP to " + email + ": " + e.getMessage());
            return false;
        }
    }

    // ✅ Verify OTP
    public boolean verifyOtp(String email, String otp) {
        // ✅ Check if OTP exists
        if (!otpStore.containsKey(email)) {
            System.out.println("❌ No OTP found for " + email);
            return false;
        }

        // ✅ Check expiry
        long sentTime = otpTimestamp.getOrDefault(email, 0L);
        if (System.currentTimeMillis() - sentTime > OTP_EXPIRY_MS) {
            System.out.println("❌ OTP expired for " + email);
            otpStore.remove(email);
            otpTimestamp.remove(email);
            return false;
        }

        // ✅ Check OTP match
        String storedOtp = otpStore.get(email);
        if (storedOtp != null && storedOtp.equals(otp)) {
            System.out.println("✅ OTP verified for " + email);
            otpStore.remove(email);
            otpTimestamp.remove(email);
            return true;
        }

        System.out.println("❌ Wrong OTP for " + email);
        return false;
    }
}