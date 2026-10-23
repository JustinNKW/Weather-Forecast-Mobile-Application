//Retrieve the hour number from an API timestamp
export const getHour = (item) => {
    return Number(item.time.split('T')[1].split(':')[0]);
};


//Format Hour (AM and PM)
export const formatHour = (time) => {
  const hour = getHour({ time });

  if (hour === 0) {
    return '12 AM';
  }

  if (hour === 12) {
    return '12 PM';
  }

  if (hour > 12) {
    return `${hour - 12} PM`;
  }

  return `${hour} AM`;
};


//Retrieve the list of dates for the past 3 days, today and the next 7 days
export const getDateOptions = () => {
  const dates = [];
  const today = new Date();
  for (let offset = -3; offset <= 7; offset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      dates.push({
        date: date.toLocaleDateString('en-CA'),
        offset: offset,
      });
  }
  return dates;
};





//Retrieve hourly weather info
export const getHourlyData = (weather) => {
  if (!weather?.hourly) {
    return [];
  }

  return weather.hourly.time.map((time, index) => ({
    time,
    temperature: weather.hourly.temperature_2m[index],
    humidity: weather.hourly.relative_humidity_2m[index],
    weatherCode: weather.hourly.weather_code[index],
    windSpeed: weather.hourly.wind_speed_10m[index],
    apparentTemperature: weather.hourly.apparent_temperature?.[index],
    precipitationProbability:weather.hourly.precipitation_probability?.[index],
  }));
};


//Retrieve hourly weather data belonging to the selected date 
export const getForecastForDate = (hourlyData,selectedDate) => {
  return hourlyData.filter((item) =>
      item.time.split('T')[0] === selectedDate
  );
};


//Retrieve the hourly weather data matching the selected date and hour
export const findWeatherByDateAndHour = (hourlyData, date, hour) => {
  return hourlyData.find((item) => {
    const [itemDate, itemTime] = item.time.split('T');
    const itemHour = Number(itemTime.split(':')[0]);
    return itemDate === date && itemHour === hour;
  });
};


// Retrieves the selected date and hour for display on the main weather card
export const getSelectedTimeLabel = (selectedDate, selectedWeather) => {
  const currentHour = new Date().toLocaleTimeString([], {
    hour: 'numeric',
  });

  const selectedHour = selectedWeather
    ? formatHour(selectedWeather.time)
    : currentHour;

  const formattedDate = new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return `${formattedDate}, ${selectedHour}`;
};


//Sort hours by Day and Night
export const getTimePeriod = (item) => {
  const hour = getHour(item);

  if (hour >= 20 || hour < 6) {
    return 'night';
  }
  return 'day';
};


//Check whether hour is daytime or nighttime
export const isNightTime = (item) => {
  const hour = item
    ? getHour(item)
    : new Date().getHours();
  return hour >= 20 || hour < 6;
};



