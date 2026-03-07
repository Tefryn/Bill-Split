package com.bill_split.app.graphql;

import com.bill_split.app.data.Item;
import com.bill_split.app.data.Session;
import com.bill_split.app.service.SessionService;
import com.bill_split.app.graphql.SessionInput;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @QueryMapping
    public Session fetchSession(@Argument Long sessionId) {
        return sessionService.getSessionById(sessionId).orElse(null);
    }

    @MutationMapping
    public Session createSession(@Argument SessionInput input) {
        return sessionService.createSession(input);
    }

    @MutationMapping
    public Boolean joinSession(@Argument Long sessionId, @Argument String userEmail) {
        return sessionService.joinSession(sessionId, userEmail);
    }

    @MutationMapping
    public Long unclaimItem(@Argument Long sessionId, @Argument Long itemId, @Argument String userEmail) {
        return sessionService.unclaimItem(sessionId, itemId, userEmail);
    }

    @MutationMapping
    public Long claimItem(@Argument Long sessionId, @Argument Long itemId, @Argument String userEmail) {
        return sessionService.claimItem(sessionId, itemId, userEmail);
    }

    @MutationMapping
    public Boolean parseReceipt(@Argument MultipartFile file, @Argument String uniqueHash) {
        try {
            // Validate file
            if (file == null || file.isEmpty()) {
                return new ReceiptParseResult(false, "No file provided", uniqueHash);
            }

            // Validate it's an image
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return new ReceiptParseResult(false, "File must be an image", uniqueHash);
            }

            // Get file bytes and queue for OCR processing
            byte[] imageBytes = file.getBytes();
            sessionService.queueImageForOCR(imageBytes);

            System.out.println("Receipt uploaded via GraphQL: " + file.getOriginalFilename() + 
                             " (" + imageBytes.length + " bytes)");

            return true;

        } catch (Exception e) {
            System.err.println("Error processing receipt: " + e.getMessage());
            e.printStackTrace();
            return new ReceiptParseResult(false, "Failed to process file: " + e.getMessage(), uniqueHash);
        }
    }
}
