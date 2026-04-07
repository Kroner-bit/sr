export async function getCurrentAddress(): Promise<string> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve('Ismeretlen helyszín');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Nominatim API for reverse geocoding (OpenStreetMap)
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || '';
            const road = data.address.road || '';
            
            if (city && road) {
              resolve(`${city}, ${road}`);
            } else if (city) {
              resolve(city);
            } else if (data.display_name) {
              resolve(data.display_name.split(',').slice(0, 2).join(', '));
            } else {
              resolve('Ismeretlen helyszín');
            }
          } else {
            resolve('Ismeretlen helyszín');
          }
        } catch (error) {
          console.error('Error fetching address:', error);
          resolve('Ismeretlen helyszín');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        resolve('Ismeretlen helyszín');
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  });
}
