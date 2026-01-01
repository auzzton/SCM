package com.scm.server.service;

import com.scm.server.model.Product;
import com.scm.server.model.Supplier;
import com.scm.server.repository.ProductRepository;
import com.scm.server.repository.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private ProductService productService;

    private UUID supplierId;
    private Product product1;
    private Product product2;

    @BeforeEach
    void setUp() {
        supplierId = UUID.randomUUID();
        Supplier supplier = Supplier.builder().id(supplierId).name("Supplier A").build();

        product1 = Product.builder().id(UUID.randomUUID()).name("Product 1").supplier(supplier).build();
        product2 = Product.builder().id(UUID.randomUUID()).name("Product 2").supplier(supplier).build();
    }

    @Test
    void getAllProducts_WithNullSupplierId_ShouldReturnAllProducts() {
        // Arrange
        when(productRepository.findAll()).thenReturn(Arrays.asList(product1, product2));

        // Act
        List<Product> result = productService.getAllProducts(null);

        // Assert
        assertEquals(2, result.size());
        verify(productRepository, times(1)).findAll();
        verify(productRepository, never()).findBySupplierId(any());
    }

    @Test
    void getAllProducts_WithSupplierId_ShouldReturnFilteredProducts() {
        // Arrange
        when(productRepository.findBySupplierId(supplierId)).thenReturn(Arrays.asList(product1, product2));

        // Act
        List<Product> result = productService.getAllProducts(supplierId);

        // Assert
        assertEquals(2, result.size());
        verify(productRepository, never()).findAll();
        verify(productRepository, times(1)).findBySupplierId(supplierId);
    }
}
