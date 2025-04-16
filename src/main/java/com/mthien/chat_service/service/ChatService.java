package com.mthien.chat_service.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.mthien.chat_service.entity.Message;
import com.mthien.chat_service.entity.Room;
import com.mthien.chat_service.payload.MessageRequest;
import com.mthien.chat_service.repository.ConversationRepository;
import com.mthien.chat_service.repository.RoomRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChatService {
    RoomRepository roomRepository; // Repository for Room entity
    ConversationRepository conversationRepository;


    public Message sendMessage(String roomId, MessageRequest request) {
        // Check if the room already exist
        Room existingRoom = roomRepository.findByRoomId(roomId);
        if (existingRoom == null) {
            log.info("Room with ID {} not found", roomId);
            return null; // Return null if the room is not found
        }
        Message message = Message.builder()
                .sender(request.getSender())
                .content(request.getContent())
                .timeStamp(LocalDateTime.now())
                .build();
        existingRoom.getMessages().add(message);
        roomRepository.save(existingRoom); // Save the updated room with the new message
        return message; // Return the message
    }

    public Message sendPrivateMessagge(String conversationId, MessageRequest request) {
        var existingConversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!request.getSender().equals(existingConversation.getUserId1())
                && (!request.getSender().equals(existingConversation.getUserId2()))) {
            throw new RuntimeException("You are not in this conversation");
        }
        Message message = Message.builder()
                .sender(request.getSender())
                .content(request.getContent())
                .timeStamp(LocalDateTime.now())
                .fileUrl(request.getFileUrl())
                .build();
        existingConversation.getMessages().add(message);
        conversationRepository.save(existingConversation);
        return message;
    }
}
