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
      
      if (users.contains(userEmail)) {
        return false;
      }

      users.add(newUser);
      session.setUsers(users);
      sessionRepository.save(session);
      
      return true;
    }
    return false; // Or throw an exception
  }

  public Boolean claimItem(Long sessionId, Long itemId, String userEmail) {
    Optional<Session> optionalSession = sessionRepository.findById(sessionId);
    if (optionalSession.isPresent()) {
      Session session = optionalSession.get();
      Optional<User> optionalUser = session.getUsers().stream().filter(n -> n.getEmail().equals(userEmail)).findFirst();
      Optional<Item> optionalItem = session.getItems().stream().filter(n -> n.getId() == itemId).findFirst();

      if (!optionalUser.isPresent() || !optionalItem.isPresent()) {
        return false;
      }
      User user = optionalUser.get();
      Item item = optionalItem.get();

      if (!item.getShareable() && item.getClaimedBy().size() != 0) {
        return false;
      }

      List<String> claimedBy = item.getClaimedBy();
      claimedBy.add(userEmail);
      item.setClaimedBy(claimedBy);
      user.setTotal_cost(user.getTotal_cost() + item.getCost());
      sessionRepository.save(session);

      return true;
    }
    return false;
  }

    public Boolean unclaimItem(Long sessionId, Long itemId, String userEmail) {
    Optional<Session> optionalSession = sessionRepository.findById(sessionId);
    if (optionalSession.isPresent()) {
      Session session = optionalSession.get();
      Optional<User> optionalUser = session.getUsers().stream().filter(n -> n.getEmail().equals(userEmail)).findFirst();
      Optional<Item> optionalItem = session.getItems().stream().filter(n -> n.getId() == itemId).findFirst();

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
      user.setTotal_cost(user.getTotal_cost() - item.getCost());
      sessionRepository.save(session);

      return true;
    }
    return false;
  }

}
