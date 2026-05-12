package com.invoice.business.repository;

import com.invoice.business.entity.BusinessAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessAssetRepository extends JpaRepository<BusinessAsset, Long> {

    List<BusinessAsset> findByBusinessId(Long businessId);

    List<BusinessAsset> findByBusinessIdAndType(Long businessId, BusinessAsset.AssetType type);

    Optional<BusinessAsset> findFirstByBusinessIdAndType(Long businessId, BusinessAsset.AssetType type);
}
