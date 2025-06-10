package com.example.demo.repository;

import com.example.demo.entity.SeoulPopulation;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SeoulPopulationRepository extends JpaRepository<SeoulPopulation, Long> {
    Optional<SeoulPopulation> findByDistrictCodeAndDate(String districtCode, String date);

	List<SeoulPopulation> findByDistrictCode(String districtCode);
	
	@Query("SELECT p.totalPopulation FROM SeoulPopulation p WHERE p.districtCode = :districtCode")
    Long findPopulationByDistrictCode(String districtCode);
}