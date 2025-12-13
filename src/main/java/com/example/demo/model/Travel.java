package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "travels")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Travel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Origin is required")
    @Size(max = 100, message = "Origin must not exceed 100 characters")
    @Column(nullable = false)
    private String origin;

    @NotBlank(message = "Destination is required")
    @Size(max = 100, message = "Destination must not exceed 100 characters")
    @Column(nullable = false)
    private String destination;

    @NotNull(message = "Departure date is required")
    @Column(nullable = false)
    private LocalDate departureDate;

    @NotNull(message = "Return date is required")
    @Column(nullable = false)
    private LocalDate returnDate;

    @NotBlank(message = "Travel type is required")
    @Column(nullable = false)
    private String travelType; // Round-trip, One-way, Multi-city

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column(nullable = false)
    private Double price;

    @NotBlank(message = "Currency is required")
    @Column(nullable = false)
    private String currency; // USD, EUR, INR, etc.

    @Min(value = 1, message = "Number of passengers must be at least 1")
    @Column(nullable = false)
    private Integer passengers;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}