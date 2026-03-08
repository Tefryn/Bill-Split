package com.bill_split.app.worker;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Optional;

import javax.annotation.PreDestroy;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.bill_split.app.data.Item;
import com.bill_split.app.data.Session;
import com.bill_split.app.data.SessionRepository;
import com.bill_split.app.data.User;

@Service
public class SessionCostWorker {

    private final SessionRepository sessionRepository;
    private final RedisTemplate<String, byte[]> redis;
    private final SimpMessagingTemplate socket;
    private volatile boolean running = true;
    private Thread workerThread;

    public SessionCostWorker(SessionRepository sessionRepository, RedisTemplate<String, byte[]> redis, SimpMessagingTemplate socket) {
        this.sessionRepository = sessionRepository;
        this.redis = redis;
        this.socket = socket;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void startWorker() {
        workerThread = new Thread(() -> {
            System.out
                    .println("SessionCostWorker.java: Session worker started. Listening for session_claim events");
            while (running && !Thread.currentThread().isInterrupted()) {
                try {
                    byte[] buffer = redis.opsForList().leftPop("session_claim", Duration.ofSeconds(30));
                    if (buffer != null) {
                        String event = new String(buffer, StandardCharsets.UTF_8);

                        System.out.println("SessionCostWorker.java: Received event: " + event);
                        recalculateCosts(event);

                    }
                    // if null, just loop and wait again
                } catch (Exception e) {
                    if (!running) {
                        break;
                    }
                    if (e.getMessage() != null && e.getMessage().contains("timed out")) {
                        // ignore timeout, just loop again
                        continue;
                    }
                    System.err.println("Error processing event: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            System.out.println("SessionCostWorker.java: Session worker stopped.");
        });
        workerThread.setDaemon(true);
        workerThread.start();
    }

    @PreDestroy
    public void stopWorker() {
        running = false;
        if (workerThread != null) {
            workerThread.interrupt();
            try {
                workerThread.join(5000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
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

        if (optionalSession.isPresent()) {
            Session session = optionalSession.get();
            Item item = session.getItems().stream().filter(n -> n.getId().equals(itemId)).findFirst().get();

            List<String> claimedBy = item.getClaimedBy();

            for (String email : claimedBy) {
                Optional<User> optionalOtherUser = session.getUsers().stream().filter(n -> n.getEmail().equals(email)).findFirst();
                User claimedUser = optionalOtherUser.get();
                BigDecimal itemTotalCost = item.getCost();

                BigDecimal costUpdate;
                BigDecimal newCost = itemTotalCost.divide(new BigDecimal(claimedBy.size()));
                // calculate cost update
                if (action.equals("claim")) {
                    BigDecimal prevCost = itemTotalCost.divide(new BigDecimal(Math.max(claimedBy.size() - 1, 1)));
                    if (email.equals(userEmail)) {
                        prevCost = BigDecimal.ZERO; // if claiming, the new user had no cost before
                    }
                    costUpdate = newCost.subtract(prevCost);
                    System.out.println("Claiming item. New cost: " + newCost + ", Previous cost: " + prevCost + ", Cost update: " + costUpdate);
                } else {
                    BigDecimal prevCost = itemTotalCost.divide((new BigDecimal(claimedBy.size() + 1)));
                    costUpdate = newCost.subtract(prevCost);
                    System.out.println("Unclaiming item. New cost: " + newCost + ", Previous cost: " + prevCost + ", Cost update: " + costUpdate);
                }

                claimedUser.setTotalCost(claimedUser.getTotalCost().add(costUpdate));

                // send change to frontend
                String destination = "/topic/session/" + sessionId + "/cost_update/" + email;
                String message = claimedUser.getTotalCost().toString();
                socket.convertAndSend(destination, message);
            }

            sessionRepository.save(session);
        }
    }
}
