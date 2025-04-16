package com.mthien.chat_service.service;

import java.io.IOException;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.mthien.chat_service.entity.FileManagement;
import com.mthien.chat_service.payload.FileData;
import com.mthien.chat_service.payload.FileResponse;
import com.mthien.chat_service.repository.FileManagementRepository;
import com.mthien.chat_service.repository.FileRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileService {
    FileRepository fileRepository;
    FileManagementRepository fileManagementRepository;

    public FileResponse upload(MultipartFile file) throws IOException {
        var fileInfo = fileRepository.storge(file);
        var fileManagement = FileManagement.builder()
                .id(fileInfo.getName())
                .ownerId(null)
                .contentType(fileInfo.getContentType())
                .size(file.getSize())
                .md5CheckSum(fileInfo.getMd5CheckSum())
                .path(fileInfo.getPath())
                .url(fileInfo.getUrl())
                .build();
        fileManagementRepository.save(fileManagement);
        return FileResponse.builder()
                .originalFileName(file.getOriginalFilename())
                .url(fileInfo.getUrl())
                .build();
    }

    public FileData download(String fileName) throws IOException {
        var fileManagement = fileManagementRepository.findById(fileName).orElseThrow();
        var resource = fileRepository.read(fileManagement);
        return new FileData(fileManagement.getContentType(), resource);
    }
}
