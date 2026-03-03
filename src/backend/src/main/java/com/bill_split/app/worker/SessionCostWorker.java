package com.bill_split.app.worker;

import com.bill_split.app.data.Session;
import com.bill_split.app.data.SessionRepository;
import com.bill_split.app.data.User;
import com.bill_split.app.data.UserRepository;
import com.bill_split.app.data.Item;
import com.bill_split.app.data.ItemRepository;
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
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final StringRedisTemplate redis;

    public SessionCostWorker(SessionRepository sessionRepository, StringRedisTemplate redis, UserRepository userRepository, ItemRepository itemRepository) {
        this.sessionRepository = sessionRepository;
        this.redis = redis;
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
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
        // event format: sessionId::itemId::userEmail::action
        // this assumes the action has been applied to the user, only updates other users

        String[] parts = event.split("::");
        Long sessionId = Long.parseLong(parts[0]);
        Long itemId = Long.parseLong(parts[1]);
        String userEmail = parts[2];
        String action = parts[3];

        Optional<Session> optionalSession = sessionRepository.findById(sessionId);
        List<Item> items = itemRepository.findBySessionId(sessionId);
        List<User> users = userRepository.findBySessionId(sessionId);

        if (optionalSession.isPresent()) {
            Session session = optionalSession.get();
            Item item = items.stream().filter(n -> n.getId().equals(itemId)).findFirst().get();

            List<String> claimedBy = item.getClaimedBy();
            if (action.equals("claim")) {
                for (String email : claimedBy) {
                    if (email.equals(userEmail)) {
                        continue;
                    }
                    Optional<User> optionalOtherUser = users.stream().filter(n -> n.getEmail().equals(email)).findFirst();
                    User claimedUser = optionalOtherUser.get();
                    Long itemTotalCost = item.getCost();
                    Long costUpdate = (itemTotalCost / claimedBy.size()) - (itemTotalCost / (claimedBy.size()-1));
                    claimedUser.setTotalCost(claimedUser.getTotalCost() + costUpdate);
                }
            }
            else if (action.equals("unclaim")) {
                for (String email : claimedBy) {
                    if (email.equals(userEmail)) {
                        continue;
                    }
                    Optional<User> optionalOtherUser = users.stream().filter(n -> n.getEmail().equals(email)).findFirst();
                    User claimedUser = optionalOtherUser.get();
                    Long itemTotalCost = item.getCost();
                    Long costUpdate = (itemTotalCost / claimedBy.size()) - (itemTotalCost / (claimedBy.size()+1));
                    claimedUser.setTotalCost(claimedUser.getTotalCost() + costUpdate);
                }
            }
            userRepository.saveAll(users);
        }
    }
}