package com.mthien.chat_service.config;

import java.time.LocalDateTime;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.mthien.chat_service.payload.MessageRequest;
import com.mthien.chat_service.payload.MessageType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messageTemplate;

    @EventListener
    public void handlWebSocketDisconnectListenner(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");
        if (username != null) {
            log.info("User disconnected: {}", username);
            log.info("Room {}", roomId);
            var chatMessage = MessageRequest.builder()
                    .type(MessageType.LEAVE)
                    .sender(username)
                    .messageTime(LocalDateTime.now())
                    .build();
           
            if (!roomId.isEmpty()) {
                messageTemplate.convertAndSend(String.format("/topic/room/%s", roomId), chatMessage);
                log.info("Sending message to /topic/room/{}", roomId);
            } else {
                messageTemplate.convertAndSend("/topic/public", chatMessage);
            }
        }
    }
}
