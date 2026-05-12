package com.invoice.customer.service;

import com.invoice.auth.entity.User;
import com.invoice.auth.repository.UserRepository;
import com.invoice.business.entity.Business;
import com.invoice.business.repository.BusinessRepository;
import com.invoice.customer.dto.CustomerRequest;
import com.invoice.customer.dto.CustomerResponse;
import com.invoice.customer.entity.Customer;
import com.invoice.customer.repository.CustomerRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

    public CustomerService(CustomerRepository customerRepository, BusinessRepository businessRepository,
            UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
    }

    public CustomerResponse createCustomer(CustomerRequest request) {
        Long businessId = getBusinessIdForCurrentUser();

        Customer customer = new Customer();
        customer.setBusinessId(businessId);
        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setStateCode(request.getStateCode());
        customer.setGstin(request.getGstin());

        Customer savedCustomer = customerRepository.save(customer);

        return new CustomerResponse(
                savedCustomer.getId(),
                savedCustomer.getBusinessId(),
                savedCustomer.getName(),
                savedCustomer.getPhone(),
                savedCustomer.getEmail(),
                savedCustomer.getAddress(),
                savedCustomer.getCity(),
                savedCustomer.getStateCode(),
                savedCustomer.getGstin()
        );
    }

    public List<CustomerResponse> getAllCustomers() {
        Long businessId = getBusinessIdForCurrentUser();

        return customerRepository.findByBusinessId(businessId).stream()
                .map(c -> new CustomerResponse(
                c.getId(),
                c.getBusinessId(),
                c.getName(),
                c.getPhone(),
                c.getEmail(),
                c.getAddress(),
                c.getCity(),
                c.getStateCode(),
                c.getGstin()
        ))
                .collect(Collectors.toList());
    }

    public List<CustomerResponse> searchCustomers(String query) {
        Long businessId = getBusinessIdForCurrentUser();

        return customerRepository.findByBusinessIdAndNameContainingIgnoreCase(businessId, query).stream()
                .map(c -> new CustomerResponse(
                c.getId(),
                c.getBusinessId(),
                c.getName(),
                c.getPhone(),
                c.getEmail(),
                c.getAddress(),
                c.getCity(),
                c.getStateCode(),
                c.getGstin()
        ))
                .collect(Collectors.toList());
    }

    public CustomerResponse getCustomerById(Long customerId) {
        Long businessId = getBusinessIdForCurrentUser();

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (!customer.getBusinessId().equals(businessId)) {
            throw new RuntimeException("Unauthorized access to customer");
        }

        return new CustomerResponse(
                customer.getId(),
                customer.getBusinessId(),
                customer.getName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getAddress(),
                customer.getCity(),
                customer.getStateCode(),
                customer.getGstin()
        );
    }

    private Long getBusinessIdForCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Business business = businessRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Business not found. Please create a business profile first."));

        return business.getId();
    }
}
