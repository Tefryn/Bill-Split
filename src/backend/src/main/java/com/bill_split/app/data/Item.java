package com.bill_split.app.data;

import java.math.BigDecimal;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private BigDecimal cost;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "item_claimed_by", joinColumns = @JoinColumn(name = "item_id"))
    private List<String> claimedBy;

    private Boolean shareable = false;

    public Item() {
    }

    public Item(String name, BigDecimal cost) {
        this.name = name;
        this.cost = cost;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getSplitCost() {
        int split = !claimedBy.isEmpty() ? claimedBy.size() : 1;
        return cost.divide(BigDecimal.valueOf(split), 2, BigDecimal.ROUND_HALF_UP);
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

    public List<String> getClaimedBy() {
        return claimedBy;
    }

    public void setClaimedBy(List<String> claimedBy) {
        this.claimedBy = claimedBy;
    }

    public Boolean getShareable() {
        return shareable;
    }

    public void setShareable(Boolean shareable) {
        this.shareable = shareable;
    }
}
