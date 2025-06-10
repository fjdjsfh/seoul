export function searchAddrFromCoords(coords, callback) {
    const geocoder = new window.kakao.maps.services.Geocoder();
    
    geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);
  }
  