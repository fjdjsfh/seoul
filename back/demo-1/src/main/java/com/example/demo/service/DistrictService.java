	package com.example.demo.service;
	
	import org.apache.poi.ss.usermodel.*;
	import org.apache.poi.xssf.usermodel.XSSFWorkbook;
	import org.springframework.stereotype.Service;
	import org.springframework.transaction.annotation.Transactional;
	import org.springframework.web.multipart.MultipartFile;
	
	import com.example.demo.entity.District;
import com.example.demo.entity.SeoulCommercial;
import com.example.demo.repository.DistrictRepository;
	
	import java.io.InputStream;
	import java.io.IOException;
	import java.util.*;
	
	//poi pom설정 해야함
	
	@Service
	public class DistrictService {
	    private final DistrictRepository districtRepository;
	
	    public DistrictService(DistrictRepository districtRepository) {
	        this.districtRepository = districtRepository;
	    }
	    
	  //받은 법정동 코드로 행정동 코드 출력
	    public List<District> getDistrictDataByLegalCode(String legalCode) {
	        return districtRepository.findByLegalCode(legalCode);
	    }
	    @Transactional
	    public void saveDistrictDataFromExcel(MultipartFile file) {
	        try (InputStream inputStream = file.getInputStream()) {
	            saveDistrictDataFromExcel(inputStream); // 기존 로직을 그대로 사용
	        } catch (IOException e) {
	            throw new RuntimeException("엑셀 파일을 읽는 중 오류 발생", e);
	        }
	    }
	
	    @Transactional
	    public void saveDistrictDataFromExcel(InputStream inputStream) {
	        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
	            Sheet sheet = workbook.getSheetAt(0); // 첫 번째 시트 가져오기
	            Iterator<Row> rowIterator = sheet.iterator();
	
	            if (!rowIterator.hasNext()) {
	                throw new RuntimeException("엑셀 파일이 비어 있습니다.");
	            }
	
	            // 첫 번째 행(헤더)을 읽어 컬럼 순서를 매핑
	            Row headerRow = rowIterator.next();
	            Map<String, Integer> columnIndexMap = new HashMap<>();
	
	            for (Cell cell : headerRow) {
	                String columnName = cell.getStringCellValue().trim();
	                columnIndexMap.put(columnName, cell.getColumnIndex());
	            }
	
	            // 필요한 컬럼이 존재하는지 확인
	            if (!columnIndexMap.containsKey("법정동코드") ||
	                !columnIndexMap.containsKey("동리명") ||
	                !columnIndexMap.containsKey("시도명") ||
	                !columnIndexMap.containsKey("행정동코드") ||
	                !columnIndexMap.containsKey("읍면동명")) {
	                throw new RuntimeException("엑셀 파일에 필요한 컬럼명이 없습니다.");
	            }
	
	            List<District> districts = new ArrayList<>();
	
	            while (rowIterator.hasNext()) {
	                Row row = rowIterator.next();
	
	                String legalCode = getStringCellValue(row.getCell(columnIndexMap.get("법정동코드")));
	                String legalName = getStringCellValue(row.getCell(columnIndexMap.get("동리명")));
	                String adminCode = getStringCellValue(row.getCell(columnIndexMap.get("행정동코드")));
	                String adminName = getStringCellValue(row.getCell(columnIndexMap.get("읍면동명")));
	                String stateName = getStringCellValue(row.getCell(columnIndexMap.get("시도명")));
	
	                District district = new District();
	                if(stateName.trim().equalsIgnoreCase("서울특별시")) {
	                	district.setLegalCode(legalCode);
	                    district.setLegalName(legalName);
	                    district.setAdminCode(adminCode);
	                    district.setAdminName(adminName);
	                    district.setStateName(stateName);
	
	                    districts.add(district);
	                }
	             
	                
	            }
	
	            districtRepository.saveAll(districts);
	            System.out.println("✅ 행정동 데이터가 저장되었습니다.");
	        } catch (Exception e) {
	            throw new RuntimeException("파일을 읽는 중 오류 발생", e);
	        }
	    }
	
	    private String getStringCellValue(Cell cell) {
	        if (cell == null) {
	            return "";
	        }
	        cell.setCellType(CellType.STRING); // 숫자도 문자열로 변환
	        return cell.getStringCellValue().trim();
	    }
	    
	    
	    
	}