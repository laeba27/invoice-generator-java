package com.invoice.payment.service;

import com.invoice.invoice.entity.Invoice;
import com.invoice.invoice.repository.InvoiceRepository;
import com.invoice.payment.dto.PaymentRequest;
import com.invoice.payment.dto.PaymentResponse;
import com.invoice.payment.entity.Payment;
import com.invoice.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    public PaymentResponse addPayment(PaymentRequest request) {
        // Validate invoice exists
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Create payment
        Payment payment = new Payment();
        payment.setInvoiceId(request.getInvoiceId());
        payment.setPaymentMethod(Payment.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()));
        payment.setReferenceId(request.getReferenceId());
        payment.setBankName(request.getBankName());
        payment.setAccountDetails(request.getAccountDetails());
        payment.setAmount(request.getAmount());
        payment.setPaymentDate(request.getPaymentDate());

        Payment savedPayment = paymentRepository.save(payment);

        // Update invoice paid amount and status
        updateInvoicePaymentStatus(invoice);

        return mapToResponse(savedPayment);
    }

    public List<PaymentResponse> getPaymentsByInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(invoiceId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return mapToResponse(payment);
    }

    @Transactional
    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        Long invoiceId = payment.getInvoiceId();
        paymentRepository.delete(payment);

        // Update invoice status after payment deletion
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        updateInvoicePaymentStatus(invoice);
    }

    private void updateInvoicePaymentStatus(Invoice invoice) {
        // Calculate total paid amount from all payments
        List<Payment> payments = paymentRepository.findByInvoiceId(invoice.getId());
        BigDecimal totalPaid = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        invoice.setPaidAmount(totalPaid);
        invoice.updateStatus(); // This will set status and dueAmount
        invoiceRepository.save(invoice);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setInvoiceId(payment.getInvoiceId());
        response.setPaymentMethod(payment.getPaymentMethod().name());
        response.setReferenceId(payment.getReferenceId());
        response.setBankName(payment.getBankName());
        response.setAccountDetails(payment.getAccountDetails());
        response.setAmount(payment.getAmount());
        response.setPaymentDate(payment.getPaymentDate());
        response.setCreatedAt(payment.getCreatedAt());
        return response;
    }
}
