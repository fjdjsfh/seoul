import React, { useEffect, useState } from "react";

const NearbyDistricts = ({ centerCoords, radius, selectedDistrictCode, selectedType, setAverageNearbyScore, setComparisonData }) => {
  const [nearbyDistricts, setNearbyDistricts] = useState([]);
  const [averageScore, setAverageScore] = useState(null);

  const fetchNearbyDistricts = async (coords) => {
    if (!selectedType) {
      setNearbyDistricts([]);
      setAverageNearbyScore(null);
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    const districtMap = new Map();

    const numPoints = 12;
    const angleStep = (2 * Math.PI) / numPoints;
    let totalScore = 0;
    let validDistrictCount = 0;

    // 🔹 "서울특별시 " 문자열 제거 함수
    const shortAddress = (fullAddr) => {
      return fullAddr.replace(/^서울특별시\s*/, "");
    };

    const promises = Array.from({ length: numPoints }, (_, i) => {
      const angle = i * angleStep;
      const latOffset = (radius / 111000) * Math.cos(angle);
      const lngOffset = (radius / (111000 * Math.cos(coords.lat * (Math.PI / 180)))) * Math.sin(angle);
      const point = new window.kakao.maps.LatLng(coords.lat + latOffset, coords.lng + lngOffset);

      return new Promise((resolve) => {
        geocoder.coord2RegionCode(point.getLng(), point.getLat(), async (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const district = result.find((r) => r.region_type === "H");
            if (district) {
              let trimmedCode = district.code.slice(0, -2);
              let population = 0;
              let storeCount = 0;

              try {
                const popResponse = await fetch(`http://localhost:8080/api/seoul/population/${trimmedCode}`);
                if (popResponse.ok) {
                  const popData = await popResponse.json();
                  population = typeof popData === "number" ? popData : (popData.population || 0);
                }

                const encodedType = encodeURIComponent(selectedType);
                const storeResponse = await fetch(
                  `http://localhost:8080/api/seoul/commercial/totalStores?districtCode=${trimmedCode}&businessType=${encodedType}`
                );
                if (storeResponse.ok) {
                  const storeData = await storeResponse.json();
                  storeCount = typeof storeData === "number" ? storeData : (storeData.totalStores || 0);
                }
              } catch (error) {
                console.error("❌ 데이터 가져오기 실패:", error);
              }

              
              let rawScore = null;
              if (population !== null && storeCount !== null) {
                const scoreResponse = await fetch(
                  `http://localhost:8080/api/seoul/getScore/${population}/${storeCount}`
                );
                if (scoreResponse.ok) {
                  const scoreText = await scoreResponse.text();
                  rawScore = parseInt(scoreText, 10);
                }
              }

              if (district.address_name.startsWith("서울")) {
                const shortHdistrict = shortAddress(district.address_name);
                if (rawScore !== null) {
                  totalScore += rawScore;
                  validDistrictCount++;
                }
                districtMap.set(district.code, {
                  name: shortHdistrict,
                  population,
                  storeCount,
                  score: rawScore,
                });
              }
            }
          }
          resolve();
        });
      });
    });

    await Promise.all(promises);

    const filteredDistricts = Array.from(districtMap.entries())
      .map(([code, { name, population, storeCount, score }]) => ({
        code,
        name,
        population,
        storeCount,
        score,
      }))
      .filter(({ population, score }) => population > 0 && score !== null)
      .sort((a, b) => b.score - a.score);

    setNearbyDistricts(filteredDistricts);

    if (validDistrictCount > 0) {
      const avgScore = Math.floor(totalScore / validDistrictCount);
      setAverageNearbyScore(avgScore);
    } else {
      setAverageNearbyScore(null);
    }

    // 반경 내 행정동 데이터 비교를 위해 부모 컴포넌트에 전달
    setComparisonData(filteredDistricts); // 부모 컴포넌트에서 이 데이터를 비교할 수 있습니다.
  };


  useEffect(() => {
    if (centerCoords) {
      fetchNearbyDistricts(centerCoords);
    }
  }, [centerCoords, radius, selectedType]);

  return (
    <div>
      {!selectedType ? (
        <p style={{ color: "red", fontWeight: "bold" }}>업종 타입을 선택해주세요!</p>
      ) : (
        <div>
          <h3>📍 반경 내 행정동</h3>
          {nearbyDistricts.length > 0 ? (
            <ul style={{ listStyleType: "disc", paddingLeft: "18px" }}>
              {nearbyDistricts.map(({ code, name, population, storeCount, score }, index) => (
                <li key={index} style={{ marginBottom: "8px" }}>
                  <strong>{name}</strong><br />
                  👥 {population.toLocaleString()}명<br />
                  🏪 {selectedType} {storeCount}곳<br />
                  점수: {score}
                </li>
              ))}
            </ul>
          ) : (
            <p>❌ 반경 내 다른 행정동이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NearbyDistricts;
