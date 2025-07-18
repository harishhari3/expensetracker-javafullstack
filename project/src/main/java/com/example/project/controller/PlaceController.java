package com.example.project.controller;

import com.example.project.model.Place;
import com.example.project.model.User;
import com.example.project.repository.PlaceRepository;
import com.example.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/places")
public class PlaceController {
    @Autowired
    private PlaceRepository placeRepository;
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Place> getPlaces(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return placeRepository.findByUser(user);
    }

    @PostMapping
    public Place addPlace(@RequestBody PlaceRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Place place = new Place();
        place.setName(request.getName());
        place.setDescription(request.getDescription());
        place.setEstimatedCost(new BigDecimal(request.getEstimatedCost()));
        place.setUser(user);
        return placeRepository.save(place);
    }

    @DeleteMapping("/{id}")
    public void deletePlace(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Place place = placeRepository.findById(id).orElseThrow();
        if (!place.getUser().getId().equals(user.getId())) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Not allowed");
        }
        placeRepository.delete(place);
    }

    public static class PlaceRequest {
        private String name;
        private String description;
        private String estimatedCost;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getEstimatedCost() { return estimatedCost; }
        public void setEstimatedCost(String estimatedCost) { this.estimatedCost = estimatedCost; }
    }
} 