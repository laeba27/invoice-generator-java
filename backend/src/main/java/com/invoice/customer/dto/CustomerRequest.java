package com.invoice.customer.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CustomerRequest {

    private String name;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phone;

    private String email;

    private String address;

    private String city;

    @Pattern(regexp = "^[0-9]{2}$", message = "State code must be 2 digits")
    private String stateCode;

    private String gstin;
}
