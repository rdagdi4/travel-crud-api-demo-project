package com.example.demo.controller;

import com.example.demo.model.Travel;
import com.example.demo.service.TravelService;
// import org.springframework.validation.annotation.Validated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/travels")
@CrossOrigin(origins = "*")
public class TravelController {

    @Autowired
    private TravelService travelService;

    // CREATE - Add a new travel record
    @PostMapping
    public ResponseEntity<Travel> createTravel(@RequestBody Travel travel) {
        try {
            Travel createdTravel = travelService.createTravel(travel);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTravel);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // READ - Get all travels
    @GetMapping
    public ResponseEntity<List<Travel>> getAllTravels() {
        try {
            List<Travel> travels = travelService.getAllTravels();
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // READ - Get travel by ID
    @GetMapping("/{id}")
    public ResponseEntity<Travel> getTravelById(@PathVariable Long id) {
        return travelService.getTravelById(id)
                .map(travel -> ResponseEntity.ok(travel))
                .orElse(ResponseEntity.notFound().build());
    }

    // UPDATE - Update existing travel
    @PutMapping("/{id}")
    public ResponseEntity<Travel> updateTravel(@PathVariable Long id, @RequestBody Travel travelDetails) {
        return travelService.updateTravel(id, travelDetails)
                .map(updatedTravel -> ResponseEntity.ok(updatedTravel))
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE - Delete travel by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTravel(@PathVariable Long id) {
        boolean deleted = travelService.deleteTravel(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Travel record deleted successfully: " + id));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // SEARCH ENDPOINTS

    // Search by destination
    @GetMapping("/search/destination/{destination}")
    public ResponseEntity<List<Travel>> findByDestination(@PathVariable String destination) {
        try {
            List<Travel> travels = travelService.findByDestination(destination);
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search by origin
    @GetMapping("/search/origin/{origin}")
    public ResponseEntity<List<Travel>> findByOrigin(@PathVariable String origin) {
        try {
            List<Travel> travels = travelService.findByOrigin(origin);
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search by travel type
    @GetMapping("/search/type/{travelType}")
    public ResponseEntity<List<Travel>> findByTravelType(@PathVariable String travelType) {
        try {
            List<Travel> travels = travelService.findByTravelType(travelType);
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search by date range
    @GetMapping("/search/dates")
    public ResponseEntity<List<Travel>> findByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            List<Travel> travels = travelService.findByDateRange(
                    java.time.LocalDate.parse(startDate),
                    java.time.LocalDate.parse(endDate));
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Search by price range
    @GetMapping("/search/price")
    public ResponseEntity<List<Travel>> findByPriceRange(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice) {
        try {
            List<Travel> travels = travelService.findByPriceRange(minPrice, maxPrice);
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Search by currency
    @GetMapping("/search/currency/{currency}")
    public ResponseEntity<List<Travel>> findByCurrency(@PathVariable String currency) {
        try {
            List<Travel> travels = travelService.findByCurrency(currency);
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search by passenger count
    @GetMapping("/search/passengers/{passengers}")
    public ResponseEntity<List<Travel>> findByPassengersGreaterThan(@PathVariable Integer passengers) {
        try {
            List<Travel> travels = travelService.findByPassengersGreaterThan(passengers);
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Global search (by origin or destination)
    @GetMapping("/search/{query}")
    public ResponseEntity<List<Travel>> searchTravels(@PathVariable String query) {
        try {
            List<Travel> travels = travelService.searchTravels(query);
            return ResponseEntity.ok(travels);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get travel statistics by type
    @GetMapping("/statistics/type")
    public ResponseEntity<List<Object[]>> getTravelStatisticsByType() {
        try {
            List<Object[]> stats = travelService.getTravelStatisticsByType();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}