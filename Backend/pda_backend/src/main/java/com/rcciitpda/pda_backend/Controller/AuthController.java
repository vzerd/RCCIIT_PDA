package com.rcciitpda.pda_backend.Controller;

import com.rcciitpda.pda_backend.Model.Users;
import com.rcciitpda.pda_backend.Service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController{

    AuthService authService;
    @Autowired
    AuthController(AuthService authService){
        this.authService = authService;
    }

    @CrossOrigin(origins = "http://rcciit-pda-webpage.s3-website.ap-south-1.amazonaws.com")
    @PostMapping("/sign_in")
    ResponseEntity<String> signIn(@RequestBody Users user){
        System.out.println("signin");
        return authService.signInService(user);
    }

    @CrossOrigin(origins = "http://rcciit-pda-webpage.s3-website.ap-south-1.amazonaws.com")
    @PostMapping("/sign_out")
    ResponseEntity<String> signOut(@RequestBody Users user){
        return authService.signOutService(user);
    }
}
