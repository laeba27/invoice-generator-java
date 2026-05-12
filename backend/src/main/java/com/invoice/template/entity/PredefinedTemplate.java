package com.invoice.template.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "predefined_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PredefinedTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "usage_count", nullable = false)
    private Long usageCount = 0L;

    @Column(name = "preview_image_url")
    private String previewImageUrl;
}
