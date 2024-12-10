package com.rcciitpda.pda_backend.Service;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.rcciitpda.pda_backend.Repository.UserRepository;
import org.pmw.tinylog.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Objects;

@Service
public class FileService{

    UserRepository userRepository;
    @Autowired
    AmazonS3 s3;
    @Value("${aws.s3.bucket.input.name}")
    private String input_bucket_name;
    @Value("${aws.s3.bucket.output.name}")
    private String output_bucket_name;
    private String file_extension;
    @Autowired
    public FileService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public ResponseEntity<String> uploadFileService(MultipartFile file, String token){
        Logger.info("file-upload | attempt | " + token);
        if(file.isEmpty()){
            Logger.error("\tfailed | parameter error -> file");
            return new ResponseEntity<>(HttpStatus.valueOf(400));
        }
        if(token == null || token.isBlank()){
            Logger.error("\tfailed | parameter error -> token");
            return new ResponseEntity<>(HttpStatus.valueOf(406));
        }
        try{
            List<String> storedTokens = userRepository.getAllTokens();
            for(String storedToken : storedTokens){
                if(token.equals(storedToken)){
                    file_extension = Objects.requireNonNull(file.getOriginalFilename())
                            .substring(file.getOriginalFilename()
                                    .lastIndexOf("."));
                    String keyName = "analysis" + file_extension;
                    try {
                        s3.putObject(input_bucket_name, keyName, file.getInputStream(), null);
                        Logger.info("\tsuccess");
                        return new ResponseEntity<>(HttpStatus.valueOf(200));
                    } catch (AmazonServiceException e) {
                        System.err.println(e.getErrorMessage());
                        Logger.error("\tfailed | S3 error -> putObject() failed");
                        return new ResponseEntity<>(HttpStatus.valueOf(500));
                    }
                }
            }
            Logger.error("\tfailed | value error -> data not found");
            return new ResponseEntity<>(HttpStatus.valueOf(404));
        }catch(Exception e){
            Logger.error("\tfailed | API error -> uploadFileService() failed");
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
                String keyName = "analysis" + file_extension;
                while (retryCount < maxRetries) {
                    try {
                        S3Object s3Object = s3.getObject(output_bucket_name, keyName);
                        S3ObjectInputStream inputStream = s3Object.getObjectContent();

                        s3.deleteObject(output_bucket_name, keyName);

                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                        headers.setContentDispositionFormData("attachment", keyName);

                        return new ResponseEntity<>(
                                new InputStreamResource(inputStream),
                                headers,
                                HttpStatus.valueOf(200)
                        );
                    } catch (AmazonServiceException e) {
                        Logger.error(e.getMessage());
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
                        Logger.error(e.getMessage());
                        return new ResponseEntity<>(HttpStatus.valueOf(500));
                    }
                }
                return new ResponseEntity<>(HttpStatus.valueOf(404));
            }
        }
        return new ResponseEntity<>(HttpStatus.valueOf(404));
    }
}
