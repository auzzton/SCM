package com.scm.server.service;

import com.scm.server.model.Product;
import com.scm.server.repository.ProductRepository;
import com.scm.server.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProduct(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Transactional
    public Product createProduct(Product product) {
        // Validation logic here (e.g. check duplicate SKU)
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(UUID id, Product productDetails) {
        Product product = getProduct(id);
        product.setName(productDetails.getName());
        product.setSku(productDetails.getSku());
        product.setCategory(productDetails.getCategory());
        product.setQuantity(productDetails.getQuantity());
        product.setPrice(productDetails.getPrice());
        product.setMinStockLevel(productDetails.getMinStockLevel());
        product.setSupplier(productDetails.getSupplier());
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        productRepository.deleteById(id);
    }
}
