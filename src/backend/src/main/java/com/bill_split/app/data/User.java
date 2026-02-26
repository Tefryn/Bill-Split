package com.bill_split.app.data;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "total_cost")
    private BigDecimal total_cost = 0;
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public BigDecimal getTotalCost() {
        return total_cost;
    }
    
    public void setTotalCost(BigDecimal total_cost) {
        this.total_cost = total_cost;
    }
}
