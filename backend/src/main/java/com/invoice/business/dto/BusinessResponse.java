package com.invoice.business.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BusinessResponse {

    private Long id;
    private Long userId;
    private String businessName;
    private String address;
    private String stateCode;
    private String phone;
    private String gstNumber;
}
