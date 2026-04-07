export interface LocationData {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export async function getCurrentAddress(): Promise<LocationData> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ address: 'Ismeretlen helyszín' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Nominatim API for reverse geocoding (OpenStreetMap)
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          
          const coords = { lat: latitude, lng: longitude };

          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || '';
            const road = data.address.road || '';
            
            if (city && road) {
              resolve({ address: `${city}, ${road}`, coordinates: coords });
            } else if (city) {
              resolve({ address: city, coordinates: coords });
            } else if (data.display_name) {
              resolve({ address: data.display_name.split(',').slice(0, 2).join(', '), coordinates: coords });
            } else {
              resolve({ address: 'Ismeretlen helyszín', coordinates: coords });
            }
          } else {
            resolve({ address: 'Ismeretlen helyszín', coordinates: coords });
          }
        } catch (error) {
          console.error('Error fetching address:', error);
          resolve({ address: 'Ismeretlen helyszín' });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        resolve({ address: 'Ismeretlen helyszín' });
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  });
}
