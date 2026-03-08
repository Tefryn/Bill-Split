package com.bill_split.app.worker;

import java.time.Duration;

import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import com.bill_split.app.grpc.ParseReceiptEvent;

import java.time.Instant;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.boot.context.event.ApplicationReadyEvent;

import java.util.Base64;


/**
 * Worker that polls the parse_receipt_event_queue and processes receipt images.
 * Receives ParseReceiptEvent protobuf messages containing uniqueHash and image bytes.
 */
@Component
public class ParseReceiptWorker {
  private static final String PARSE_RECEIPT_EVENT_QUEUE = "parse_receipt_event_queue";
  private final RedisTemplate<String, byte[]> redis;

  public ParseReceiptWorker(RedisTemplate<String, byte[]> redis) {
    this.redis = redis;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void startWorker() {
    new Thread(() -> {
      System.out
          .println("ParseReceiptWorker.java: Receipt Worker started. Listening for parse_receipt_event_queue events");
      while (!Thread.currentThread().isInterrupted()) {
        try {
          byte[] event_bytes = redis.opsForList().leftPop("parse_receipt_event_queue", Duration.ofSeconds(30));

          if (event_bytes != null) {
            System.out.println("ParseReceiptWorker.java: Received event bytes: " + event_bytes);
            processReceipt(event_bytes);
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

  private void processReceipt(byte[] event_bytes) {
    // TODO: Implement OCR logic here
    try {
      // 1. Convert imageBytes to base64
      ParseReceiptEvent event = ParseReceiptEvent.parseFrom(event_bytes);
      String uniqueHash = event.getUniqueHash();
      String mime = event.getMime(); // Might be insufficient
      byte[] fileBytes = event.getImageData().toByteArray();
      byte[] encodedBytes = Base64.getEncoder().encode(fileBytes);

      String instructions = ""; // TODO

      // 2. Call Google Gemini API or other OCR service
    //   Client client = new Client();
    //   GenerateContentResponse response = client.models.generateContent(
    //     "gemini-2.0-flash",
    //     List.of(
    //         Content.fromParts(
    //             Part.fromInlineData(
    //                 Blob.builder()
    //                     .mimeType(mime)
    //                     .data(encodedBytes)
    //                     .build()
    //             ),
    //             Part.fromText(instructions)
    //         )
    //     ),
    //     null
    //   );
    
    // TODO: 3. Parse the response to extract items, tax, tip
    // parseResponse(response.text); 

    // TODO: 4. Send results back via WebSocket using uniqueHash

    } catch (Exception e) {
        System.out.println("Something done shit itself");
    }
    
  }
}

