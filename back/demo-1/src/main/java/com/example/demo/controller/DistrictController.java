package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.example.demo.service.DistrictService;


//aplication.properties 파일 크기 제한
@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/district")
public class DistrictController {
    private static final Logger logger = LoggerFactory.getLogger(DistrictController.class);
    private final DistrictService districtService;

    public DistrictController(DistrictService districtService) {
        this.districtService = districtService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadDistrictData(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            logger.error("❌ 업로드된 파일이 비어 있습니다.");
            return ResponseEntity.badRequest().body("파일이 비어 있습니다.");
        }

        try {
            logger.info("📂 파일 업로드 시작: {}", file.getOriginalFilename());
            districtService.saveDistrictDataFromExcel(file);
            logger.info("✅ 파일 업로드 성공");
            return ResponseEntity.ok("✅ 엑셀 데이터가 성공적으로 저장되었습니다.");
        } catch (Exception e) {
            logger.error("❌ 파일 처리 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("❌ 파일 처리 중 오류 발생: " + e.getMessage());
        }
    }
}