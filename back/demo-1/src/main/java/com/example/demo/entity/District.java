package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "district")
public class District {
    
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
    
    @Column(name = "legal_code", length = 10, nullable = false)
    private String legalCode; // 법정동 코드
    
    
    @Column(name = "legal_name", nullable = false)
    private String legalName; // 법정동 명칭
    
    @Column(name = "admin_code", length = 10, nullable = false)
    private String adminCode; // 행정동 코드
    
    @Column(name = "admin_name", nullable = false)
    private String adminName; // 행정동 명칭
    
    @Column(name = "state_name", nullable = false)
    private String stateName; // 행정동 명칭

    
    
	public String getStateName() {
		return stateName;
	}

	public void setStateName(String stateName) {
		this.stateName = stateName;
	}

	public String getLegalCode() {
		return legalCode;
	}

	public void setLegalCode(String legalCode) {
		this.legalCode = legalCode;
	}

	public String getLegalName() {
		return legalName;
	}

	public void setLegalName(String legalName) {
		this.legalName = legalName;
	}

	public String getAdminCode() {
		return adminCode;
	}

	public void setAdminCode(String adminCode) {
		this.adminCode = adminCode;
	}

	public String getAdminName() {
		return adminName;
	}

	public void setAdminName(String adminName) {
		this.adminName = adminName;
	}
    
    
    
}
