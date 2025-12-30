package com.scm.server.service;

import com.scm.server.model.Supplier;
import com.scm.server.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier getSupplier(UUID id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
    }

    @Transactional
    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier updateSupplier(UUID id, Supplier supplierDetails) {
        Supplier supplier = getSupplier(id);
        supplier.setName(supplierDetails.getName());
        supplier.setContactInfo(supplierDetails.getContactInfo());
        supplier.setAddress(supplierDetails.getAddress());
        return supplierRepository.save(supplier);
    }

    @Transactional
    public void deleteSupplier(UUID id) {
        supplierRepository.deleteById(id);
    }
}
