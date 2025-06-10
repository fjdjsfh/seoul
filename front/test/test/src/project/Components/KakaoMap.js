import React, { useEffect, useState, useRef, useCallback } from "react";
import { searchAddrFromCoords } from "./searchAddrFromCoords";
import { searchDetailAddrFromCoords } from "./searchDetailAddrFromCoords";

const KakaoMap = ({ onDistrictSelect, onCenterSelect, radius, setRadius }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const infoWindowRef = useRef(null);

  const selectedLatLng = useRef(null);
  const geoJsonLayerRef = useRef([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(true);

  // 🔹 "서울특별시 " 문자열 제거 함수
  const shortAddress = (fullAddr) => {
    return fullAddr.replace(/^서울특별시\s*/, "");
  };

  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        const container = document.getElementById("map");
        const initialLevel = 8;
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: initialLevel,
          disableDoubleClickZoom: false,
        };
        const map = new window.kakao.maps.Map(container, options);
        map.setZoomable(true);
        map.setMaxLevel(initialLevel);

        mapRef.current = map;

        window.kakao.maps.event.addListener(map, "click", (mouseEvent) => {
          handleMapClick(mouseEvent.latLng, map);
        });

        loadGeoJSON(map);
      }
    };

    if (!window.kakao || !window.kakao.maps) {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAOMAP_KEY}&libraries=services&autoload=false`;
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => window.kakao.maps.load(loadKakaoMap);
    } else {
      loadKakaoMap();
    }
  }, []);

  // 검색
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const places = new window.kakao.maps.services.Places();
    const geocoder = new window.kakao.maps.services.Geocoder();
  
    // 주소 검색
    geocoder.addressSearch(searchQuery, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const latlng = new window.kakao.maps.LatLng(result[0].y, result[0].x);
  
        console.log("✅ 검색된 위치:", result[0].address_name, latlng.getLat(), latlng.getLng());
        if (mapRef.current) {
          mapRef.current.setCenter(latlng);
          mapRef.current.setLevel(8);
        }
        handleMapClick(latlng, mapRef.current);
      } else {
        console.error("❌ 주소 검색 실패 또는 결과 없음");
      }
    });
  };

  // 📂 GeoJSON 로드
  const loadGeoJSON = (map) => {
    fetch("/data/seoul_boundary_wgs84.geojson")
      .then((response) => response.json())
      .then((geojson) => {
        geoJsonLayerRef.current.forEach((polygon) => polygon.setMap(null));
        geoJsonLayerRef.current = [];

        geojson.features.forEach((feature) => {
          if (feature.geometry.type === "Polygon") {
            const coordinates = feature.geometry.coordinates[0].map(
              (coord) => new window.kakao.maps.LatLng(coord[1], coord[0])
            );

            const polygon = new window.kakao.maps.Polygon({
              path: coordinates,
              strokeWeight: 2,
              strokeColor: "#000000",
              strokeOpacity: 1,
              strokeStyle: "solid",
              fillColor: "transparent",
              fillOpacity: 0,
              map: map,
            });

            geoJsonLayerRef.current.push(polygon);

            window.kakao.maps.event.addListener(polygon, "click", () => {
              highlightPolygon(polygon);
            });
          }
        });
      })
      .catch((error) => console.error("GeoJSON 로드 실패:", error));
  };

  const highlightPolygon = (polygon) => {
    geoJsonLayerRef.current.forEach((poly) => poly.setOptions({ strokeColor: "#000000" }));
    polygon.setOptions({ strokeColor: "#FF0000" });
  };

  // 인구 조회
  const fetchPopulation = async (districtCode) => {
    const trimmedCode = districtCode.endsWith("00") ? districtCode.slice(0, -2) : districtCode;
    try {
      const response = await fetch(`http://localhost:8080/api/seoul/population/${trimmedCode}`);
      if (!response.ok) throw new Error("인구수 데이터를 불러올 수 없습니다.");
      const data = await response.json();
      return typeof data === "number" ? data : data.population;
    } catch (error) {
      console.error(error);
      return "데이터 없음";
    }
  };

  // 지도 클릭 핸들러
  const handleMapClick = useCallback((latlng, map) => {
    if (markerRef.current) markerRef.current.setMap(null);
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }

    markerRef.current = new window.kakao.maps.Marker({ position: latlng, map });
    selectedLatLng.current = latlng;
    onCenterSelect({ lat: latlng.getLat(), lng: latlng.getLng() });

    searchAddrFromCoords(latlng, async (result) => {
      if (result.length > 0) {
        const Hdistrict = result.find((r) => r.region_type === "H");
        const selected = result[0];

        // 🔹 상세 주소 조회
        searchDetailAddrFromCoords(latlng, async (detailResult) => {
          const detailAddress = detailResult[0]?.road_address?.address_name || detailResult[0]?.address?.address_name || "상세주소 없음";

          try {
            const response = await fetch(`http://localhost:8080/api/seoul/district/${selected.code}`);
            const data = await response.json();
            
            if (data.length > 0) {
              const district = data[0];
              const population = await fetchPopulation(district.adminCode);

              // 🔸 "서울특별시 " 제거
              const shortAddr = shortAddress(selected.address_name);
              const shortHdistrict = shortAddress(Hdistrict.address_name);

              // 상위 컴포넌트로 지역 정보 전달
              onDistrictSelect({
                address: shortAddr,
                detailAddress: detailAddress, // 📌 상세 주소 추가
                districtCode: district.adminCode,
                districtName: shortHdistrict,
                legalCode: district.legalCode,
                legalName: district.legalName,
                population,
              });

              // 반경 원 갱신
              setRadius((prevRadius) => {
                updateCircle(latlng, map, prevRadius);
                return prevRadius;
              });

              // 인포윈도우 (서울특별시 제거 적용)
              const infoWindow = new window.kakao.maps.InfoWindow({
                position: latlng,
                content: `
                  <div style="
                    padding:10px; 
                    font-size:13px; 
                    word-wrap: break-word; 
                    max-width: 200px; 
                    white-space: normal;
                    overflow-wrap: break-word;
                  ">
                    <strong>📍 행정동:</strong> ${shortHdistrict}<br/>
                    <strong>📍 상세주소:</strong> ${detailAddress}<br/>
                    <strong>👥 인구수:</strong> ${population}
                  </div>
                `,
              });

              infoWindow.open(map, markerRef.current);
              infoWindowRef.current = infoWindow;
            }
          } catch (error) {
            console.error("행정동 정보 가져오기 실패:", error);
          }
        });
      }
    });
  }, [onDistrictSelect, onCenterSelect, setRadius]);

  // 반경 원 생성/업데이트
  const updateCircle = (latlng, map, radius) => {
    if (!latlng || !map) return;

    if (circleRef.current) {
      circleRef.current.setOptions({ center: latlng, radius });
    } else {
      circleRef.current = new window.kakao.maps.Circle({
        center: latlng,
        radius: radius,
        strokeWeight: 2,
        strokeColor: "#87CEEB",
        strokeOpacity: 0.8,
        fillColor: "#87CEEB",
        fillOpacity: 0.3,
        map: map,
      });
    }
  };

  // 반경이 변경될 때마다 기존 서클 재갱신
  useEffect(() => {
    if (selectedLatLng.current && mapRef.current) {
      updateCircle(selectedLatLng.current, mapRef.current, radius);
    }
  }, [radius]);

  return (
    <div>
      {/* 검색창 */}
      {showSearch && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
            zIndex: 1000,
          }}
        >
          <input
            type="text"
            placeholder="지역 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            style={{ padding: "5px", width: "200px", marginRight: "5px" }}
          />
              <button
      onClick={handleSearch}
      style={{
        padding: "8px 12px",
        fontSize: "14px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      🔍
    </button>
        </div>
      )}

      {/* 지도 전체화면 */}
      <div
        id="map"
        style={{
          width: "100vw",
          height: "100vh",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
};

export default KakaoMap;
