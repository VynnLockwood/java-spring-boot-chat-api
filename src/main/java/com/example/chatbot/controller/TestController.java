package com.example.chatbot.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/test")
    public String test() {
        return "test reloaded 2";
    }

    @GetMapping("/json")
    public String getJson() {
        int a = 1;  
        int b = 3;
        int c = a + b;
        return "{\"name\": \"Nolan\", \"age\": 25, \"sum\": " + c + "}";
    }

    @GetMapping("/json2")
    public Map<String, Object> getJson2() {
    int a = 1;
    int b = 3;
    int c = a + b;

    Map<String, Object> response = new HashMap<>();
    response.put("name", "Nolan");
    response.put("age", 25);
    response.put("sum", c);

    return response; // Spring จะเปลี่ยน Map นี้เป็น JSON ให้เราเอง สวยงามและปลอดภัย!
}
    
    
    
}
