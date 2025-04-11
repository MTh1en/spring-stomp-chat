package com.mthien.chat_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
public class HomeController {

    @GetMapping("/group-chat")
    public ModelAndView group() {
        return new ModelAndView("group-chat");
    }

    @GetMapping("/room-chat")
    public ModelAndView room() {
        return new ModelAndView("room-chat");
    }

    @GetMapping("/home")
    public String honme() {
        return "home";
    }
}
