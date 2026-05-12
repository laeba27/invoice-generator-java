package com.invoice.template.repository;

import com.invoice.template.entity.BusinessTemplateSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusinessTemplateSettingsRepository extends JpaRepository<BusinessTemplateSettings, Long> {

    Optional<BusinessTemplateSettings> findByBusinessId(Long businessId);
}
