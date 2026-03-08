package com.bill_split.app.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.bill_split.app.data.Item;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.RedisTemplate;
import com.bill_split.app.data.Session;
import com.bill_split.app.data.SessionRepository;
import com.bill_split.app.data.User;
import com.google.protobuf.ByteString;
import com.bill_split.app.grpc.ParseReceiptEvent;
import com.bill_split.app.graphql.SessionInput;

@Service
public class SessionService {
  private static final String PARSE_RECEIPT_EVENT_QUEUE = "parse_receipt_event_queue";
  private static final String SESSION_CLAIM_EVENT_QUEUE = "session_claim";

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

      if (!session.getUsers().stream().anyMatch(n -> n.getEmail().equals(userEmail))) { 
        users.add(newUser);
        session.setUsers(users);
        sessionRepository.save(session);
      }

      return true;
    }
    return false;
  }

  public Boolean claimItem(Long sessionId, Long itemId, String userEmail) {
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
        return false;
      }
      Item item = optionalItem.get();

      if ((!item.getShareable() && item.getClaimedBy().isEmpty())|| item.getClaimedBy().contains(userEmail)) {
        return false;
      }

      List<String> claimedBy = item.getClaimedBy();
      claimedBy.add(userEmail);
      item.setClaimedBy(claimedBy);

      for (String email : claimedBy) {
        Optional<User> optionalOtherUser = session.getUsers().stream().filter(n -> n.getEmail().equals(email)).findFirst();
        if (!optionalOtherUser.isPresent()) {
          continue;
        }
        User claimedUser = optionalOtherUser.get();
        BigDecimal itemTotalCost = item.getCost();
        
        BigDecimal newCost= itemTotalCost.divide(new BigDecimal(Math.max(claimedBy.size(),1)));
        BigDecimal prevCost= itemTotalCost.divide(new BigDecimal(Math.max(claimedBy.size()-1,1)));
        if (email.equals(userEmail)) {
            prevCost = BigDecimal.ZERO; // if claiming, the new user had no cost before
        }
        BigDecimal costUpdate = newCost.subtract(prevCost);
        System.out.println("Claiming item. New cost: " + newCost + ", Previous cost: " + prevCost + ", Cost update: " + costUpdate);
        claimedUser.setTotalCost(claimedUser.getTotalCost().add(costUpdate));
      }
      sessionRepository.save(session);

      // update users
      redis.opsForList().rightPush(SESSION_CLAIM_EVENT_QUEUE, (sessionId + "::" + itemId).getBytes());

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
      user.setTotalCost(user.getTotalCost().subtract(item.getSplitCost()));
      claimedBy.remove(userEmail);
      item.setClaimedBy(claimedBy);
      
      for (String email : claimedBy) {
        Optional<User> optionalOtherUser = session.getUsers().stream().filter(n -> n.getEmail().equals(email)).findFirst();
        if (!optionalOtherUser.isPresent()) {
          continue;
        }
        User claimedUser = optionalOtherUser.get();
        BigDecimal itemTotalCost = item.getCost();
        
        BigDecimal newCost= itemTotalCost.divide(new BigDecimal(Math.max(claimedBy.size(),1)));
        BigDecimal prevCost= itemTotalCost.divide((new BigDecimal(claimedBy.size()+1)));  
        BigDecimal costUpdate = newCost.subtract(prevCost);
        System.out.println("Unclaiming item. New cost: " + newCost + ", Previous cost: " + prevCost + ", Cost update: " + costUpdate);
        claimedUser.setTotalCost(claimedUser.getTotalCost().add(costUpdate));
      }
      sessionRepository.save(session);

      // update users
      redis.opsForList().rightPush(SESSION_CLAIM_EVENT_QUEUE, (sessionId + "::" + itemId + "::" + userEmail + "::unclaim").getBytes());

      return true;
    }
    return false;
  }

  public Boolean parseReceipt(MultipartFile file, String uniqueHash) {
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
      ParseReceiptEvent event = ParseReceiptEvent.newBuilder()
          .setUniqueHash(uniqueHash)
          .setImageData(ByteString.copyFrom(imageBytes))
          .setMime(contentType)
          .build();

      // Queue the serialized protobuf for OCR processing
      redis.opsForList().rightPush(PARSE_RECEIPT_EVENT_QUEUE, event.toByteArray());

      System.out.println("Receipt parsing queued: " + file.getOriginalFilename() + " with hash: " + uniqueHash);
      return true;

    } catch (Exception e) {
        System.err.println("Error processing receipt: " + e.getMessage());
        e.printStackTrace();
        return false;
    }
  }

}

