package com.example.demo.scheduler;

import com.example.demo.service.SeoulApiService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SeoulDataScheduler {

    private final SeoulApiService seoulApiService;

    public SeoulDataScheduler(SeoulApiService seoulApiService) {
        this.seoulApiService = seoulApiService;
    }


    @Scheduled(cron = "0 0 0 1 */2 *")
    public void fetchAndSaveSeoulData() {
        System.out.println("📢 서울시 상권 & 인구 데이터 업데이트 시작...");
        try {
            seoulApiService.fetchAndSaveCommercialData();
            seoulApiService.fetchAndSavePopulationData();
            System.out.println("✅ 서울시 데이터 업데이트 완료!");
        } catch (Exception e) {
            System.out.println("❌ 서울시 데이터 업데이트 실패: " + e.getMessage());
        }
    }

   // @Scheduled(fixedDelay = 1000000000)
  //  public void testFetchAndSaveSeoulData() {
  //      System.out.println("📢 (테스트) 서울시 데이터 수집 시작...");
  //      seoulApiService.fetchAndSaveCommercialData();
   //     seoulApiService.fetchAndSavePopulationData();
  //  }
}
