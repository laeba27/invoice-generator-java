package com.invoice.customer.repository;

import com.invoice.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findByBusinessId(Long businessId);

    List<Customer> findByBusinessIdAndNameContainingIgnoreCase(Long businessId, String name);
}
