package com.invoice.invoice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number", nullable = false, unique = true)
    private String invoiceNumber;

    @Column(name = "business_id", nullable = false)
    private Long businessId;

    @Column(name = "customer_id")
    private Long customerId;

    // Phase 2 enhancements
    @Column(name = "invoice_title")
    private String invoiceTitle;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "invoice_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private InvoiceType invoiceType;

    // Financial fields
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "total_discount", precision = 10, scale = 2)
    private BigDecimal totalDiscount = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal cgst = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal sgst = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal igst = BigDecimal.ZERO;

    @Column(name = "tax_total", precision = 10, scale = 2)
    private BigDecimal taxTotal = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "paid_amount", precision = 10, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "due_amount", precision = 10, scale = 2)
    private BigDecimal dueAmount = BigDecimal.ZERO;

    // Status tracking
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private InvoiceStatus status = InvoiceStatus.DUE;

    // Template and customization
    @Column(name = "template_id")
    private Long templateId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<InvoiceItem> items = new ArrayList<>();

    // Backward compatibility - keeping old 'total' field
    @Column(precision = 10, scale = 2)
    private BigDecimal total;

    public enum InvoiceType {
        INTRA, INTER
    }

    public enum InvoiceStatus {
        DUE, PARTIAL, PAID
    }

    // Helper method to update status based on payments
    public void updateStatus() {
        if (paidAmount.compareTo(BigDecimal.ZERO) == 0) {
            this.status = InvoiceStatus.DUE;
        } else if (paidAmount.compareTo(totalAmount) < 0) {
            this.status = InvoiceStatus.PARTIAL;
        } else {
            this.status = InvoiceStatus.PAID;
        }
        this.dueAmount = totalAmount.subtract(paidAmount);
    }
}
