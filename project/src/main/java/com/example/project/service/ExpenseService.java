package com.example.project.service;

import com.example.project.model.Expense;
import com.example.project.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ExpenseService {
    @Autowired
    private ExpenseRepository expenseRepository;

    public Page<Expense> getExpensesPage(Pageable pageable) {
        return expenseRepository.findAll(pageable);
    }
} 