package com.invoice.invoice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "invoice_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    // Phase 2 enhancement
    @Column(name = "item_description", columnDefinition = "TEXT")
    private String itemDescription;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // Phase 2 enhancement - item-level discount
    @Column(precision = 10, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "gst_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal gstRate;

    @Column(name = "line_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal lineTotal;

    // Helper method to calculate line total
    // Formula: (qty × price) - discount + tax
    public void calculateLineTotal() {
        BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(quantity));
        itemTotal = itemTotal.subtract(discount);
        BigDecimal taxAmount = itemTotal.multiply(gstRate.divide(BigDecimal.valueOf(100)));
        this.lineTotal = itemTotal.add(taxAmount);
    }
}
