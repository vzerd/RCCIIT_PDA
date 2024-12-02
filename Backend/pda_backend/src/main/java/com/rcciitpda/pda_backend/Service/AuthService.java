package com.rcciitpda.pda_backend.Service;

import com.rcciitpda.pda_backend.Model.Users;
import com.rcciitpda.pda_backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService{

    UserRepository userRepository;
    @Autowired
    AuthService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @Transactional
    public ResponseEntity<String> signInService(Users user){

        if(user.getPassword() == null || user.getPassword().isBlank()){
            return new ResponseEntity<>(HttpStatus.valueOf(406));
        }
        if(user.getName() == null || user.getName().isBlank()){
            return new ResponseEntity<>(HttpStatus.valueOf(406));
        }
        try{
            String password = userRepository.getPasswordByName(user.getName());
            if(user.getPassword().equals(password)){
                UUID newToken = generateNewToken();
                int rowsAffected = userRepository.updateTokenByName(
                        newToken.toString(), user.getName());
                if(rowsAffected == 1){
                    return new ResponseEntity<>("{\"token\":\"" + newToken + "\","
                            + "\"username\":\"" + user.getName() + "\"}",
                            HttpStatus.valueOf(200));
                }
                return new ResponseEntity<>(HttpStatus.valueOf(500));
            }
            return new ResponseEntity<>(HttpStatus.valueOf(404));
        }catch(DataAccessException e){
            return new ResponseEntity<>(HttpStatus.valueOf(500));
        }
    }

    @Transactional
    public ResponseEntity<String> signOutService(Users user){

        if(user.getToken() == null || user.getToken().isBlank()){
            return new ResponseEntity<>(HttpStatus.valueOf(406));
        }
        try{
            int rowsAffected = userRepository.updateTokenToNull(user.getToken());
            if(rowsAffected == 1){
                return new ResponseEntity<>(HttpStatus.valueOf(200));
            }
            return new ResponseEntity<>(HttpStatus.valueOf(404));
        }catch(DataAccessException e){
            return new ResponseEntity<>(HttpStatus.valueOf(500));
        }
    }

    private UUID generateNewToken(){
        UUID token = UUID.randomUUID();
        List<String> tokens = userRepository.getAllTokens();
        for(int i = 0; i < tokens.size(); i++){
            if(tokens.get(i) != null && token.toString().equals(tokens.get(i))){
                token = UUID.randomUUID();
                i = 0;
            }
        }
        return token;
    }
}
