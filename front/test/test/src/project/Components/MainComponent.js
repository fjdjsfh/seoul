import React, { useState } from "react";
import { useKakaoLoader } from "react-kakao-maps-sdk";
import KakaoMap from "./KakaoMap";
import NearbyDistricts from "./NearbyDistricts";
import RadiusControl from "./RadiusControl";
import BusinessTypeSelector from "./BusinessTypeSelector";
import BarChart from "./BarChart";

const MainComponent = () => {
  const isLoaded = useKakaoLoader({ appKey: process.env.REACT_APP_KAKAOMAP_KEY });

  const [districtInfo, setDistrictInfo] = useState({
    address: "",
    detailAddress: "",
    districtCode: "",
    districtName: "",
    legalCode: "",
    legalName: "",
    population: null,
    businessScore: null,
  });

  const [centerCoords, setCenterCoords] = useState(null);
  const [radius, setRadius] = useState(2000);
  const [selectedType, setSelectedType] = useState("");
  const [averageNearbyScore, setAverageNearbyScore] = useState(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [savedInfoList, setSavedInfoList] = useState([]);
  const [isSavedDataVisible, setIsSavedDataVisible] = useState(true);
  const [comparisonData, setComparisonData] = useState([]);
  const [isChartVisible, setIsChartVisible] = useState(true);
  const [isDistrictsVisible, setIsDistrictsVisible] = useState(true);
  const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(true);

  if (!isLoaded) return <div>로딩 중...</div>;

  const handleSave = () => {
    if (!districtInfo.legalName || !districtInfo.address || averageNearbyScore === null) {
      alert("선택한 지역의 정보가 부족합니다.");
      return;
    }

    const newInfo = {
      legalName: districtInfo.legalName,
      address: districtInfo.address,
      detailAddress: districtInfo.detailAddress,
      districtName: districtInfo.districtName,
      population: districtInfo.population !== null ? districtInfo.population : "N/A",
      radius,
      selectedType: selectedType || "미선택",
      businessScore: districtInfo.businessScore !== null ? districtInfo.businessScore : "N/A",
      averageNearbyScore,
      lat: centerCoords?.lat,
      lng: centerCoords?.lng,
    };

    const isDuplicate = savedInfoList.some((item) =>
      Object.keys(newInfo).every((key) => item[key] === newInfo[key])
    );

    if (isDuplicate) {
      alert("같은 조건으로 이미 저장된 데이터입니다.");
      return;
    }

    setSavedInfoList([...savedInfoList, newInfo]);
  };

  const handleDelete = (index) => {
    setSavedInfoList(savedInfoList.filter((_, i) => i !== index));
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <KakaoMap
        onDistrictSelect={(info) => {
          setDistrictInfo(info);
          setIsPanelVisible(true);
        }}
        onCenterSelect={setCenterCoords}
        radius={radius}
        setRadius={setRadius}
      />

      {/* 오른쪽 패널 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: isPanelVisible ? "420px" : "0px",
          height: "100vh",
          backgroundColor: "#f8f9fa",
          boxShadow: isPanelVisible ? "-2px 0 10px rgba(0,0,0,0.1)" : "none",
          transition: "width 0.3s ease-in-out",
          overflow: "hidden", // overflow는 내부에서 처리
          zIndex: 1500,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{      flex: 1,
      overflowY: "auto",
      padding: isPanelVisible ? "20px" : "0",
      boxSizing: "border-box",}}>
          {isPanelVisible && (
            <>
              <h2 style={{ marginTop: 0 }}>지역 정보</h2>
              <p><strong>📍 주소:</strong> {districtInfo.detailAddress}</p>
              <p><strong>🗺️ 행정동:</strong> {districtInfo.districtName}</p>
              <p><strong>👥 인구:</strong> {districtInfo.population}</p>

              <BusinessTypeSelector
                districtCode={districtInfo.districtCode}
                setSelectedType={setSelectedType}
                selectedType={selectedType}
                averageNearbyScore={averageNearbyScore}
                setBusinessScore={(score) =>
                  setDistrictInfo((prev) => ({ ...prev, businessScore: score }))
                }
              />

              <RadiusControl radius={radius} setRadius={setRadius} />

              <button
                onClick={() => setIsDistrictsVisible((prev) => !prev)}
                style={{
                  width: "100%",
                  padding: "6px",
                  margin: "10px 0",
                  backgroundColor: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {isDistrictsVisible ? "🔽 주변 행정동 닫기" : "🔼 주변 행정동 열기"}
              </button>

              <div style={{ display: isDistrictsVisible ? "block" : "none" }}>
              <NearbyDistricts
                centerCoords={centerCoords}
                radius={radius}
                selectedDistrictCode={districtInfo.districtCode}
                selectedType={selectedType}
                setAverageNearbyScore={setAverageNearbyScore}
                setComparisonData={setComparisonData}
              />
            </div>

              <button
                onClick={() => setIsChartVisible((prev) => !prev)}
                style={{
                  width: "100%",
                  padding: "6px",
                  margin: "10px 0",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {isChartVisible ? "📉 차트 닫기" : "📊 차트 열기"}
              </button>

              {isChartVisible && comparisonData.length > 0 && (
                <div style={{ width: "100%", overflowX: "auto", marginBottom: "20px" }}>
                  <BarChart data={comparisonData} />
                </div>
              )}

              <button
                onClick={handleSave}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "10px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                💾 저장
              </button>
            </>
          )}
        </div>
      </div>

      {/* 오른쪽 토글 버튼 */}
      <div
        onClick={() => setIsPanelVisible((prev) => !prev)}
        style={{
          position: "absolute",
          top: "40%",
          right: isPanelVisible ? "420px" : "0px",
          width: "30px",
          height: "60px",
          backgroundColor: "#007bff",
          color: "white",
          borderRadius: "5px 0 0 5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "-1px 0 5px rgba(0,0,0,0.1)",
          zIndex: 1601,
          transition: "right 0.3s ease-in-out",
        }}
        title={isPanelVisible ? "패널 접기" : "패널 열기"}
      >
        {isPanelVisible ? "⏩" : "⏪"}
      </div>

      {/* 아래에서 위로 올라오는 왼쪽 패널 - 카드 하나 높이, 가로폭 제한 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "320px",
          height: isBottomPanelVisible ? "300px" : "0px",
          backgroundColor: "#f8f9fa",
          boxShadow: isBottomPanelVisible ? "0 -2px 10px rgba(0,0,0,0.1)" : "none",
          transition: "height 0.3s ease-in-out",
          overflow: "hidden",
          zIndex: 1600,
          overflowY: 'auto',
        }}
      >
        <div style={{ padding: "20px", opacity: isBottomPanelVisible ? 1 : 0, transition: "opacity 0.2s" }}>
          <h3>📂 저장된 데이터</h3>
          {savedInfoList.length > 0 ? (
            savedInfoList.map((item, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#fff",
                  padding: "20px",
                  borderRadius: "10px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  position: "relative",
                  marginBottom: "10px",
                }}
              >
                <button
                  onClick={() => handleDelete(index)}
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "3px 6px",
                    cursor: "pointer",
                  }}
                >
                  🗑 삭제
                </button>
                <p><strong>🏢 {item.districtName}</strong></p>
                <p>📍 {item.detailAddress}</p>
                <p>반경 :  {item.radius}m</p>
                <p>업종: {item.selectedType}</p>
                <p>⭐ 행정동 점수: {item.businessScore}</p>
                <p>⭐ 평균 점수: {item.averageNearbyScore}</p>
              </div>
            ))
          ) : (
            <p>저장된 데이터가 없습니다.</p>
          )}
        </div>
      </div>

      {/* 왼쪽(아래 패널) 토글 버튼 */}
      <div
        onClick={() => setIsBottomPanelVisible((prev) => !prev)}
        style={{
          position: "absolute",
          left: "0px",
          bottom: isBottomPanelVisible ? "300px" : "0px",
          width: "40px",
          height: "40px",
          backgroundColor: "#007bff",
          color: "white",
          borderRadius: "5px 5px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 -1px 5px rgba(0,0,0,0.1)",
          zIndex: 1601,
          transition: "bottom 0.3s ease-in-out",
        }}
        title={isBottomPanelVisible ? "패널 접기" : "패널 열기"}
      >
        {isBottomPanelVisible ? "🔽" : "🔼"}
      </div>
    </div>
  );
};

export default MainComponent;
