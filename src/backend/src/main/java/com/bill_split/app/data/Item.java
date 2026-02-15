package com.bill_split.app.data;

public class Item {
  private String name;

  private Long cost;

  private Long[] claimedBy; // May change later to be String[] if using email

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

  public void setContent(String name) {
    this.name = name;
  }

  public String getCost() {
    return cost;
  }

  public void setCost(Long cost) {
    this.cost = cost;
  }

  public Long[] getClaimedBy() {
    return claimedBy;
  }

  public void setClaimedBy(Long[] claimedBy) {
    this.claimedBy = claimedBy;
  }

  public Boolean getShareable() {
    return shareable;
  }

  public void setShareable(Boolean shareable) {
    this.shareable = shareable;
  }
}
