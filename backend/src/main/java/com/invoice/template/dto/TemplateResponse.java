package com.invoice.template.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemplateResponse {

    private Long id;
    private Long businessId;
    private String name;
    private String configJson;
    private Boolean isDefault;
    private LocalDateTime createdAt;
}
