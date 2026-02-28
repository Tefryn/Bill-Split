package com.bill_split.app.service;


import com.bill_split.app.data.Session;
import com.bill_split.app.graphql.SessionInput;
import com.bill_split.app.data.Item;
import com.bill_split.app.data.SessionRepository;
import com.bill_split.app.data.User;
import java.util.Arrays;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SessionService {
  // private static final String NOTE_SUMMARY_EVENT_QUEUE = "note_summary_event_queue";

  private final SessionRepository sessionRepository;
  private final StringRedisTemplate redis;

  public SessionService(SessionRepository sessionRepository, StringRedisTemplate redis) {
    this.sessionRepository = sessionRepository;
    this.redis = redis;
  }

  public Optional<Session> getSessionById(Long sessionId) {
    return sessionRepository.findById(sessionId);
  }

  public Session createSession(SessionInput input) {
    System.out.print("Creating session with name: " + input.getItems());
    Session session = sessionRepository.save(new Session(input));

    // String event = session.getId() + "::" + content;
    // redis.opsForList().rightPush(SESSION_SUMMARY_EVENT_QUEUE, event); For OCR

    // System.out.println(" queued summary job for note: " + note.getId());

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
      
      return true;
    }
    return false; // Or throw an exception
  }

  public Long claimItem(Long sessionId, Long itemId, String userEmail) {
    System.out.println("claimItem called: sessionId=" + sessionId + ", itemId=" + itemId + ", userEmail=" + userEmail);
    Optional<Session> optionalSession = sessionRepository.findById(sessionId);
    if (optionalSession.isPresent()) {
      Session session = optionalSession.get();
      System.out.println("Session found. Users count: " + session.getUsers().size() + ", Items count: " + session.getItems().size());
      Optional<User> optionalUser = session.getUsers().stream().filter(n -> n.getEmail().equals(userEmail)).findFirst();
      Optional<Item> optionalItem = session.getItems().stream().filter(n -> n.getId().equals(itemId)).findFirst();

      System.out.println("User present: " + optionalUser.isPresent() + ", Item present: " + optionalItem.isPresent());
      if (!optionalUser.isPresent() || !optionalItem.isPresent()) {
        return -1L;
      }
      User user = optionalUser.get();
      Item item = optionalItem.get();

      if (!item.getShareable() && item.getClaimedBy().size() != 0 || item.getClaimedBy().contains(userEmail)) {
        return -1L;
      }

      List<String> claimedBy = item.getClaimedBy();

      // put in redis job to update backend costs for everyone here
      redis.opsForList().rightPush("session_claim", sessionId + "::" + itemId + "::" + userEmail + "::claim");

      for (String email : claimedBy) {
        Optional<User> optionalOtherUser = session.getUsers().stream().filter(n -> n.getEmail().equals(email)).findFirst();
        User claimedUser = optionalOtherUser.get();
        Long itemTotalCost = item.getTotalCost();
        Long costUpdate = (itemTotalCost / (claimedBy.size() + 1)) - (itemTotalCost / claimedBy.size());
        claimedUser.setTotalCost(claimedUser.getTotalCost() + costUpdate);
      }

      claimedBy.add(userEmail);
      item.setClaimedBy(claimedBy);
      user.setTotalCost(user.getTotalCost() + item.getCost());
      sessionRepository.save(session);

      return user.getTotalCost();
    }
    System.out.println("Session not found with id: " + sessionId);
    return -1L;
  }

    public Long unclaimItem(Long sessionId, Long itemId, String userEmail) {
    Optional<Session> optionalSession = sessionRepository.findById(sessionId);
    if (optionalSession.isPresent()) {
      Session session = optionalSession.get();
      Optional<User> optionalUser = session.getUsers().stream().filter(n -> n.getEmail().equals(userEmail)).findFirst();
      Optional<Item> optionalItem = session.getItems().stream().filter(n -> n.getId().equals(itemId)).findFirst();

      if (!optionalUser.isPresent() || !optionalItem.isPresent()) {
        return -1L;
      }
      User user = optionalUser.get();
      Item item = optionalItem.get();

      if (!item.getClaimedBy().contains(userEmail)) {
        return -1L;
      }

      user.setTotalCost(user.getTotalCost() - item.getCost());
      List<String> claimedBy = item.getClaimedBy();

      // put in redis job to update backend costs for everyone here
      redis.opsForList().rightPush("session_claim", sessionId + "::" + itemId + "::" + userEmail + "::unclaim");

      for (String email : claimedBy) {
        Optional<User> optionalOtherUser = session.getUsers().stream().filter(n -> n.getEmail().equals(email)).findFirst();
        User claimedUser = optionalOtherUser.get();
        Long itemTotalCost = item.getTotalCost();
        Long costUpdate = (itemTotalCost / (claimedBy.size() - 1)) - (itemTotalCost / claimedBy.size());
        claimedUser.setTotalCost(claimedUser.getTotalCost() + costUpdate);
      }

      claimedBy.remove(userEmail);
      item.setClaimedBy(claimedBy);
      sessionRepository.save(session);

      return user.getTotalCost();
    }
    return -1L;
  }

}
