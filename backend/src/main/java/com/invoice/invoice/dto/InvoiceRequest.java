package com.invoice.invoice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class InvoiceRequest {

    private Long customerId; // Optional - can be null for anonymous invoices

    // Phase 2 fields
    private String invoiceTitle;

    @NotNull(message = "Invoice date is required")
    private LocalDate invoiceDate;

    private LocalDate dueDate;

    private Long templateId; // Optional - template to use for this invoice

    private String notes; // Optional notes for the invoice

    private BigDecimal totalDiscount; // Optional overall discount

    @NotEmpty(message = "Invoice must have at least one item")
    @Valid
    private List<InvoiceItemRequest> items;
}
