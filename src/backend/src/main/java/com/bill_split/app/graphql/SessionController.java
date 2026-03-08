package com.bill_split.app.graphql;

import com.bill_split.app.data.Session;
import com.bill_split.app.service.SessionService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;

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
    public Boolean leaveSession(@Argument Long sessionId, @Argument String userEmail) {
        return sessionService.leaveSession(sessionId, userEmail);
    }

    @MutationMapping
    public Boolean unclaimItem(@Argument Long sessionId, @Argument Long itemId, @Argument String userEmail) {
        return sessionService.unclaimItem(sessionId, itemId, userEmail);
    }

    @MutationMapping
    public Boolean claimItem(@Argument Long sessionId, @Argument Long itemId, @Argument String userEmail) {
        return sessionService.claimItem(sessionId, itemId, userEmail);
    }

    @MutationMapping
    public Boolean parseReceipt(@Argument MultipartFile file, @Argument String uniqueHash) {
        return sessionService.parseReceipt(file, uniqueHash);
    }

    @MutationMapping
    public void finalizeSession(@Argument Long sessionId) {
        sessionService.finalizeSession(sessionId);
    }
}
