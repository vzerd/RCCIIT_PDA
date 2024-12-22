package com.rcciitpda.pda_backend.Service;

import com.rcciitpda.pda_backend.Repository.UserRepository;
import org.pmw.tinylog.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
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

                    File outputDirectory = new File(OUTPUT_DIR);
                    File[] outputFiles = outputDirectory.listFiles();
                    if (outputFiles != null) {
                        for (File outputFile : outputFiles) {
                            if (outputFile.isFile()) {
                                if (outputFile.delete()) {
                                    Logger.info("Deleted output file: " + outputFile.getName());
                                } else {
                                    Logger.error("Failed to delete output file: " + outputFile.getName());
                                }
                            }
                        }
                    }

                    // Save the uploaded file to the /input directory
                    file_name = file.getOriginalFilename();
                    Path filePath = Paths.get(INPUT_DIR, file_name);
                    Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                    return new ResponseEntity<>(HttpStatus.valueOf(200));
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
            return new ResponseEntity<>(HttpStatus.NOT_ACCEPTABLE);
        }

        Path filePath = Paths.get(OUTPUT_DIR, "analysis.xlsx");
        int maxRetries = 60;

        try {
            if (!isValidToken(token)) {
                Logger.error("Invalid token: " + token);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            boolean fileAvailable = waitForFile(filePath, maxRetries);
            if (!fileAvailable) {
                Logger.error("File not found after retries: " + filePath);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "analysis.xlsx");

            return new ResponseEntity<>(new FileSystemResource(filePath), headers, HttpStatus.OK);
        } catch (Exception e) {
            Logger.error("Unexpected error in getAnalysisService: ", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private boolean isValidToken(String token) {
        return userRepository.existsByToken(token);
    }

    private boolean waitForFile(Path filePath, int maxRetries){
        for (int i = 0; i < maxRetries; i++) {
            if (Files.exists(filePath) && Files.isReadable(filePath)) {
                return true;
            }
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                Logger.error("Retry interrupted: ", e);
                return false;
            }
        }
        return false;
    }
}