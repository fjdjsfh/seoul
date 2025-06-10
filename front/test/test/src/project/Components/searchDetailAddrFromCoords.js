export function searchDetailAddrFromCoords(coords, callback) {

    const geocoder = new window.kakao.maps.services.Geocoder();
    // 좌표로 법정동 상세 주소 정보를 요청합니다
    geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
}