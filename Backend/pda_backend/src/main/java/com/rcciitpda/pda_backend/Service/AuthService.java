package com.rcciitpda.pda_backend.Service;

import com.rcciitpda.pda_backend.Model.Users;
import com.rcciitpda.pda_backend.Repository.UserRepository;
import org.pmw.tinylog.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
        Logger.info("sign-in | attempt | " + user.getName());
        if(user.getPassword() == null || user.getPassword().isBlank()){
            Logger.error("\tfailed | parameter error -> password");
            return new ResponseEntity<>(HttpStatus.valueOf(406));
        }
        if(user.getName() == null || user.getName().isBlank()){
            Logger.error("\tfailed | parameter error -> username");
            return new ResponseEntity<>(HttpStatus.valueOf(406));
        }
        try{
            String password = userRepository.getPasswordByName(user.getName());
            if(password == null){
                Logger.error("\tfailed | value error -> data not found");
                return new ResponseEntity<>(HttpStatus.valueOf(404));
            }
            if(user.getPassword().equals(password)){
                UUID newToken = generateNewToken();
                int rowsAffected = userRepository.updateTokenByName(
                        newToken.toString(), user.getName());
                if(rowsAffected == 1){
                    Logger.info("\tsuccess");
                    return new ResponseEntity<>("{\"token\":\"" + newToken + "\","
                            + "\"username\":\"" + user.getName() + "\"}",
                            HttpStatus.valueOf(200));
                }
                Logger.error("\tfailed | database error -> updateTokenByName() failed");
                return new ResponseEntity<>(HttpStatus.valueOf(500));
            }
            Logger.error("\tfailed | value error -> password mismatched");
            return new ResponseEntity<>(HttpStatus.valueOf(406));
        }catch(DataAccessException e){
            Logger.error("\tfailed | API error -> signInService() failed");
            return new ResponseEntity<>(HttpStatus.valueOf(500));
        }
    }

    @Transactional
    public ResponseEntity<String> signOutService(Users user){
        Logger.info("sign-out | attempt | " + user.getToken());
        if(user.getToken() == null || user.getToken().isBlank()){
            Logger.error("\tfailed | parameter error -> token");
            return new ResponseEntity<>(HttpStatus.valueOf(406));
        }
        try{
            int rowsAffected = userRepository.updateTokenToNull(user.getToken());
            if(rowsAffected == 1){
                Logger.info("\tsuccess");
                return new ResponseEntity<>(HttpStatus.valueOf(200));
            }
            Logger.error("\tfailed | value error -> data not found");
            return new ResponseEntity<>(HttpStatus.valueOf(404));
        }catch(DataAccessException e){
            Logger.error("\tfailed | API error -> signOutService() failed");
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
