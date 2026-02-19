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
}
