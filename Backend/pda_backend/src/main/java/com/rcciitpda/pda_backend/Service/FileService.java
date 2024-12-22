package com.rcciitpda.pda_backend.Service;

import com.rcciitpda.pda_backend.Repository.UserRepository;
import org.pmw.tinylog.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
public class FileService {

    private static final String STORAGE_DIR = "C:/Users/Administrator/Desktop/FILE_STORE";
    private static final String INPUT_DIR = STORAGE_DIR + "/input";
    private static final String OUTPUT_DIR = STORAGE_DIR + "/output";

    private final UserRepository userRepository;

    private String file_extension;
    private String file_name;

    @Autowired
    public FileService(UserRepository userRepository) {
        this.userRepository = userRepository;
        File inputDirectory = new File(INPUT_DIR);
        File outputDirectory = new File(OUTPUT_DIR);
        if (!inputDirectory.exists()) {
            inputDirectory.mkdirs();
        }
        if (!outputDirectory.exists()) {
            outputDirectory.mkdirs();
        }
    }

    public ResponseEntity<String> uploadFileService(MultipartFile file, String token) {
        Logger.info("file-upload | attempt | " + token);
        if (file.isEmpty()) {
            Logger.error("\tfailed | parameter error -> file");
            return new ResponseEntity<>(HttpStatus.valueOf(400));
        }
        if (token == null || token.isBlank()) {
            Logger.error("\tfailed | parameter error -> token");
            return new ResponseEntity<>(HttpStatus.valueOf(406));
        }
        try {
            List<String> storedTokens = userRepository.getAllTokens();
            for (String storedToken : storedTokens) {
                if (token.equals(storedToken)) {
                    try {
                        file_name = file.getOriginalFilename();
                        Path filePath = Paths.get(INPUT_DIR, file_name);
                        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                        return new ResponseEntity<>(HttpStatus.valueOf(200));
                    } catch (Exception e) {
                        Logger.error("Error storing file: " + e.getMessage());
                        return new ResponseEntity<>(HttpStatus.valueOf(500));
                    }
                }
            }
            Logger.error("\tfailed | value error -> data not found");
            return new ResponseEntity<>(HttpStatus.valueOf(404));
        } catch (Exception e) {
            Logger.error("\tfailed | API error -> uploadFileService() failed");
            return new ResponseEntity<>(HttpStatus.valueOf(500));
        }
    }

    public ResponseEntity<?> getAnalysisService(String token) {
        if (token == null || token.isBlank()) {
            return new ResponseEntity<>(HttpStatus.valueOf(406));
        }

        int maxRetries = 60;
        int retryCount = 0;
        try {
            List<String> storedTokens = userRepository.getAllTokens();
            for (String storedToken : storedTokens) {
                if (token.equals(storedToken)) {
                    String keyName = "analysis.xlsx";
                    Path filePath;
                    while (retryCount < maxRetries) {
                        filePath = Paths.get(OUTPUT_DIR, keyName);

                        if (Files.exists(filePath) && Files.isReadable(filePath)) {
                            try (InputStream inputStream = new FileInputStream(filePath.toFile())) {
                                HttpHeaders headers = new HttpHeaders();
                                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                                headers.setContentDispositionFormData("attachment", keyName);

                                return new ResponseEntity<>(
                                        new InputStreamResource(inputStream),
                                        headers,
                                        HttpStatus.valueOf(200)
                                );
                            } catch (IOException e) {
                                Logger.error("Error reading file: " + e.getMessage());
                                return new ResponseEntity<>(HttpStatus.valueOf(500));
                            }
                        }

                        try {
                            Thread.sleep(1000); // Wait 1 second before retrying
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            Logger.error("Retry interrupted: " + e.getMessage());
                            return new ResponseEntity<>(HttpStatus.valueOf(500));
                        }
                        retryCount++;
                    }

                    Logger.error("File not found after retries: " + keyName);
                    return new ResponseEntity<>(HttpStatus.valueOf(404));
                }
            }

            Logger.error("Token not found: " + token);
            return new ResponseEntity<>(HttpStatus.valueOf(404));
        } catch (Exception e) {
            Logger.error("Unexpected error in getAnalysisService: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.valueOf(500));
        }
    }
}
