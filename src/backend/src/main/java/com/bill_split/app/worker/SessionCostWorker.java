package com.bill_split.app.worker;

import com.bill_split.app.data.Session;
import com.bill_split.app.data.SessionRepository;
import com.bill_split.app.data.User;
import com.bill_split.app.data.Item;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Service
public class SessionCostWorker {

    private final SessionRepository sessionRepository;
    private final StringRedisTemplate redis;

    public SessionCostWorker(SessionRepository sessionRepository, StringRedisTemplate redis) {
        this.sessionRepository = sessionRepository;
        this.redis = redis;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void startWorker() {
        new Thread(() -> {
        System.out
            .println("SessionCostWorker.java: Session worker started. Listening for session_claim events");
        while (true) {
            try {
            String event = redis.opsForList().leftPop("session_claim", Duration.ofSeconds(30));

            if (event != null) {
                System.out.println("SessionCostWorker.java: Received event: " + event);
                recalculateCosts(event);
            }
            // if null, just loop and wait again
            } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("timed out")) {
                // ignore timeout, just loop again
                continue;
            }
            System.err.println("Error processing event: " + e.getMessage());
            e.printStackTrace();
            }
        }
        }).start();
    }

    private void recalculateCosts(String event) {
        System.out.println("SessionCostWorker.java: Recalculating costs for event: " + event);
        String[] parts = event.split("::");
        Long sessionId = Long.parseLong(parts[0]);
        Long itemId = Long.parseLong(parts[1]);
        String userEmail = parts[2];
        String action = parts[3];

        Optional<Session> optionalSession = sessionRepository.findById(sessionId);
        if (optionalSession.isPresent()) {
            Session session = optionalSession.get();
            Item item = session.getItems().stream().filter(n -> n.getId().equals(itemId)).findFirst().get();

            List<String> claimedBy = item.getClaimedBy();
            if (action.equals("claim")) {
                for (String email : claimedBy) {
                    Optional<User> optionalOtherUser = session.getUsers().stream().filter(n -> n.getEmail().equals(email)).findFirst();
                    User claimedUser = optionalOtherUser.get();
                    Long itemTotalCost = item.getTotalCost();
                    Long costUpdate = (itemTotalCost / (claimedBy.size() + 1)) - (itemTotalCost / claimedBy.size());
                    claimedUser.setTotalCost(claimedUser.getTotalCost() + costUpdate);
                }
            } 
            else if (action.equals("unclaim")) {
                for (String email : claimedBy) {
                    if (email.equals(userEmail)) {
                        continue;
                    }
                    Optional<User> optionalOtherUser = session.getUsers().stream().filter(n -> n.getEmail().equals(email)).findFirst();
                    User claimedUser = optionalOtherUser.get();
                    Long itemTotalCost = item.getTotalCost();
                    Long costUpdate = (itemTotalCost / (claimedBy.size() - 1)) - (itemTotalCost / claimedBy.size());
                    claimedUser.setTotalCost(claimedUser.getTotalCost() + costUpdate);
                }
            }
            sessionRepository.save(session);
        }
    }
}