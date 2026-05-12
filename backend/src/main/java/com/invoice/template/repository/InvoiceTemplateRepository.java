package com.invoice.template.repository;

import com.invoice.template.entity.InvoiceTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceTemplateRepository extends JpaRepository<InvoiceTemplate, Long> {

    List<InvoiceTemplate> findByBusinessId(Long businessId);

    Optional<InvoiceTemplate> findByBusinessIdAndIsDefaultTrue(Long businessId);
}
