package com.mthien.chat_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mthien.chat_service.service.RoomService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@RequestMapping("/rooms")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomController {
    RoomService roomService;

    // Create a new room
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody String roomId) {
        var body = roomService.createRoom(roomId);
        if (body == null) {
            return ResponseEntity.badRequest().body("Room already exists");
        }
        return ResponseEntity.ok(body);
    }

    // Join a room
    @GetMapping("/{roomId}")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId) {
        var body = roomService.joinRoom(roomId);
        if (body == null) {
            return ResponseEntity.badRequest().body("Room not found");
        }
        return ResponseEntity.ok(body);
    }

    // Get message in a room
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable String roomId,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "10", required = false) int size) {
        var body = roomService.getMessages(roomId, page, size);
        if (body == null) {
            return ResponseEntity.badRequest().body("Room not found");
        }
        return ResponseEntity.ok(body);
    }
}
