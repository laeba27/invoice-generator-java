package com.invoice.template.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "business_template_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessTemplateSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_id", nullable = false, unique = true)
    private Long businessId;

    @ManyToOne
    @JoinColumn(name = "template_id", nullable = false)
    private PredefinedTemplate template;

    @Column(name = "color_hex", nullable = false)
    private String colorHex;
}
