package com.invoice.template.repository;

import com.invoice.template.entity.PredefinedTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PredefinedTemplateRepository extends JpaRepository<PredefinedTemplate, Long> {
}
