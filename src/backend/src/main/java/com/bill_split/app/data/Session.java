package com.bill_split.app.data;

import jakarta.persistence.*;
import org.javatuples.Pair;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.util.List;

@Entity
@Table(name = "SESSIONS")
@EntityListeners(AuditingEntityListener.class)
public class Session {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "ID")
  private Long id;

  @Column(name = "NAME")
  private String name;

  @Column(name = "ITEMS")
  private List<Item> items;

  @Column(name = "USERS")
  private List<User> users; 

  @Column(name = "TIP")
  private Long tip;

  @Column(name = "TAX")
  private Long tax;

  public Session() {
  }

  public Session(String name, List<Item> items, Long tip, Long tax) {
    this.name = name;
    this.items = items;
    this.tip = tip;
    this.tax = tax;
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

  public Long getTip() {
    return tip;
  }

  public void setTip(Long tip) {
    this.tip = tip;
  }

    public Long getTax() {
    return tax;
  }

  public void setTax(Long tax) {
    this.tax = tax;
  }
}
