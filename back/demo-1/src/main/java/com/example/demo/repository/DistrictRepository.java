package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.District;
import java.util.List;


public interface DistrictRepository extends JpaRepository<District, Long> {
	
	List<District> findByLegalCode(String legalCode);
	
}