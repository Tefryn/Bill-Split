package com.bill_split.app.service;

import com.bill_split.app.data.Session;
import com.bill_split.app.graphql.SessionInput;
import com.bill_split.app.data.Item;
import com.bill_split.app.data.SessionRepository;
import com.bill_split.app.data.User;
import com.bill_split.app.grpc.ParseReceiptEvent;
import com.google.protobuf.ByteString;
import java.util.Arrays;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class SessionService {
  private static final String PARSE_RECEIPT_EVENT_QUEUE = "parse_receipt_event_queue";

  private final SessionRepository sessionRepository;
  private final RedisTemplate<String, byte[]> redis;

  public SessionService(SessionRepository sessionRepository, RedisTemplate<String, byte[]> redis) {
    this.sessionRepository = sessionRepository;
    this.redis = redis;
  }

  public Optional<Session> getSessionById(Long sessionId) {
    return sessionRepository.findById(sessionId);
  }

  public Session createSession(SessionInput input) {
    System.out.print("Creating session with name: " + input.getItems());
    Session session = sessionRepository.save(new Session(input));

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
      System.out.println(
          "Session found. Users count: " + session.getUsers().size() + ", Items count: " + session.getItems().size());
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
      claimedBy.add(userEmail);
      item.setClaimedBy(claimedBy);
      user.setTotalCost(user.getTotalCost() + item.getCost());
      sessionRepository.save(session);
      System.out.println("Claimed by list: " + item.getClaimedBy());

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

      List<String> claimedBy = item.getClaimedBy();
      claimedBy.remove(userEmail);
      item.setClaimedBy(claimedBy);
      user.setTotalCost(user.getTotalCost() - item.getCost());
      sessionRepository.save(session);

      return user.getTotalCost();
    }
    return -1L;
  }

  public Boolean parseReceipt(MultipartFile file, String returnHash) {
    try {
      // Validate file
      if (file == null || file.isEmpty()) {
        System.out.println("Empty file");
        return false;
      }

      // Validate it's an image
      String contentType = file.getContentType();
      if (contentType == null || !contentType.startsWith("image/")) {
        System.out.println("Not an image: " + contentType);
        return false;
      }

      // Get file bytes and create protobuf event
      byte[] imageBytes = file.getBytes();
      String mime = file.getContentType();
      ParseReceiptEvent event = ParseReceiptEvent.newBuilder()
          .setUniqueHash(returnHash)
          .setImageData(ByteString.copyFrom(imageBytes))
          .setMime(mime)
          .build();

      // Queue the serialized protobuf for OCR processing
      redis.opsForList().rightPush(PARSE_RECEIPT_EVENT_QUEUE, event.toByteArray());

      System.out.println("Receipt parsing queued: " + file.getOriginalFilename() + "with hash: " + returnHash);
      return true;

    } catch (Exception e) {
        System.err.println("Error processing receipt: " + e.getMessage());
        e.printStackTrace();
        return false;
    }
  }

}
