package com.rcciitpda.pda_backend.Service;

import com.rcciitpda.pda_backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.List;

@Service
public class FileService{

    UserRepository userRepository;
    @Autowired
    public FileService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public ResponseEntity<String> uploadFileService(MultipartFile file, String token){
        if(file.isEmpty()){
            return new ResponseEntity<>(HttpStatus.valueOf(400));
        }
        if(token == null || token.isBlank()){
            return new ResponseEntity<>(HttpStatus.valueOf(406));
        }
        try{
            List<String> storedTokens = userRepository.getAllTokens();
            for(String storedToken : storedTokens){
                if(token.equals(storedToken)){
                    File savedDir = new File("Saved");
                    if (!savedDir.exists()){
                        if(!savedDir.mkdirs()){
                            return new ResponseEntity<>(HttpStatus.valueOf(500));
                        }
                    }
                    File destinationFile = new File(savedDir + File.separator + file.getOriginalFilename());
                    file.transferTo(destinationFile.toPath());
                    return new ResponseEntity<>(HttpStatus.valueOf(200));
                }
            }
            return new ResponseEntity<>(HttpStatus.valueOf(404));
        }catch(IOException e){
            return new ResponseEntity<>(HttpStatus.valueOf(500));
        }
    }
}
