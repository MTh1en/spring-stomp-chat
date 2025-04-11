package com.mthien.chat_service.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.mthien.chat_service.entity.Message;
import com.mthien.chat_service.entity.Room;
import com.mthien.chat_service.payload.MessageRequest;
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
}
