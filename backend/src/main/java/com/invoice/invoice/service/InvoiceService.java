package com.invoice.invoice.service;

import com.invoice.auth.entity.User;
import com.invoice.auth.repository.UserRepository;
import com.invoice.business.entity.Business;
import com.invoice.business.repository.BusinessRepository;
import com.invoice.customer.entity.Customer;
import com.invoice.customer.repository.CustomerRepository;
import com.invoice.invoice.dto.*;
import com.invoice.invoice.entity.Invoice;
import com.invoice.invoice.entity.InvoiceItem;
import com.invoice.invoice.repository.InvoiceRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public InvoiceService(InvoiceRepository invoiceRepository, BusinessRepository businessRepository,
            CustomerRepository customerRepository, UserRepository userRepository) {
        this.invoiceRepository = invoiceRepository;
        this.businessRepository = businessRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        Business business = getBusinessForCurrentUser();

        // Validate customer if provided
        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            if (!customer.getBusinessId().equals(business.getId())) {
                throw new RuntimeException("Unauthorized access to customer");
            }
        }

        // Determine invoice type
        Invoice.InvoiceType invoiceType = determineInvoiceType(business, customer);

        // Create invoice
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setBusinessId(business.getId());
        invoice.setCustomerId(request.getCustomerId());
        invoice.setInvoiceType(invoiceType);

        // Phase 2 fields
        invoice.setInvoiceTitle(request.getInvoiceTitle());
        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setDueDate(request.getDueDate());
        invoice.setTemplateId(request.getTemplateId());
        invoice.setNotes(request.getNotes());
        invoice.setTotalDiscount(request.getTotalDiscount() != null ? request.getTotalDiscount() : BigDecimal.ZERO);

        // Calculate totals with Phase 2 enhancements
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalGst = BigDecimal.ZERO;
        BigDecimal itemDiscountTotal = BigDecimal.ZERO;

        for (InvoiceItemRequest itemReq : request.getItems()) {
            BigDecimal itemTotal = itemReq.getPrice()
                    .multiply(BigDecimal.valueOf(itemReq.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            // Apply item-level discount
            BigDecimal itemDiscount = itemReq.getDiscount() != null ? itemReq.getDiscount() : BigDecimal.ZERO;
            itemTotal = itemTotal.subtract(itemDiscount);
            itemDiscountTotal = itemDiscountTotal.add(itemDiscount);

            BigDecimal itemGst = itemTotal
                    .multiply(itemReq.getGstRate())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            subtotal = subtotal.add(itemTotal);
            totalGst = totalGst.add(itemGst);
        }

        invoice.setSubtotal(subtotal);
        invoice.setTaxTotal(totalGst);

        // Apply GST based on invoice type
        if (invoiceType == Invoice.InvoiceType.INTRA) {
            // CGST + SGST (split equally)
            BigDecimal halfGst = totalGst.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            invoice.setCgst(halfGst);
            invoice.setSgst(halfGst);
            invoice.setIgst(BigDecimal.ZERO);
        } else {
            // IGST
            invoice.setIgst(totalGst);
            invoice.setCgst(BigDecimal.ZERO);
            invoice.setSgst(BigDecimal.ZERO);
        }

        BigDecimal totalAmount = subtotal.add(totalGst).subtract(invoice.getTotalDiscount());
        invoice.setTotalAmount(totalAmount);
        invoice.setTotal(totalAmount); // Backward compatibility

        // Initialize payment fields
        invoice.setPaidAmount(BigDecimal.ZERO);
        invoice.setDueAmount(totalAmount);
        invoice.setStatus(Invoice.InvoiceStatus.DUE);

        // Save invoice
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Create invoice items with Phase 2 fields
        for (InvoiceItemRequest itemReq : request.getItems()) {
            InvoiceItem item = new InvoiceItem();
            item.setInvoice(savedInvoice);
            item.setItemName(itemReq.getItemName());
            item.setItemDescription(itemReq.getItemDescription());
            item.setQuantity(itemReq.getQuantity());
            item.setPrice(itemReq.getPrice());
            item.setDiscount(itemReq.getDiscount() != null ? itemReq.getDiscount() : BigDecimal.ZERO);
            item.setGstRate(itemReq.getGstRate());

            // Calculate line total using the helper method
            item.calculateLineTotal();

            savedInvoice.getItems().add(item);
        }

        savedInvoice = invoiceRepository.save(savedInvoice);

        return convertToResponse(savedInvoice);
    }

    public InvoiceResponse getInvoiceById(Long invoiceId) {
        Business business = getBusinessForCurrentUser();

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (!invoice.getBusinessId().equals(business.getId())) {
            throw new RuntimeException("Unauthorized access to invoice");
        }

        return convertToResponse(invoice);
    }

    InvoiceResponse updateInvoice(
            Long id,
            InvoiceRequest request
    );

    public List<InvoiceResponse> getAllInvoices() {
        Business business = getBusinessForCurrentUser();

        return invoiceRepository.findByBusinessIdOrderByCreatedAtDesc(business.getId())
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public void deleteInvoice(Long invoiceId) {
        Business business = getBusinessForCurrentUser();

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (!invoice.getBusinessId().equals(business.getId())) {
            throw new RuntimeException("Unauthorized access to invoice");
        }

        invoiceRepository.delete(invoice);
    }

    private Business getBusinessForCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return businessRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Business not found. Please create a business profile first."));
    }

    private Invoice.InvoiceType determineInvoiceType(Business business, Customer customer) {
        // No customer or no customer state -> INTRA
        if (customer == null || customer.getStateCode() == null) {
            return Invoice.InvoiceType.INTRA;
        }

        // Compare state codes
        if (business.getStateCode().equals(customer.getStateCode())) {
            return Invoice.InvoiceType.INTRA;
        } else {
            return Invoice.InvoiceType.INTER;
        }
    }

    private String generateInvoiceNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String invoiceNumber = "INV-" + timestamp;

        // Ensure uniqueness
        int counter = 1;
        String finalInvoiceNumber = invoiceNumber;
        while (invoiceRepository.existsByInvoiceNumber(finalInvoiceNumber)) {
            finalInvoiceNumber = invoiceNumber + "-" + counter;
            counter++;
        }

        return finalInvoiceNumber;
    }

    private InvoiceResponse convertToResponse(Invoice invoice) {
        List<InvoiceItemResponse> itemResponses = invoice.getItems().stream()
                .map(item -> new InvoiceItemResponse(
                item.getId(),
                item.getItemName(),
                item.getItemDescription(),
                item.getQuantity(),
                item.getPrice(),
                item.getDiscount(),
                item.getGstRate(),
                item.getLineTotal()
        ))
                .collect(Collectors.toList());

        InvoiceResponse response = new InvoiceResponse();
        response.setId(invoice.getId());
        response.setInvoiceNumber(invoice.getInvoiceNumber());
        response.setBusinessId(invoice.getBusinessId());
        response.setCustomerId(invoice.getCustomerId());

        // Fetch and set customer name
        if (invoice.getCustomerId() != null) {
            customerRepository.findById(invoice.getCustomerId())
                    .ifPresent(customer -> response.setCustomerName(customer.getName()));
        }
        response.setInvoiceTitle(invoice.getInvoiceTitle());
        response.setInvoiceDate(invoice.getInvoiceDate());
        response.setDueDate(invoice.getDueDate());
        response.setInvoiceType(invoice.getInvoiceType().toString());
        response.setSubtotal(invoice.getSubtotal());
        response.setTotalDiscount(invoice.getTotalDiscount());
        response.setCgst(invoice.getCgst());
        response.setSgst(invoice.getSgst());
        response.setIgst(invoice.getIgst());
        response.setTaxTotal(invoice.getTaxTotal());
        response.setTotalAmount(invoice.getTotalAmount());
        response.setPaidAmount(invoice.getPaidAmount());
        response.setDueAmount(invoice.getDueAmount());
        response.setStatus(invoice.getStatus().toString());
        response.setTemplateId(invoice.getTemplateId());
        response.setNotes(invoice.getNotes());
        response.setTotal(invoice.getTotal()); // Backward compatibility
        response.setCreatedAt(invoice.getCreatedAt());
        response.setItems(itemResponses);

        return response;
    }
}
