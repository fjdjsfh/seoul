package com.example.demo.service;

import com.example.demo.entity.SeoulCommercial;
import com.example.demo.entity.SeoulPopulation;
import com.example.demo.repository.SeoulCommercialRepository;
import com.example.demo.repository.SeoulPopulationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.*;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.xml.sax.InputSource;

@Service
public class SeoulApiService {

    private final RestTemplate restTemplate;
    private final SeoulCommercialRepository commercialRepository;
    private final SeoulPopulationRepository populationRepository;

    @Value("${seoulC.api.key}")  // 🔹 상권 API 키
    private String CapiKey;
    
    @Value("${seoulP.api.key}")  // 🔹 인구 API 키
    private String PapiKey;

    public SeoulApiService(RestTemplate restTemplate, SeoulCommercialRepository commercialRepository, SeoulPopulationRepository populationRepository) {
        this.restTemplate = restTemplate;
        this.commercialRepository = commercialRepository;
        this.populationRepository = populationRepository;
    }

    // ✅ 상권 데이터 가져오기 (기본 날짜 적용)
    public void fetchAndSaveCommercialData() {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        fetchAndSaveCommercialData(today);
    }
   
  public void fetchAndSaveCommercialData(String date) {
  try {
      int startIndex = 1;
      int batchSize = 1000;
      boolean hasMoreData = true;

      while (hasMoreData) {
          // ✅ startIndex부터 batchSize만큼 요청
          int endIndex = startIndex + batchSize - 1;
          String apiUrl = "http://openapi.seoul.go.kr:8088/" + CapiKey + "/xml/VwsmAdstrdStorW/" + startIndex + "/" + endIndex + "/" + date;
          System.out.println("📢 상권 데이터 요청: " + apiUrl);

          URL url = new URL(apiUrl);
          HttpURLConnection conn = (HttpURLConnection) url.openConnection();
          conn.setRequestMethod("GET");

          int responseCode = conn.getResponseCode();
          if (responseCode == 200) {
              DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
              DocumentBuilder builder = factory.newDocumentBuilder();
              Document document = builder.parse(conn.getInputStream());
              document.getDocumentElement().normalize();

              NodeList nodeList = document.getElementsByTagName("row");
              if (nodeList.getLength() == 0) {
                  // ✅ 더 이상 데이터가 없으면 종료
                  hasMoreData = false;
                  break;
              }

              for (int i = 0; i < nodeList.getLength(); i++) {
                  Element element = (Element) nodeList.item(i);
                  String districtName = getTagValue("ADSTRD_CD_NM", element);
                  String districtCode = getTagValue("ADSTRD_CD", element);
                  String businessType = getTagValue("SVC_INDUTY_CD_NM", element);
                  int totalStores = Integer.parseInt(getTagValue("STOR_CO", element));

                  // ✅ 데이터 저장 (중복 방지 로직 유지)
                  SeoulCommercial existingData = commercialRepository.findByDistrictCodeAndBusinessTypeAndDate(districtCode, businessType, date);
                  if (existingData != null) {
                      existingData.setTotalStores(totalStores);
                      commercialRepository.save(existingData);
                  } else {
                      SeoulCommercial newCommercial = new SeoulCommercial();
                      newCommercial.setDistrictName(districtName);
                      newCommercial.setDistrictCode(districtCode);
                      newCommercial.setBusinessType(businessType);
                      newCommercial.setTotalStores(totalStores);
                      newCommercial.setDate(date);
                      System.out.println("✅ 저장 전 확인: " + newCommercial.getDistrictName());  // 디버깅 로그 추가
                      commercialRepository.save(newCommercial);
                  }
              }

              System.out.println("✅ 상권 데이터 저장 완료! (" + startIndex + " ~ " + endIndex + ")");
          } else {
              System.out.println("❌ API 요청 실패: " + responseCode);
              break;
          }
          conn.disconnect();

          // ✅ 다음 요청을 위해 startIndex 증가
          startIndex += batchSize;

      }
  } catch (Exception e) {
      System.out.println("❌ 상권 데이터 가져오기 실패: " + e.getMessage());
      e.printStackTrace();
  }
}
    
    

    // ✅ 인구 데이터 가져오기 (기본 날짜 적용)
    public void fetchAndSavePopulationData() {
        // 오늘 날짜 기반으로 "yyyyMM05" 형식으로 변환
        String todayFixedDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "05";
        fetchAndSavePopulationData(todayFixedDate);
    }

    // ✅ 인구 데이터 가져오기 (정확한 API 키 사용)
    public void fetchAndSavePopulationData(String date) {
        try {
            int startIndex = 1;
            int batchSize = 900;
            boolean hasData = true;

            while (hasData) {
                int endIndex = startIndex + batchSize - 1;;
                String apiUrl = "http://openapi.seoul.go.kr:8088/" + PapiKey + "/xml/SPOP_LOCAL_RESD_DONG/"
                                + startIndex + "/" + endIndex + "/" + date;

                System.out.println("📢 인구 데이터 요청: " + apiUrl);

                URL url = new URL(apiUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");

                int responseCode = conn.getResponseCode();
                if (responseCode == 200) {
                    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                    DocumentBuilder builder = factory.newDocumentBuilder();
                    Document document = builder.parse(conn.getInputStream());
                    document.getDocumentElement().normalize();

                    NodeList nodeList = document.getElementsByTagName("row");
                    if (nodeList.getLength() == 0) {
                        hasData = false;
                        break;
                    }

                    List<SeoulPopulation> populationList = new ArrayList<>();

                    for (int i = 0; i < nodeList.getLength(); i++) {
                        Element element = (Element) nodeList.item(i);

                        String districtCode = getTagValue("ADSTRD_CODE_SE", element);
                        String totalPopulationStr = getTagValue("TOT_LVPOP_CO", element);
                        long totalPopulation = (long) Double.parseDouble(totalPopulationStr); // 🔹 소수점 제거 후 long 변환


                        // ✅ 기존 데이터가 여러 개 있을 수도 있음 -> List로 조회
                     // ✅ 데이터 저장 로직 수정
                        Optional<SeoulPopulation> existingDataOpt = populationRepository.findByDistrictCodeAndDate(districtCode, date);

                        if (existingDataOpt.isPresent()) {  // 기존 데이터가 존재하는 경우 업데이트
                            SeoulPopulation existingData = existingDataOpt.get();
                            existingData.setTotalPopulation(totalPopulation);
                            populationRepository.save(existingData);
                        } else {  // 새로운 데이터 저장
                            SeoulPopulation newPopulation = new SeoulPopulation();
                            newPopulation.setDistrictCode(districtCode);
                            newPopulation.setTotalPopulation(totalPopulation);
                            newPopulation.setDate(date);
                            populationRepository.save(newPopulation);
                        }

                    }

                    // 신규 데이터 저장
                    if (!populationList.isEmpty()) {
                        populationRepository.saveAll(populationList);
                    }

                    System.out.println("✅ 인구 데이터 저장 완료!");
                    startIndex += batchSize;
                } else {
                    System.out.println("❌ API 요청 실패: " + responseCode);
                    hasData = false;
                    break;
                }
                conn.disconnect();
            }
        } catch (Exception e) {
            System.out.println("❌ 인구 데이터 가져오기 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    //점수 로직
    public int calculateScore(int population, int storeCount) {
    	  double populationScore = (population > 0) ? ((double) population / (storeCount + 1)) : 0;
          int competitionScore = (storeCount > 0) ? Math.max(100 - storeCount * 10, 0) : 100;

          double finalScore = populationScore * 0.7 + competitionScore * 0.3;

          return (int) Math.floor(finalScore);
      }


    
    // ✅ XML 태그 값 가져오기
    private String getTagValue(String tag, Element element) {
        NodeList nodeList = element.getElementsByTagName(tag);
        return (nodeList.getLength() > 0) ? nodeList.item(0).getTextContent() : "0";
    }
    
    
    
}
