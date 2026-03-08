package com.bill_split.app.worker;

import java.time.Duration;
import java.util.Base64;
import java.util.Map;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;


import com.bill_split.app.grpc.ParseReceiptEvent;
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
                                            "shareable", Schema.builder().type(Type.Known.BOOLEAN).build()))
                                    .required("name", "price", "shareable")
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
            String base64Image = Base64.getEncoder().encodeToString(fileBytes);
            byte[] encodedBytes = Base64.getEncoder().encode(fileBytes);

            // ENFORCE Gemini structure: Build Gemini request
            // (Assume Gemini client and model setup externally)
            String instructions = "Extract all items and tax from this receipt image. Return as JSON: {items:[{name,price,shareable}],tax}. All values must be strings except 'shareable'. 'shareable' should be boolean.";

            // Example Gemini request structure
            // Replace with actual Gemini client code
            // --- BEGIN GEMINI STRUCTURE ---
            // GeminiClient client = new GeminiClient();
            // GeminiRequest request = GeminiRequest.builder()
            //     .model("gemini-2.0-flash")
            //     .addPart(GeminiPart.inlineData()
            //         .mimeType(mime)
            //         .data(base64Image))
            //     .addPart(GeminiPart.text(instructions))
            //     .build();
            // GeminiResponse response = client.generateContent(request);
            // --- END GEMINI STRUCTURE ---

            // TODO: Parse Gemini response to extract items, tax, tip
            // parseResponse(geminiResponse);
            // Instantiate Gemini client (uses GOOGLE_API_KEY env variable)
            Client client = new Client();
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
            // TODO: Send results back via WebSocket using uniqueHash
            // sendResults(uniqueHash, geminiResponse);

        } catch (Exception e) {
            System.err.println("Error in Gemini OCR processing: " + e.getMessage());
        }
    }
}
