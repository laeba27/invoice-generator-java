package com.invoice.template.controller;

import com.invoice.template.dto.TemplateAssignmentRequest;
import com.invoice.template.dto.TemplateRequest;
import com.invoice.template.dto.TemplateResponse;
import com.invoice.template.entity.BusinessTemplateSettings;
import com.invoice.template.entity.PredefinedTemplate;
import com.invoice.template.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @GetMapping("/system")
    public ResponseEntity<List<PredefinedTemplate>> getAllSystemTemplates() {
        return ResponseEntity.ok(templateService.getAllSystemTemplates());
    }

    @PostMapping("/system/assign")
    public ResponseEntity<BusinessTemplateSettings> assignSystemTemplate(@RequestBody TemplateAssignmentRequest request) {
        return ResponseEntity.ok(templateService.assignSystemTemplate(request.getBusinessId(), request.getTemplateId(), request.getColorHex()));
    }

    @GetMapping("/system/settings/{businessId}")
    public ResponseEntity<BusinessTemplateSettings> getSystemTemplateSettings(@PathVariable Long businessId) {
        return ResponseEntity.ok(templateService.getSystemTemplateSettings(businessId));
    }

    @PostMapping
    public ResponseEntity<TemplateResponse> createTemplate(@RequestBody TemplateRequest request) {
        TemplateResponse response = templateService.createTemplate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<TemplateResponse>> getTemplatesByBusiness(@PathVariable Long businessId) {
        List<TemplateResponse> templates = templateService.getTemplatesByBusiness(businessId);
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/business/{businessId}/default")
    public ResponseEntity<TemplateResponse> getDefaultTemplate(@PathVariable Long businessId) {
        TemplateResponse template = templateService.getDefaultTemplate(businessId);
        if (template == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(template);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TemplateResponse> getTemplateById(@PathVariable Long id) {
        TemplateResponse template = templateService.getTemplateById(id);
        return ResponseEntity.ok(template);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TemplateResponse> updateTemplate(
            @PathVariable Long id,
            @RequestBody TemplateRequest request) {
        TemplateResponse response = templateService.updateTemplate(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
