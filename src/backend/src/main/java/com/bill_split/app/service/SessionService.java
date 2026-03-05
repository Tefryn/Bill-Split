package com.bill_split.app.service;

import java.math.BigDecimal;
import com.bill_split.app.data.Session;
import com.bill_split.app.graphql.SessionInput;
import com.bill_split.app.data.Item;
import com.bill_split.app.data.SessionRepository;
import com.bill_split.app.data.User;
import java.util.Arrays;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SessionService {
  // TODO: Implement OCR
  //private static final String SESSION_OCR_EVENT_QUEUE = "session_ocr_event_queue";

  private final SessionRepository sessionRepository;
  private final StringRedisTemplate redis;
  private final SimpMessagingTemplate socket;

  public SessionService(SessionRepository sessionRepository, StringRedisTemplate redis, SimpMessagingTemplate socket) {
    this.sessionRepository = sessionRepository;
    this.redis = redis;
    this.socket = socket;
  }

  public Optional<Session> getSessionById(Long sessionId) {
    return sessionRepository.findById(sessionId);
  }

  public Session createSession(SessionInput input) {
    System.out.print("Creating session with name: " + input.getItems());
    Session session = sessionRepository.save(new Session(input));

    // String event = session.getId() + "::" + content;
    // redis.opsForList().rightPush(SESSION_OCR_EVENT_QUEUE, event); For OCR

    // System.out.println(" queued OCR compilation job for session: " + session.getId());

    return session;
  }

  public Boolean joinSession(Long sessionId, String userEmail) {
    Optional<Session> optionalSession = sessionRepository.findById(sessionId);
    if (optionalSession.isPresent()) {
      Session session = optionalSession.get();
      List<User> users = session.getUsers();
      
      User newUser = new User();
      newUser.setEmail(userEmail);
      
      if (!session.getUsers().stream().anyMatch(n -> n.getEmail().equals(userEmail))) { // if user is not already in session
        users.add(newUser);
        session.setUsers(users);
        sessionRepository.save(session);
      }

      checkBillFinalizable(sessionId);
      
      return true;
    }
    return false;
  }

  public Boolean leaveSession(Long sessionId, String userEmail) {
    Optional<Session> optionalSession = sessionRepository.findById(sessionId);
    if (optionalSession.isPresent()) {
      Session session = optionalSession.get();
      List<User> users = session.getUsers();
      
      boolean userRemoved = users.removeIf(n -> n.getEmail().equals(userEmail));
      
      if (userRemoved) {
        session.setUsers(users);
        sessionRepository.save(session);
      }

      checkBillFinalizable(sessionId);
      
      return userRemoved;
    }
    return false;
 }

  public Boolean claimItem(Long sessionId, Long itemId, String userEmail) {
    System.out.println("claimItem called: sessionId=" + sessionId + ", itemId=" + itemId + ", userEmail=" + userEmail);
    Optional<Session> optionalSession = sessionRepository.findById(sessionId);
    if (optionalSession.isPresent()) {
      Session session = optionalSession.get();
      System.out.println("Session found. Users count: " + session.getUsers().size() + ", Items count: " + session.getItems().size());
      Optional<User> optionalUser = session.getUsers().stream().filter(n -> n.getEmail().equals(userEmail)).findFirst();
      Optional<Item> optionalItem = session.getItems().stream().filter(n -> n.getId().equals(itemId)).findFirst();

      System.out.println("User present: " + optionalUser.isPresent() + ", Item present: " + optionalItem.isPresent());
      if (!optionalUser.isPresent() || !optionalItem.isPresent()) {
        return false;
      }
      User user = optionalUser.get();
      Item item = optionalItem.get();

      if (!item.getShareable() && item.getClaimedBy().size() != 0 || item.getClaimedBy().contains(userEmail)) {
        return false;
      }

      List<String> claimedBy = item.getClaimedBy();
      claimedBy.add(userEmail);
      item.setClaimedBy(claimedBy);
      user.setTotalCost(user.getTotalCost().add(item.getCost()));
      sessionRepository.save(session);

      checkBillFinalizable(sessionId);
      return true;
    }
    System.out.println("Session not found with id: " + sessionId);
    return false;
  }

    public Boolean unclaimItem(Long sessionId, Long itemId, String userEmail) {
    Optional<Session> optionalSession = sessionRepository.findById(sessionId);
    if (optionalSession.isPresent()) {
      Session session = optionalSession.get();
      Optional<User> optionalUser = session.getUsers().stream().filter(n -> n.getEmail().equals(userEmail)).findFirst();
      Optional<Item> optionalItem = session.getItems().stream().filter(n -> n.getId().equals(itemId)).findFirst();

      if (!optionalUser.isPresent() || !optionalItem.isPresent()) {
        return false;
      }
      User user = optionalUser.get();
      Item item = optionalItem.get();

      if (!item.getClaimedBy().contains(userEmail)) {
        return false;
      }

      List<String> claimedBy = item.getClaimedBy();
      claimedBy.remove(userEmail);
      item.setClaimedBy(claimedBy);
      user.setTotalCost(user.getTotalCost().subtract(item.getCost()));
      sessionRepository.save(session);

      checkBillFinalizable(sessionId);
      return true;
    }
    System.out.println("Session not found with id: " + sessionId);
    return false;
  }

  private void checkBillFinalizable(Long sessionId) {
    Optional<Session> optionalSession = sessionRepository.findById(sessionId);
    if (optionalSession.isPresent()) {
      Session session = optionalSession.get();
      List<User> users = session.getUsers();
      BigDecimal expectedCost = session.getItems().stream().map(Item::getCost).reduce(BigDecimal.ZERO, BigDecimal::add);
      BigDecimal totalCost = users.stream().map(User::getTotalCost).reduce(BigDecimal.ZERO, BigDecimal::add);
      Boolean deadWeightUser = users.stream().anyMatch(user -> user.getTotalCost().compareTo(BigDecimal.ZERO) == 0);

      // BigDecimal expectedCost = session.getItems().stream().mapToBigDecimal(Item::getCost).sum();
      // BigDecimal totalCost = users.stream().mapToBigDecimal(User::getTotalCost).getTotalCost().sum();
      // .map(Item::getCost).reduce(BigDecimal.ZERO, BigDecimal::add);

      String destination = "/topic/session/" + Long.toString(sessionId);
      Boolean billCanBeClosedOut = (!deadWeightUser && totalCost.compareTo(expectedCost) >= 0);
      String status = billCanBeClosedOut ? "Closeable" : "Not Closeable";
      String payload = "Bill status::" + status;

      socket.convertAndSend(destination, payload);
      System.out.println("SessionService.java: Sent to WebSocket " + destination + ": " + payload);
    }
  }

  public void finalizeSession(Long sessionId) {
    String destination = "/topic/session/" + Long.toString(sessionId);
    String payload = "Bill status::Finished";

    socket.convertAndSend(destination, payload);
    System.out.println("SessionService.java: Sent to WebSocket " + destination + ": " + payload);
  }
}

