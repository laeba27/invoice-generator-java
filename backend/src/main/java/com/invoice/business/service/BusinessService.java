package com.invoice.business.service;

import com.invoice.auth.entity.User;
import com.invoice.auth.repository.UserRepository;
import com.invoice.business.dto.BusinessRequest;
import com.invoice.business.dto.BusinessResponse;
import com.invoice.business.entity.Business;
import com.invoice.business.repository.BusinessRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

    public BusinessService(BusinessRepository businessRepository, UserRepository userRepository) {
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
    }

    public BusinessResponse createBusiness(BusinessRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (businessRepository.existsByUserId(user.getId())) {
            throw new RuntimeException("Business already exists for this user");
        }

        Business business = new Business();
        business.setUserId(user.getId());
        business.setBusinessName(request.getBusinessName());
        business.setAddress(request.getAddress());
        business.setStateCode(request.getStateCode());
        business.setPhone(request.getPhone());
        business.setGstNumber(request.getGstNumber());

        Business savedBusiness = businessRepository.save(business);

        return new BusinessResponse(savedBusiness.getId(), savedBusiness.getUserId(),
                savedBusiness.getBusinessName(), savedBusiness.getAddress(),
                savedBusiness.getStateCode(), savedBusiness.getPhone(),
                savedBusiness.getGstNumber());
    }

    public BusinessResponse getBusiness() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Business business = businessRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Business not found"));

        return new BusinessResponse(business.getId(), business.getUserId(),
                business.getBusinessName(), business.getAddress(),
                business.getStateCode(), business.getPhone(),
                business.getGstNumber());
    }

    public BusinessResponse updateBusiness(BusinessRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Business business = businessRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Business not found"));

        business.setBusinessName(request.getBusinessName());
        business.setAddress(request.getAddress());
        business.setStateCode(request.getStateCode());
        business.setPhone(request.getPhone());
        business.setGstNumber(request.getGstNumber());

        Business updatedBusiness = businessRepository.save(business);

        return new BusinessResponse(updatedBusiness.getId(), updatedBusiness.getUserId(),
                updatedBusiness.getBusinessName(), updatedBusiness.getAddress(),
                updatedBusiness.getStateCode(), updatedBusiness.getPhone(),
                updatedBusiness.getGstNumber());
    }
}
