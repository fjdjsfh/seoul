import React, { useEffect, useState } from "react";
import Select from "react-select";


const BusinessTypeSelector = ({
  districtCode,
  setSelectedType,
  averageNearbyScore,
  selectedType,
  setBusinessScore,
}) => {
  const [businessTypes, setBusinessTypes] = useState([]);
  const [localSelectedType, setLocalSelectedType] = useState("");
  const [totalStores, setTotalStores] = useState(null);
  const [population, setPopulation] = useState(null);
  const [selectedDistrictScore, setSelectedDistrictScore] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/seoul/commercial/business_types")
      .then((res) => res.json())
      .then((data) => {
        const options = data.map((type) => ({
          label: type,
          value: type,
        }));
        setBusinessTypes(options);
      })
      .catch((err) => console.error("비즈니스 타입 가져오기 실패:", err));
  }, []);

  useEffect(() => {
    if (localSelectedType && districtCode) {
      fetchTotalStore();
      fetchPopulation();
    }
  }, [localSelectedType, districtCode]);

  const fetchPopulation = async () => {
    if (!districtCode) return;
    const trimmedCode = districtCode.slice(0, -2);
    try {
      const res = await fetch(`http://localhost:8080/api/seoul/population/${trimmedCode}`);
      const data = await res.json();
      setPopulation(typeof data === "number" ? data : data.population || 0);
    } catch (err) {
      console.error("인구수 가져오기 실패:", err);
      setPopulation(0);
    }
  };

  const fetchTotalStore = async () => {
    if (!districtCode) return;
    const trimmedCode = districtCode.slice(0, -2);
    const encodedType = encodeURIComponent(localSelectedType);

    try {
      const res = await fetch(
        `http://localhost:8080/api/seoul/commercial/totalStores?districtCode=${trimmedCode}&businessType=${encodedType}`
      );
      const data = await res.json();
      setTotalStores(typeof data === "number" ? data : data.totalStores || 0);
    } catch (err) {
      console.error("점포 수 가져오기 실패:", err);
      setTotalStores(0);
    }
  };

  useEffect(() => {
    const fetchScore = async () => {
      if (population !== null && totalStores !== null) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/seoul/getScore/${population}/${totalStores}`
          );
          const text = await response.text(); // ⚠️ 백엔드가 숫자 하나만 보내므로 text로 받음
          const rawScore = parseInt(text, 10);
          const formattedScore = formatScore(rawScore);
          setSelectedDistrictScore(formattedScore);
          setBusinessScore(formattedScore);
        } catch (error) {
          console.error("점수 계산 오류:", error);
        }
      }
    };
  
    fetchScore();
  }, [population, totalStores]);
  
  const formatScore = (score) => score.toString();

  const handleSelectChange = (selectedOption) => {
    if (!selectedOption) return;
    setLocalSelectedType(selectedOption.value);
    setSelectedType(selectedOption.value);
  };

  return (
    <div className="space-y-4">
      <Select
        className="w-full max-w-md text-sm"
        options={businessTypes}
        value={businessTypes.find((opt) => opt.value === selectedType) || null}
        onChange={handleSelectChange}
        placeholder="업종 타입을 선택하세요"
        isSearchable
        styles={{
          control: (base) => ({
            ...base,
            borderRadius: "0.5rem",
            borderColor: "#ccc",
            boxShadow: "none",
            "&:hover": { borderColor: "#888" },
          }),
          option: (base, { isFocused, isSelected }) => ({
            ...base,
            backgroundColor: isSelected
              ? "#4f46e5"
              : isFocused
              ? "#e0e7ff"
              : "white",
            color: isSelected ? "white" : "black",
            cursor: "pointer",
          }),
        }}
      />

      {localSelectedType && <p>선택한 업종 타입: {selectedType}</p>}
      {totalStores !== null && <p>점포 수: {totalStores}</p>}
      {selectedDistrictScore !== null && (
        <p>
          선택한 행정동의 업종점수:{" "}
          {population > 0
            ? Math.floor(selectedDistrictScore / 1) + "점"
            : "인구수 데이터가 존재하지 않습니다."}
        </p>
      )}
      {averageNearbyScore !== null && (
        <p>반경 내 평균 업종점수: {averageNearbyScore}점</p>
      )}
    </div>
  );
};

export default BusinessTypeSelector;
