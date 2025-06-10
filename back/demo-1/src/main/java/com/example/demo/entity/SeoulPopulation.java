package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "seoul_population")
public class SeoulPopulation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "district_code", nullable = false)
    private String districtCode;

    @Column(name = "total_population", nullable = false)
    private long totalPopulation; // 🔹 인구 데이터가 소수점 포함 가능성이 있으므로 long 사용

    @Column(name = "date", nullable = false)
    private String date;

    // ✅ Getter & Setter 추가
    public Long getId() {
        return id;
    }

    public String getDistrictCode() {
        return districtCode;
    }

    public void setDistrictCode(String districtCode) {
        this.districtCode = districtCode;
    }

    public long getTotalPopulation() {
        return totalPopulation;
    }

    public void setTotalPopulation(long totalPopulation) {  // 🔹 int → long으로 변경
        this.totalPopulation = totalPopulation;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}