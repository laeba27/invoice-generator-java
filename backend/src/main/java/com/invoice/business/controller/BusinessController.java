package com.invoice.business.controller;

import com.invoice.business.dto.BusinessRequest;
import com.invoice.business.dto.BusinessResponse;
import com.invoice.business.service.BusinessService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/business")
public class BusinessController {

    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    @PostMapping
    public ResponseEntity<BusinessResponse> createBusiness(@Valid @RequestBody BusinessRequest request) {
        return ResponseEntity.ok(businessService.createBusiness(request));
    }

    @GetMapping
    public ResponseEntity<BusinessResponse> getBusiness() {
        return ResponseEntity.ok(businessService.getBusiness());
    }

    @PutMapping
    public ResponseEntity<BusinessResponse> updateBusiness(@Valid @RequestBody BusinessRequest request) {
        return ResponseEntity.ok(businessService.updateBusiness(request));
    }
}
