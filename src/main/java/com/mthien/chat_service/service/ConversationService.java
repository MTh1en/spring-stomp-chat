package com.mthien.chat_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.mthien.chat_service.entity.Conversation;
import com.mthien.chat_service.entity.Message;
import com.mthien.chat_service.repository.ConversationRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationService {
    ConversationRepository conversationRepository;

    public Conversation getOrCreateConversation(String userId1, String userId2) {
        var existingConversation = conversationRepository.findByUserId1AndUserId2(userId1, userId2);
        if (existingConversation.isPresent()) {
            log.info("Founded Conversation between {} and {}", userId1, userId2);
            return existingConversation.get();
        }
        Conversation newConversation = Conversation.builder()
                .userId1(userId1)
                .userId2(userId2)
                .build();
        return conversationRepository.save(newConversation);
    }

    public List<Conversation> getUserConversation(String userId) {
        return conversationRepository.findByUserId1OrUserId2(userId, userId);
    }

    public List<Message> getMessages(String conversationId, int page, int size) {
        var conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        var messages = conversation.getMessages();
        int start = page * size;
        int end = Math.min(start + size, messages.size());
        return messages.subList(start, end);
    }
}
