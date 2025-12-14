package com.example.demo.service;

import com.example.demo.model.Travel;
import com.example.demo.repository.TravelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TravelService {

    @Autowired
    private TravelRepository travelRepository;

    // Create a new travel record
    public Travel createTravel(Travel travel) {
        return travelRepository.save(travel);
    }

    // Get all travels
    public List<Travel> getAllTravels() {
        return travelRepository.findAll();
    } 

    // Get travel by ID
    public Optional<Travel> getTravelById(Long id) {
        return travelRepository.findById(id);
    }

    // Update existing travel
    public Optional<Travel> updateTravel(Long id, Travel travelDetails) {
        return travelRepository.findById(id)
                .map(existingTravel -> {
                    existingTravel.setOrigin(travelDetails.getOrigin());
                    existingTravel.setDestination(travelDetails.getDestination());
                    existingTravel.setDepartureDate(travelDetails.getDepartureDate());
                    existingTravel.setReturnDate(travelDetails.getReturnDate());
                    existingTravel.setTravelType(travelDetails.getTravelType());
                    existingTravel.setPrice(travelDetails.getPrice());
                    existingTravel.setCurrency(travelDetails.getCurrency());
                    existingTravel.setPassengers(travelDetails.getPassengers());
                    existingTravel.setNotes(travelDetails.getNotes());
                    return travelRepository.save(existingTravel);
                });
    }

    // Delete travel by ID
    public boolean deleteTravel(Long id) {
        return travelRepository.findById(id)
                .map(travel -> {
                    travelRepository.delete(travel);
                    return true;
                })
                .orElse(false);
    }

    // Search by destination
    public List<Travel> findByDestination(String destination) {
        return travelRepository.findByDestinationContainingIgnoreCase(destination);
    }

    // Search by origin
    public List<Travel> findByOrigin(String origin) {
        return travelRepository.findByOriginContainingIgnoreCase(origin);
    }

    // Search by travel type
    public List<Travel> findByTravelType(String travelType) {
        return travelRepository.findByTravelType(travelType);
    }

    // Search by date range
    public List<Travel> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return travelRepository.findByDepartureDateBetween(startDate, endDate);
    }

    // Search by price range
    public List<Travel> findByPriceRange(Double minPrice, Double maxPrice) {
        return travelRepository.findByPriceBetween(minPrice, maxPrice);
    }

    // Search by currency
    public List<Travel> findByCurrency(String currency) {
        return travelRepository.findByCurrency(currency);
    }

    // Search by passenger count
    public List<Travel> findByPassengersGreaterThan(Integer passengers) {
        return travelRepository.findByPassengersGreaterThan(passengers);
    }

    // Search by origin or destination
    public List<Travel> searchTravels(String query) {
        return travelRepository.findByOriginOrDestinationContainingIgnoreCase(query);
    }

    // Get travel statistics by type
    public List<Object[]> getTravelStatisticsByType() {
        return travelRepository.countByTravelType();
    }
}