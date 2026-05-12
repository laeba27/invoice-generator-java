package com.invoice.payment.controller;

import com.invoice.payment.dto.PaymentRequest;
import com.invoice.payment.dto.PaymentResponse;
import com.invoice.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> addPayment(@RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.addPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByInvoice(@PathVariable Long invoiceId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByInvoice(invoiceId);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        PaymentResponse payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(payment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}
