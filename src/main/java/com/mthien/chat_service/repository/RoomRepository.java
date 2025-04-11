package com.mthien.chat_service.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.mthien.chat_service.entity.Room;

public interface RoomRepository extends MongoRepository<Room, String> {
    Room findByRoomId(String roomId); // Find a room by its roomId
}
