package com.invoice.business.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class BusinessRequest {

    @NotBlank(message = "Business name is required")
    private String businessName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "State code is required")
    @Pattern(regexp = "^[0-9]{2}$", message = "State code must be 2 digits")
    private String stateCode;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phone;

    private String gstNumber;
}
