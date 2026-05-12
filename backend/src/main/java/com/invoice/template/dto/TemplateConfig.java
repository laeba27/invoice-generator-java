package com.invoice.template.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Template configuration object Defines which sections to show/hide on invoice
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemplateConfig {

    private Boolean showCustomerEmail = true;
    private Boolean showCustomerPhone = true;
    private Boolean showCustomerLocation = true;
    private Boolean showDiscount = true;
    private Boolean showPaymentInfo = true;
    private Boolean showLogo = true;
    private Boolean showSignature = false;
    private Boolean showQrCode = false;
    private Boolean showNotes = true;
    private Boolean showDueDate = true;
    private Boolean showItemDescription = true;
}
