package com.mthien.chat_service.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import com.mthien.chat_service.entity.Message;
import com.mthien.chat_service.payload.MessageRequest;
import com.mthien.chat_service.service.ChatService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatController {
    ChatService chatService;

    @MessageMapping("/chat/private/{conversationId}")
    @SendTo("/topic/private/{conversationId}")
    public Message sendPrivateMessage(@DestinationVariable String conversationId, @Payload MessageRequest request) {
        return chatService.sendPrivateMessagge(conversationId, request);
    }

    @MessageMapping("/chat/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage(
            @DestinationVariable String roomId,
            @Payload MessageRequest request) {
        var response = chatService.sendMessage(roomId, request);
        if (response == null) {
            throw new RuntimeException("Room not found"); // Handle the case where the
        }
        return response; // Return the message
    }

    @MessageMapping("/chat/addUserRoom/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public MessageRequest addUserRoom(
            @DestinationVariable String roomId,
            @Payload MessageRequest messageRequest,
            SimpMessageHeaderAccessor headerAccessor) {
        // Add username in websocket session
        headerAccessor.getSessionAttributes().put("username", messageRequest.getSender());
        headerAccessor.getSessionAttributes().put("roomId", roomId);
        return messageRequest;
    }

    @MessageMapping("/chat/sendMessage")
    @SendTo("/topic/public")
    public MessageRequest sendGroupMessage(@Payload MessageRequest chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat/addUserGroup")
    @SendTo("/topic/public")
    public MessageRequest addUserGroup(
            @Payload MessageRequest chatMessage,
            SimpMessageHeaderAccessor headerAccessor) {
        // Add username in websocket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        return chatMessage;
    }
}
