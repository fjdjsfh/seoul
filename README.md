# 📌 서울시 상권분석 추천 서비스

서울시의 상권·인구 데이터를 기반으로, 사용자가 선택한 위치 반경 내 업종별 점포 수 및 인구 수를 조회하고, 상권 적합도를 정량적으로 분석해주는 웹 기반 서비스입니다.

---
## 화면
![wer](https://github.com/user-attachments/assets/d23476fe-47a6-48dc-8041-47b38573d4cb)



---

## 🛠 기술 스택

| Frontend | Backend | Database | 외부 API |
|----------|---------|----------|-----------|
| React | Spring Boot (Java) | MariaDB | 서울열린데이터광장 API, Kakao Maps API |

---

## 📌 주요 기능

### ✅ 카카오맵 기반 위치 선택
- 사용자가 지도에서 클릭한 좌표를 Kakao Maps SDK의 `coord2RegionCode()`를 통해 법정동 코드로 변환
- 내부 매핑 테이블을 통해 법정동 ↔ 행정동 코드로 변환 후, 해당 지역을 기반으로 상권/인구 데이터 요청 처리

### ✅ 반경 내 상권·인구 데이터 조회
- 행정동 기준으로 서울시 상권 API와 인구 API에 요청
- 반경(예: 500m, 1km) 내 업종별 점포 수, 인구 수, 적합도 점수를 정리하여 시각화

### ✅ 업종별 적합도 분석
- 점포 수가 적고 인구 수가 많은 지역일수록 높은 점수 부여
- 점수를 토대로 사용자가 상권을 분석하여 직접 판단하게 하는 시스템

---
## ERD

![KakaoTalk_20250325_125322981](https://github.com/user-attachments/assets/f386cc16-8430-4639-b498-a85296697ef4)

---
## PDF
[제목을 입력해주세요__ 복사본.pdf](https://github.com/user-attachments/files/20686809/__.pdf)



