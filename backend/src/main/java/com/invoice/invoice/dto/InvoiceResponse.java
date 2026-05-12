package com.invoice.invoice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {

    private Long id;
    private String invoiceNumber;
    private Long businessId;
    private Long customerId;
    private String customerName;

    // Phase 2 fields
    private String invoiceTitle;
    private LocalDate invoiceDate;
    private LocalDate dueDate;

    private String invoiceType;

    // Financial fields
    private BigDecimal subtotal;
    private BigDecimal totalDiscount;
    private BigDecimal cgst;
    private BigDecimal sgst;
    private BigDecimal igst;
    private BigDecimal taxTotal;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal dueAmount;

    // Status and template
    private String status; // DUE, PARTIAL, PAID
    private Long templateId;
    private String notes;

    // Backward compatibility
    private BigDecimal total;

    private LocalDateTime createdAt;
    private List<InvoiceItemResponse> items;
}
