package com.rcciitpda.pda_backend.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class EasterEggController{
    @GetMapping("api/v1/devs")
    String showDevs(){
        return "devs";
    }
}
