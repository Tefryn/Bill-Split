package com.bill_split.app.graphql;

import  com.bill_split.app.data.Item;

public class SessionInput {
  private Item[] items;
  private String name;
  private Long tax;
  private Long tip;

  public SessionInput() {
  }

  public Item[] getItems() {
    return items;
  }

  public void setItems(Item[] items) {
    this.items = items;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Long getTax() {
    return tax;
  }

  public void setTax(Long tax) {
    this.tax = tax;
  }

  public Long getTip() {
    return tip;
  }

  public void setTip(Long tip) {
    this.tip = tip;
  }
}