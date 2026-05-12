package com.invoice.template.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemplateRequest {

    private Long businessId;
    private String name;
    private String configJson;
    private Boolean isDefault;
}
