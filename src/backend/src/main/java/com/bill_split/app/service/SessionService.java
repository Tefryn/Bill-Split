package com.bill_split.app.service;

import com.bill_split.app.data.Item;
import com.bill_split.app.data.ItemRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SessionService {
  // private static final String NOTE_SUMMARY_EVENT_QUEUE = "note_summary_event_queue";

  private final SessionRepository sessionRepository;
  private final StringRedisTemplate redis;

  public SessionService(SessionRepository sessionRepository, StringRedisTemplate redis) {
    this.sessionRepository = sessionRepository;
    this.redis = redis;
  }

  public Optional<Note> getSessionById(Long sessionId) {
    return sessionRepository.findById(sessionId);
  }

  public Session createSession(String content, String color) {
    Session session = sessionRepository.save(new Note(content, color));

    // String event = session.getId() + "::" + content;
    // redis.opsForList().rightPush(SESSION_SUMMARY_EVENT_QUEUE, event); For OCR

    // System.out.println(" queued summary job for note: " + note.getId());

    return session;
  }
}
