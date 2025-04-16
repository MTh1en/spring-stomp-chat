package com.mthien.chat_service.controller;

import java.net.URI;
import java.nio.file.Path;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.mthien.chat_service.service.ConversationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Controller
@RequiredArgsConstructor
@RequestMapping("/conversation")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationController {
    ConversationService conversationService;

    @PostMapping("/{userId1}/{userId2}")
    public ResponseEntity<?> getOrCreateConversation(
            @PathVariable("userId1") String userId1,
            @PathVariable("userId2") String userId2) {
        var body = conversationService.getOrCreateConversation(userId1, userId2);
        return ResponseEntity.ok().body(body);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserConversation(@PathVariable("userId") String userId) {
        var body = conversationService.getUserConversation(userId);
        return ResponseEntity.ok().body(body);
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable("conversationId") String conversationId,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "10", required = false) int size) {
        var body = conversationService.getMessages(conversationId, page, size);
        return ResponseEntity.ok().body(body);
    }
}
