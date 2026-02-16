package com.bill_split.app.data;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "items")
public class Item {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;

  private Long cost;

  @ElementCollection
  private List<String> claimedBy;

  private Boolean shareable;

  public Item() {
  }

  public Item(String name, Long cost) {
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

  public Long getCost() {
    return cost;
  }

  public void setCost(Long cost) {
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
