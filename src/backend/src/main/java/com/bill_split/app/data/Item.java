package com.bill_split.app.data;

import jakarta.persistence.*;
import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "ITEMS")
@EntityListeners(AuditingEntityListener.class)
public class Note {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "ID")
  private Long id;

  @Column(name = "NAME")
  private String name;

  @Column(name = "COST")
  private Long cost;

  @Column(name = "CLAIMEDBY")
  private Long[] claimedBy; // May change later to be String[] if using email

  @Column(name = "SHAREABLE")
  private Boolean shareable;

  public Item() {
  }

  public Note(String name, Long cost) {
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
