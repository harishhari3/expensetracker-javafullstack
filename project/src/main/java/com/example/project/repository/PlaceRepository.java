package com.example.project.repository;

import com.example.project.model.Place;
import com.example.project.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlaceRepository extends JpaRepository<Place, Long> {
    List<Place> findByUser(User user);
} 