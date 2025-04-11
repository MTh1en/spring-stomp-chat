package com.mthien.chat_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.mthien.chat_service.entity.Message;
import com.mthien.chat_service.entity.Room;
import com.mthien.chat_service.repository.RoomRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoomService {
    RoomRepository roomRepository; // Repository for Room entity

    public Room createRoom(String roomId) {
        // Check if the room already exist
        Room existingRoom = roomRepository.findByRoomId(roomId);
        if (existingRoom != null) {
            log.info("Room with ID {} already exists", roomId);
            return null; // Return the existing room if found
        }
        Room room = Room.builder().roomId(roomId).build();
        return roomRepository.save(room);
    }

    public Room joinRoom(String roomId) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            log.info("Room with ID {} not found", roomId);
            return null; // Return null if the room is not found
        }
        return room; // Return the room if found
    }

    public List<Message> getMessages(String roomId, int page, int size) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            log.info("Room with ID {} not found", roomId);
            return null; // Return null if the room is not found
        }
        // Implement pagination logic here
        return room.getMessages().subList(page * size, Math.min((page + 1) * size, room.getMessages().size()));
    }
}
