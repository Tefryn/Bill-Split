package com.bill_split.app.data;
import com.bill_split.app.graphql.SessionInput;
import jakarta.persistence.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.util.List;

@Entity
@Table(name = "sessions")
@EntityListeners(AuditingEntityListener.class)
public class Session {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id") 
  private Long id;

  @Column(name = "name")
  private String name;

  @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  @JoinColumn(name = "session_id")
  private List<Item> items;

  @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
  @JoinColumn(name = "session_id")
  private List<User> users; 

  @Column(name = "tip")
  private String tip;

  @Column(name = "tax")
  private String tax;

  public Session() {
  }

  public Session(SessionInput input) {
    this.name = input.getName();
    this.items = input.getItems();
    this.users = input.getUsers();
    this.tip = input.getTip();
    this.tax = input.getTax();
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

  public String getTip() {
    return tip;
  }

  public void setTip(String tip) {
    this.tip = tip;
  }

    public String getTax() {
    return tax;
  }

  public void setTax(String tax) {
    this.tax = tax;
  }
}
