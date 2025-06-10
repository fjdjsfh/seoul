package com.example.demo.service;

import com.example.demo.entity.SeoulCommercial;
import com.example.demo.repository.SeoulCommercialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SeoulCommercialService {

    private final SeoulCommercialRepository commercialRepository;
    public SeoulCommercialService(SeoulCommercialRepository commercialRepository) {
        this.commercialRepository = commercialRepository;
    }

    @Transactional
    public void saveAll(List<SeoulCommercial> commercialData) {
        commercialRepository.saveAll(commercialData);
    }

    public List<SeoulCommercial> getCommercialDataByDistrict(String districtCode) {
        return commercialRepository.findByDistrictCode(districtCode);
    }
    
    public SeoulCommercial getCommercialDataByBusinessType(String districtCode, String businessType) {
        return commercialRepository.findByDistrictCodeAndBusinessType(districtCode, businessType);
    }
    
    public List<String> getBusinessType(){
    	return commercialRepository.findDistinctBusinessTypes();
    }
    
    public Integer getTotalStores(String districtCode, String businessType) {
    	return commercialRepository.findTotalStores(districtCode, businessType);
    }
}
