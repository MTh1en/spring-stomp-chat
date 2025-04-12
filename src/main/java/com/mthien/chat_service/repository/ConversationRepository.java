package com.mthien.chat_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.mthien.chat_service.entity.Conversation;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {
    Optional<Conversation> findByUserId1AndUserId2(String userId1, String userId2);

    List<Conversation> findByUserId1(String userId1);
}
