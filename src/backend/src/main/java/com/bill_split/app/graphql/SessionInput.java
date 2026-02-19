package com.bill_split.app.graphql;

import com.bill_split.app.data.User;
import  com.bill_split.app.data.Item;
import java.util.List;

public class SessionInput {
  private List<Item> items;
  private List<User> users;
  private String name;
  private Boolean shareable;
  private Long tax;
  private Long tip;

  public SessionInput() {
  }

  public List<Item> getItems() {
    return items;
  }

  public void setItems(List<Item> items) {
    this.items = items;
  }

  public List<User> getUsers() {
    return users;
  }

  public void setUsers(List<User> users) {
    this.users = users;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Boolean getShareable() {
    return shareable;
  }

  public void setShareable(Boolean shareable) {
    this.shareable = shareable;
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