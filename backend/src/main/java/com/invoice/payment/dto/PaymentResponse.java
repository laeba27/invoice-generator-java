package com.invoice.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long id;
    private Long invoiceId;
    private String paymentMethod;
    private String referenceId;
    private String bankName;
    private String accountDetails;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private LocalDateTime createdAt;
}
