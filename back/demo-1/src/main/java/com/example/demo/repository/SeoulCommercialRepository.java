package com.example.demo.repository;

import com.example.demo.entity.SeoulCommercial;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.PathVariable;

@Repository
public interface SeoulCommercialRepository extends JpaRepository<SeoulCommercial, Long> {

    SeoulCommercial findByDistrictCodeAndBusinessTypeAndDate(String districtCode, String businessType, String date);
    
    SeoulCommercial findByDistrictCodeAndBusinessTypeAndDateAndDistrictName(String districtCode, String businessType, String date , String districtName);

    SeoulCommercial findByDistrictCodeAndBusinessType(String districtCode, String businessType);
    
	List<SeoulCommercial> findByDistrictCode(String districtCode);
	
	@Query("SELECT DISTINCT s.businessType FROM SeoulCommercial s")
    List<String> findDistinctBusinessTypes();
	
	@Query("SELECT  s.totalStores FROM SeoulCommercial s WHERE s.districtCode = :districtCode AND s.businessType = :businessType")
    Integer findTotalStores(String districtCode, String businessType);
}
