package com.mthien.chat_service.payload;

import org.springframework.core.io.Resource;

public record FileData(String contentType, Resource resource) {

}
