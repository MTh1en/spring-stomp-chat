package com.mthien.chat_service.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.mthien.chat_service.entity.FileManagement;

public interface FileManagementRepository extends MongoRepository<FileManagement, String> {

}
