package com.bill_split.app.service;


import java.util.List;
import java.util.Optional;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.bill_split.app.data.Item;
import com.bill_split.app.data.Session;
import com.bill_split.app.data.SessionRepository;
import com.bill_split.app.data.User;
import com.bill_split.app.graphql.SessionInput;

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
        System.out.println("1");
        return -1L;
      }
      User user = optionalUser.get();
      Item item = optionalItem.get();

      if (!item.getShareable() && !item.getClaimedBy().isEmpty() || item.getClaimedBy().contains(userEmail)) {
        System.out.println("2");
        return -1L;
      }

      List<String> claimedBy = item.getClaimedBy();

      claimedBy.add(userEmail);
      item.setClaimedBy(claimedBy);
      sessionRepository.save(session);

      // update rest of users
      redis.opsForList().rightPush("session_claim", sessionId + "::" + itemId + "::" + userEmail + "::claim");

      return user.getTotalCost(); //ENSURE return boolean
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

      List<String> claimedBy = item.getClaimedBy();
      user.setTotalCost(user.getTotalCost() - item.getSplitCost());
      claimedBy.remove(userEmail);
      item.setClaimedBy(claimedBy);
      sessionRepository.save(session);

      // update rest of users
      redis.opsForList().rightPush("session_claim", sessionId + "::" + itemId + "::" + userEmail + "::unclaim");

      return user.getTotalCost(); //ENSURE return boolean
    }
    return -1L;
  }

}
