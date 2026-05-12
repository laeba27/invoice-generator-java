package com.invoice.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    private Long invoiceId;
    private String paymentMethod; // CASH, BANK, UPI, CARD, CHEQUE, OTHER
    private String referenceId;
    private String bankName;
    private String accountDetails;
    private BigDecimal amount;
    private LocalDate paymentDate;
}
