package com.example.demo.controller;

import com.example.demo.entity.District;
import com.example.demo.entity.SeoulPopulation;
import com.example.demo.service.DistrictService;
import com.example.demo.service.SeoulApiService;
import com.example.demo.service.SeoulCommercialService;
import com.example.demo.service.SeoulPopulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/seoul")
public class SeoulDataController {

    private final SeoulCommercialService commercialService;
    private final SeoulPopulationService populationService;
    private final DistrictService districtService;
    private final SeoulApiService seoulApiService;

    public SeoulDataController(SeoulCommercialService commercialService, SeoulPopulationService populationService ,DistrictService districtService,SeoulApiService seoulApiService) {
        this.commercialService = commercialService;
        this.populationService = populationService;
        this.districtService = districtService;
        this.seoulApiService = seoulApiService;
    }

    // ✅ 업종별 점포 수 조회
    @GetMapping("/commercial/totalStores")
    public ResponseEntity<Integer> getTotalStore(
            @RequestParam String districtCode, 
            @RequestParam String businessType) {

        System.out.println("✅ 요청 도착 - districtCode: " + districtCode + ", businessType: " + businessType);

        Integer totalStores = commercialService.getTotalStores(districtCode, businessType);

        if (totalStores == null) {
            return ResponseEntity.ok(0);  // 데이터 없음 처리
        }

        return ResponseEntity.ok(totalStores);
    }

    // ✅ 행정동 인구 조회
    @GetMapping("/population/{districtCode}")
    public ResponseEntity<Long> getPopulation(@PathVariable String districtCode) {
        Long population = populationService.getPopulationByDistrcitCode(districtCode);
        if (population == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(population);
    }

    // ✅ 법정동 코드 조회
    @GetMapping("/district/{legalCode}")
    public ResponseEntity<List<District>> getDistrictData(@PathVariable String legalCode){
        List<District> data = districtService.getDistrictDataByLegalCode(legalCode);
        return ResponseEntity.ok(data);
    }

    // ✅ 업종 목록 조회
    @GetMapping("/commercial/business_types")
    public ResponseEntity<List<String>> getBusinessTypes() {
        List<String> businessTypes = commercialService.getBusinessType();
        return ResponseEntity.ok(businessTypes);
    }
    
    @GetMapping("/getScore/{population}/{storeCount}")
    public ResponseEntity<Integer> getScore(@PathVariable int population, @PathVariable int storeCount) {
    	Integer totalScore = seoulApiService.calculateScore(population, storeCount);
        return ResponseEntity.ok(totalScore);
    }
    
}
