package com.rcciitpda.pda_backend.Controller;

import com.rcciitpda.pda_backend.Service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RequestMapping("/api/v1/file")
@RestController
@CrossOrigin
public class FileController{

    FileService fileService;
    @Autowired
    public FileController(FileService fileService){
        this.fileService = fileService;
    }

    @CrossOrigin(origins = "http://rcciit-pda-webpage.s3-website.ap-south-1.amazonaws.com")
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file,
                                      @RequestParam("token") String token) throws IOException {
        return fileService.uploadFileService(file, token);
    }

    @CrossOrigin(origins = "http://rcciit-pda-webpage.s3-website.ap-south-1.amazonaws.com")
    @GetMapping("/get_analysis")
    public ResponseEntity<?> getAnalysis() throws IOException{
        return fileService.getAnalysisService();
    }
}
