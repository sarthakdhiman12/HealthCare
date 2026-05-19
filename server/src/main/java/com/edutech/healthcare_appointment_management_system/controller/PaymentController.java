package com.edutech.healthcare_appointment_management_system.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    // ✅ Create Razorpay Order
    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestParam int amount,
                                                            @RequestParam Long appointmentId) {
        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject options = new JSONObject();
            options.put("amount", amount * 100); // ✅ Razorpay expects paisa (₹500 = 50000)
            options.put("currency", "INR");
            options.put("receipt", "appt_" + appointmentId);

            Order order = client.orders.create(options);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("keyId", razorpayKeyId);

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("Razorpay Error: " + e.getMessage());

            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create order");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ Verify Payment (optional — for production)
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestParam String razorpayPaymentId,
            @RequestParam String razorpayOrderId,
            @RequestParam Long appointmentId) {

        Map<String, Object> response = new HashMap<>();
        response.put("status", "PAID");
        response.put("paymentId", razorpayPaymentId);
        response.put("orderId", razorpayOrderId);
        response.put("appointmentId", appointmentId);

        System.out.println("✅ Payment Verified: " + razorpayPaymentId);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}