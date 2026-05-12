package com.invoice.template.dto;

import lombok.Data;

@Data
public class TemplateAssignmentRequest {

    private Long businessId;
    private Long templateId;
    private String colorHex;
}
