// Used by Map and Bookmarks
export const getCurrentWeather = async (latitude, longitude) => {

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,weather_code` +
    `&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Unable to retrieve current weather');
  }

  return await response.json();
};

// Used by Home and Details
export const getWeatherForecast = async (latitude, longitude) => {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code` +
    `&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m` +
    `&past_days=3` +
    `&forecast_days=8` +
    `&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Unable to retrieve weather forecast');
  }

  return await response.json();
};