package com.invoice.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomerResponse {

    private Long id;
    private Long businessId;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String stateCode;
    private String gstin;
}
