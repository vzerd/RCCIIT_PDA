package com.rcciitpda.pda_backend.Service;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.AmazonS3Exception;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.rcciitpda.pda_backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Objects;

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
                    String keyName = "input/"
                            + "analysis"
                            + Objects.requireNonNull(file.getOriginalFilename())
                            .substring(file.getOriginalFilename()
                            .lastIndexOf("."));
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
        }catch(Exception e){
            return new ResponseEntity<>(HttpStatus.valueOf(500));
        }
    }

    public ResponseEntity<?> getAnalysisService(String token){
        if(token == null || token.isBlank()){
            return new ResponseEntity<>(HttpStatus.valueOf(406));
        }
        int maxRetries = 60;
        int retryCount = 0;
        List<String> storedTokens = userRepository.getAllTokens();
        for(String storedToken : storedTokens){
            if(token.equals(storedToken)){
                String keyName = "output/" + "analysis.xlsx";
                while (retryCount < maxRetries) {
                    try {
                        S3Object s3Object = s3.getObject(bucket_name, keyName);
                        S3ObjectInputStream inputStream = s3Object.getObjectContent();

                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                        headers.setContentDispositionFormData("attachment", keyName);

                        return new ResponseEntity<>(
                                new InputStreamResource(inputStream),
                                headers,
                                HttpStatus.valueOf(200)
                        );
                    } catch (AmazonS3Exception e) {
                        if ("NoSuchKey".equals(e.getErrorCode())) {
                            retryCount++;
                            try {
                                Thread.sleep(2000);
                            } catch (InterruptedException interruptedException) {
                                Thread.currentThread().interrupt();
                                return new ResponseEntity<>(HttpStatus.valueOf(500));
                            }
                        } else {
                            return new ResponseEntity<>(HttpStatus.valueOf(500));
                        }
                    } catch (Exception e) {
                        return new ResponseEntity<>(HttpStatus.valueOf(500));
                    }
                }
                return new ResponseEntity<>(HttpStatus.valueOf(404));
            }
        }
        return new ResponseEntity<>(HttpStatus.valueOf(404));
    }
}
