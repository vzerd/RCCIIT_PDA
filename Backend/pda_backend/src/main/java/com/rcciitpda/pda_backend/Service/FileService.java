package com.rcciitpda.pda_backend.Service;

import com.rcciitpda.pda_backend.Repository.UserRepository;
import org.pmw.tinylog.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
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

    private String fileExtension;

    @Autowired
    public FileService(UserRepository userRepository) {
        this.userRepository = userRepository;
        File inputDirectory = new File(INPUT_DIR);
        File outputDirectory = new File(OUTPUT_DIR);
        if (!inputDirectory.exists()) {
            inputDirectory.mkdirs();
            Logger.info("Created input directory at: " + INPUT_DIR);
        }
        if (!outputDirectory.exists()) {
            outputDirectory.mkdirs();
            Logger.info("Created output directory at: " + OUTPUT_DIR);
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

                    Logger.info("Valid token provided. Proceeding with file upload.");

                    // Clear output directory
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

                    // Store file name and extension
                    String fileName = file.getOriginalFilename();
                    if (fileName != null && fileName.contains(".")) {
                        fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
                        Logger.info("File extension determined: " + fileExtension);
                    } else {
                        fileExtension = "unknown";
                        Logger.warn("File extension could not be determined. Defaulting to 'unknown'.");
                    }

                    Path filePath = Paths.get(INPUT_DIR, fileName);
                    Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                    Logger.info("File uploaded successfully to: " + filePath);
                    return new ResponseEntity<>(HttpStatus.valueOf(200));
                }
            }

            Logger.error("\tfailed | value error -> data not found");
            return new ResponseEntity<>(HttpStatus.valueOf(404));
        } catch (Exception e) {
            Logger.error("\tfailed | API error -> uploadFileService() failed", e);
            return new ResponseEntity<>(HttpStatus.valueOf(500));
        }
    }

    public ResponseEntity<?> getAnalysisService(String token) {
        Logger.info("get-analysis | attempt | token: " + token);

        if (token == null || token.isBlank()) {
            Logger.error("\tfailed | parameter error -> token");
            return new ResponseEntity<>(HttpStatus.valueOf(406));
        }

        int maxRetries = 60;
        int retryCount = 0;

        try {
            List<String> storedTokens = userRepository.getAllTokens();
            for (String storedToken : storedTokens) {
                if (token.equals(storedToken)) {

                    Logger.info("Valid token provided. Checking for analysis file.");

                    String analysisFileName = "Analytics." + (fileExtension != null ? fileExtension : "xlsx");
                    Path filePath = Paths.get(OUTPUT_DIR, analysisFileName);

                    while (retryCount < maxRetries) {
                        if (Files.exists(filePath) && Files.isReadable(filePath)) {
                            Logger.info("Analysis file found: " + filePath);
                            try {
                                FileSystemResource fileResource = new FileSystemResource(filePath.toFile());
                                HttpHeaders headers = new HttpHeaders();
                                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                                headers.setContentDispositionFormData("attachment", analysisFileName);

                                Logger.info("Returning analysis file to client: " + analysisFileName);
                                return new ResponseEntity<>(fileResource, headers, HttpStatus.OK);
                            } catch (Exception e) {
                                Logger.error("Error preparing file response: ", e);
                                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                            }
                        }

                        try {
                            Thread.sleep(1000);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            Logger.error("Retry interrupted: ", e);
                            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
                        }

                        Logger.warn("Retrying to find the analysis file: Attempt " + (retryCount + 1));
                        retryCount++;
                    }

                    Logger.error("File not found after retries: " + analysisFileName);
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                }
            }

            Logger.error("Token not found: " + token);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Logger.error("Unexpected error in getAnalysisService: ", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
