package com.rcciitpda.pda_backend.Controller;

import com.rcciitpda.pda_backend.Model.Users;
import com.rcciitpda.pda_backend.Service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping("/api/v1/auth")
public class AuthController{

    AuthService authService;
    @Autowired
    AuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("/sign_in")
    ResponseEntity<String> signIn(@RequestBody Users user){
        return authService.signInService(user);
    }

    @PostMapping("/sign_out")
    ResponseEntity<String> signOut(@RequestBody Users user){
        return authService.signOutService(user);
    }
}
