package com.bill_split.app.worker;

import java.time.Duration;
import java.util.Map;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.bill_split.app.grpc.ParseReceiptEvent;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.google.genai.types.Schema;
import com.google.genai.types.Type;

/**
 * Worker that polls the parse_receipt_event_queue and processes receipt images.
 * Receives ParseReceiptEvent protobuf messages containing uniqueHash and image
 * bytes.
 */
@Component
public class ParseReceiptWorker {

    private static final String PARSE_RECEIPT_EVENT_QUEUE = "parse_receipt_event_queue";
    private final RedisTemplate<String, byte[]> redis;
    private final SimpMessagingTemplate messagingTemplate;
    private final String googleApiKey;

    public ParseReceiptWorker(RedisTemplate<String, byte[]> redis,
                              SimpMessagingTemplate messagingTemplate,
                              @org.springframework.beans.factory.annotation.Value("${GOOGLE_API_KEY}") String googleApiKey) {
        this.redis = redis;
        this.messagingTemplate = messagingTemplate;
        this.googleApiKey = googleApiKey;
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
                }
            }
        }).start();
    }

    // Structured output: define JSON schema for receipt
    Schema schema = Schema.builder()
            .type(Type.Known.OBJECT)
            .properties(Map.of(
                    "items", Schema.builder()
                            .type(Type.Known.ARRAY)
                            .items(Schema.builder()
                                    .type(Type.Known.OBJECT)
                                    .properties(Map.of(
                                            "name", Schema.builder().type(Type.Known.STRING).build(),
                                            "price", Schema.builder().type(Type.Known.STRING).build(),
                                            "count", Schema.builder().type(Type.Known.INTEGER).build()))
                                    .required("name", "price", "count")
                                    .build())
                            .build(),
                    "tax", Schema.builder().type(Type.Known.STRING).build()))
            .required("items", "tax")
            .build();

    private void processReceipt(byte[] event_bytes) {
        // Gemini API OCR logic using Google GenAI SDK
        try {
            // 1. Convert imageBytes to base64
            ParseReceiptEvent event = ParseReceiptEvent.parseFrom(event_bytes);
            String uniqueHash = event.getUniqueHash();
            String mime = event.getMime();
            byte[] fileBytes = event.getImageData().toByteArray();
            
            // ENFORCE Gemini structure: Build Gemini request
            // (Assume Gemini client and model setup externally)
            String instructions = "Extract all items and tax from this receipt image. Return as JSON: {items:[{name,price,count}],tax}. 'price' and 'tax' must be numeric strings with only digits and decimals (no currency symbols or other characters). 'count' is an integer for the quantity of that item.";

            // TODO: Parse Gemini response to extract items, tax, tip
            // parseResponse(geminiResponse);
            // Instantiate Gemini client with API key from Spring properties
            Client client = Client.builder().apiKey(googleApiKey).build();
            Content content = Content.fromParts(
                Part.fromBytes(fileBytes, mime),
                Part.fromText(instructions)
            );

            GenerateContentConfig config = GenerateContentConfig.builder()
                .responseMimeType("application/json")
                .candidateCount(1)
                .responseSchema(schema)
                .build();

            GenerateContentResponse response = client.models.generateContent(
                "gemini-2.5-flash",
                content,
                config
            );

            String geminiResponse = response.text();
            System.out.println("ParseReceiptWorker.java: Gemini parsed receipt for hash " + uniqueHash + ": " + geminiResponse);

            // Expand items with count > 1 into separate entries
            String expandedResponse = expandItemsByCount(geminiResponse);
            System.out.println("ParseReceiptWorker.java: Expanded response: " + expandedResponse);
            sendResults(uniqueHash, expandedResponse);

        } catch (Exception e) {
            System.err.println("Error in Gemini OCR processing: " + e.getMessage());
        }
    }

    private void sendResults(String uniqueHash, String geminiResponse) {
        messagingTemplate.convertAndSend("/topic/receipt/" + uniqueHash, geminiResponse);
        System.out.println("ParseReceiptWorker.java: Sent OCR results via WebSocket for hash: " + uniqueHash);
    }

    private String expandItemsByCount(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            ArrayNode originalItems = (ArrayNode) root.get("items");
            ArrayNode expandedItems = mapper.createArrayNode();

            for (JsonNode item : originalItems) {
                int count = item.has("count") ? item.get("count").asInt(1) : 1;
                double totalPrice = Double.parseDouble(item.get("price").asText());
                double perItemPrice = totalPrice / count;
                String priceStr = String.format("%.2f", perItemPrice);

                for (int i = 0; i < count; i++) {
                    ObjectNode singleItem = mapper.createObjectNode();
                    singleItem.put("name", item.get("name").asText());
                    singleItem.put("price", priceStr);
                    expandedItems.add(singleItem);
                }
            }

            ((ObjectNode) root).set("items", expandedItems);
            return mapper.writeValueAsString(root);
        } catch (Exception e) {
            System.err.println("Error expanding items by count: " + e.getMessage());
            return json; // return original if expansion fails
        }
    }
}
