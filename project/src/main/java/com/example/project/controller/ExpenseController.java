package com.example.project.controller;

import com.example.project.model.Category;
import com.example.project.model.Expense;
import com.example.project.model.ExpenseType;
import com.example.project.repository.CategoryRepository;
import com.example.project.repository.ExpenseRepository;
import com.example.project.repository.UserRepository;
import com.example.project.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import com.example.project.model.User;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {
    @Autowired
    private ExpenseService expenseService;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private ExpenseRepository expenseRepository;
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/page")
    public Page<Expense> getExpensesPage(Pageable pageable) {
        return expenseService.getExpensesPage(pageable);
    }

    @GetMapping
    public List<Expense> getAllExpenses(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return Collections.emptyList();
        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        if (user == null) return Collections.emptyList();
        return expenseRepository.findAll().stream()
            .filter(e -> e.getUser() != null && e.getUser().getId().equals(user.getId()))
            .collect(Collectors.toList());
    }

    @PostMapping
    public Expense addExpense(@RequestBody ExpenseRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        } else if (request.getCategoryName() != null) {
            category = categoryRepository.findByName(request.getCategoryName());
            if (category == null) {
                category = new Category();
                category.setName(request.getCategoryName());
                category.setUser(user);
                category = categoryRepository.save(category);
            }
        } else {
            throw new RuntimeException("Category is required");
        }
        Expense expense = new Expense();
        expense.setDate(LocalDate.parse(request.getDate()));
        expense.setCategory(category);
        expense.setDescription(request.getDescription());
        expense.setAmount(new BigDecimal(request.getAmount()));
        expense.setType(ExpenseType.valueOf(request.getType()));
        expense.setUser(user);
        expense.setCreditCard(request.isCreditCard());
        return expenseRepository.save(expense);
    }

    @GetMapping("/credit-card-summary")
    public CreditCardSummary getCreditCardSummary(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        BigDecimal limit = user.getCreditCardLimit() != null ? user.getCreditCardLimit() : BigDecimal.ZERO;
        BigDecimal spent = expenseRepository.findAll().stream()
            .filter(e -> e.getUser() != null && e.getUser().getId().equals(user.getId()) && e.isCreditCard() && e.getType() == ExpenseType.EXPENSE)
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal left = limit.subtract(spent);
        return new CreditCardSummary(limit, spent, left);
    }

    @PostMapping("/credit-card-limit")
    public void setCreditCardLimit(@RequestBody CreditCardLimitRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        user.setCreditCardLimit(new BigDecimal(request.getLimit()));
        userRepository.save(user);
    }

    // DTO for request
    public static class ExpenseRequest {
        private String date;
        private Long categoryId;
        private String categoryName;
        private String description;
        private String amount;
        private String type;
        private boolean creditCard;
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getAmount() { return amount; }
        public void setAmount(String amount) { this.amount = amount; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public boolean isCreditCard() { return creditCard; }
        public void setCreditCard(boolean creditCard) { this.creditCard = creditCard; }
    }

    public static class CreditCardSummary {
        private BigDecimal limit;
        private BigDecimal spent;
        private BigDecimal left;
        public CreditCardSummary(BigDecimal limit, BigDecimal spent, BigDecimal left) {
            this.limit = limit;
            this.spent = spent;
            this.left = left;
        }
        public BigDecimal getLimit() { return limit; }
        public BigDecimal getSpent() { return spent; }
        public BigDecimal getLeft() { return left; }
    }
    public static class CreditCardLimitRequest {
        private String limit;
        public String getLimit() { return limit; }
        public void setLimit(String limit) { this.limit = limit; }
    }
} 