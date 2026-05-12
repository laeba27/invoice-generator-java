package com.invoice.invoice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InvoiceItemRequest {

    @NotBlank(message = "Item name is required")
    private String itemName;

    // Phase 2: Item description
    private String itemDescription;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    // Phase 2: Item-level discount
    private BigDecimal discount;

    @NotNull(message = "GST rate is required")
    @DecimalMin(value = "0.00", message = "GST rate must be 0 or greater")
    private BigDecimal gstRate;
}
