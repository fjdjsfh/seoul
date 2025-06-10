package com.example.demo.service;

import com.example.demo.entity.SeoulCommercial;
import com.example.demo.entity.SeoulPopulation;
import com.example.demo.repository.SeoulCommercialRepository;
import com.example.demo.repository.SeoulPopulationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Service
public class SeoulPopulationService {

    private final SeoulPopulationRepository populationRepository;

    public SeoulPopulationService(SeoulPopulationRepository populationRepository) {
        this.populationRepository = populationRepository;
    }

    @Transactional
    public void saveAll(List<SeoulPopulation> populationData) {
        populationRepository.saveAll(populationData);
    }

    public List<SeoulPopulation> getPopulationByDistrict(String districtCode) {
        return (List<SeoulPopulation>) populationRepository.findByDistrictCode(districtCode);
    }
    
    public Long getPopulationByDistrcitCode(String districtCode) {
    	return populationRepository.findPopulationByDistrictCode(districtCode);
    }
}

