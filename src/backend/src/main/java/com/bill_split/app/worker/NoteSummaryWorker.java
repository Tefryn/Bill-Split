package com.notes.app.worker;

import java.time.Duration;

import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.boot.context.event.ApplicationReadyEvent;

@Component
public class NoteSummaryWorker {
  private final StringRedisTemplate redis;
  private final SimpMessagingTemplate socket;

  public NoteSummaryWorker(StringRedisTemplate redis, SimpMessagingTemplate socket) {
    this.redis = redis;
    this.socket = socket;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void startWorker() {
    new Thread(() -> {
      System.out.println("Summary Worker started. Listening for note_summary_event_queue events");
      while (true) {
        try {
          String event = redis.opsForList().leftPop("note_summary_event_queue", Duration.ofSeconds(30));

          if (event != null) {
            System.out.println("Received event: " + event);
            generateSummary(event);
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

  private void generateSummary(String event) {
    String[] parts = event.split("::", 2);
    String noteId = parts[0];
    String content = parts[1];

    // generate summary (for demo just take first 20 chars)
    String summary = content.length() > 20 ? content.substring(0, 20) + "..." : content;

    // simulating heavy work (you'd add your own summary generation logic here)
    try {
      Thread.sleep(5000);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }

    System.out.println("Generated summary for note " + noteId + ": " + summary);

    // send summary to frontend via websocket
    String destination = "/topic/note-summaries";
    String payload = noteId + "::" + summary;
    socket.convertAndSend(destination, payload);
    System.out.println("Sent to WebSocket " + destination + ": " + payload);

    /**
     * See README for more detailed instructions:
     * 
     * Paste into localhost:8000 dev console to test WebSocket connection:
     * const script = document.createElement('script');
     * script.src =
     * 'https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.0/bundles/stomp.umd.min.js';
     * script.onload = () => {
     * const client = new StompJs.Client({
     * brokerURL: 'ws://localhost:8000/ws',
     * debug: (str) => console.log(str),
     * onConnect: () => {
     * console.log('Connected!');
     * client.subscribe('/topic/note-summaries',
     * (msg) => {
     * console.log('Received:', msg.body);
     * });
     * }
     * });
     * client.activate();
     * window.stompClient = client;
     * };
     * document.head.appendChild(script)
     */
  }
}
