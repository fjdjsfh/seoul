package com.example.demo.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "seoul_commercial")
public class SeoulCommercial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "district_name", nullable = false)
    private String districtName;

    @Column(name = "district_code", nullable = false)
    private String districtCode;

    @Column(name = "business_type", nullable = false)
    private String businessType;

    @Column(name = "total_stores", nullable = false)
    private int totalStores;

    @Column(name = "date", nullable = false)
    private String date;

    // ✅ Getter & Setter 추가
    
    public String getDistrictName() {
		return districtName;
	}

	public void setDistrictName(String districtName) {
		this.districtName = districtName;
	}
    
    public String getDistrictCode() {
        return districtCode;
    }

	public void setDistrictCode(String districtCode) {
        this.districtCode = districtCode;
    }

    public String getBusinessType() {
        return businessType;
    }

    public void setBusinessType(String businessType) {
        this.businessType = businessType;
    }

    public int getTotalStores() {
        return totalStores;
    }

    public void setTotalStores(int totalStores) {
        this.totalStores = totalStores;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}