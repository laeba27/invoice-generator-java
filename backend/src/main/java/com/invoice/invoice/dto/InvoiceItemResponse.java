package com.invoice.invoice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceItemResponse {

    private Long id;
    private String itemName;
    private String itemDescription; // Phase 2
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal discount; // Phase 2
    private BigDecimal gstRate;
    private BigDecimal lineTotal;
}
