package com.rcciitpda.pda_backend.Service;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.s3.AmazonS3;
import com.rcciitpda.pda_backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
    AmazonS3 s3;
    @Value("${aws.s3.bucket.name}")
    private String bucket_name;
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
                    String keyName = "input/" + file.getOriginalFilename();
                    try {
                        s3.putObject(bucket_name, keyName, file.getInputStream(), null);
                        return new ResponseEntity<>(HttpStatus.valueOf(200));
                    } catch (AmazonServiceException e) {
                        System.err.println(e.getErrorMessage());
                        return new ResponseEntity<>(HttpStatus.valueOf(500));
                    }
                }
            }
            return new ResponseEntity<>(HttpStatus.valueOf(404));
        }catch(IOException e){
            return new ResponseEntity<>(HttpStatus.valueOf(500));
        }
    }

    public ResponseEntity<?> getAnalysisService() throws IOException{
        return new ResponseEntity<>(HttpStatus.valueOf(404));
    }
}
