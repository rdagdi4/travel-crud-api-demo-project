package com.example.demo.repository;

import com.example.demo.model.Travel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TravelRepository extends JpaRepository<Travel, Long> { 

    // Find travels by destination
    List<Travel> findByDestinationContainingIgnoreCase(String destination);

    // Find travels by origin
    List<Travel> findByOriginContainingIgnoreCase(String origin);

    // Find travels by travel type
    List<Travel> findByTravelType(String travelType);

    // Find travels by date range
    List<Travel> findByDepartureDateBetween(LocalDate startDate, LocalDate endDate);

    // Find travels by price range
    List<Travel> findByPriceBetween(Double minPrice, Double maxPrice);

    // Find travels by currency
    List<Travel> findByCurrency(String currency);

    // Custom query to find travels with passenger count greater than specified
    @Query("SELECT t FROM Travel t WHERE t.passengers > :passengers")
    List<Travel> findByPassengersGreaterThan(@Param("passengers") Integer passengers);

    // Custom query to search by origin or destination
    @Query("SELECT t FROM Travel t WHERE LOWER(t.origin) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.destination) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Travel> findByOriginOrDestinationContainingIgnoreCase(@Param("query") String query);

    // Count travels by travel type
    @Query("SELECT t.travelType, COUNT(t) FROM Travel t GROUP BY t.travelType")
    List<Object[]> countByTravelType();
}