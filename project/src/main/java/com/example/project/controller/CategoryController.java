package com.example.project.controller;

import com.example.project.model.Category;
import com.example.project.model.User;
import com.example.project.repository.CategoryRepository;
import com.example.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Category> getCategories(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return List.of();
        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        if (user == null) return List.of();
        return categoryRepository.findAll(); // Optionally filter by user
    }

    @PostMapping
    public Category addCategory(@RequestBody Category category, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        category.setUser(user);
        return categoryRepository.save(category);
    }
} 