//Display weather description for Home Screen and details screens
//Displays icon, text and news depending on the weather code and time of day
export const getWeatherDescription = (code, showText = false, showNews = false, isNight = false) => {
    let icon = '';
    let text = '';
    let news = '';    
    

    //For Clear, check if its Night or Day
    if (code === 0) {  
      text = isNight ? "Clear Night" : "Clear Sky";

      icon = isNight
        ? require('../assets/NightHour.png')
        : require('../assets/sunnyWeather.png');

      news = isNight
        ? 'Clear weather is expected tonight.'
        : 'When you play outdoors, remember to stay hydrated and regularly drink water.';
    }

    //For Cloudy, check if its Night or Day

    if (code === 1 || code === 2) {  
        text = "Partly Cloudy";

        icon = isNight
          ? require('../assets/NightCloudy.png')
          : require('../assets/partlyCloudy.png');

        news = isNight
          ? 'Partly cloudy conditions are expected tonight.'
          : 'It may be sunny intermittently even though it is a cloudy day.';
    }

    if (code === 3) {  
        text = "Cloudy";
        icon = require('../assets/cloudyWeather.png');
        news = 'It is a cloudy day today. It is a good day to play outside.'; 
    }

    if (code === 45 || code === 48) {    
        text = "Foggy"; 
        icon = require('../assets/foggyWeather.png');
        news = 'Visibility is reduced, so watch out for your surroundings.'; 
    }

    if (code === 51 || code === 53 || code === 55) { 
        text = "Drizzle";
        icon = require('../assets/drizzleWeather.png');
        news = 'Light rain may occur, so keep an umbrella within reach.';            
    }

    if (code === 61 || code === 63 || code === 65 || code === 80 || code === 81 || code === 82) { 
        text = "rain";
        icon = require('../assets/rainyweather.png');
        news = 'Wet surfaces have very little friction, so watch your footing.';     
    }

    if (code === 95 || code === 96 ||code === 99) { 
        text = "Thunderstorm"
        icon =  require('../assets/thunderstorm.png');
        news = 'Lighting risk is is elevated during active storms, please seek shelter immediately.';
    }

    // Show news
    if (showNews) {
      return news;
    }

    //show weather text
    if (showText) {
        return text;
    }

    //return image icon
    return icon;
};


//Return Weather Color based on the current weather
export const getWeatherDotColor = (code) => {

  //Clear Day/Night
  if (code === 0) {
    //Yellow
    return '#FFD54F';
  }
  //Cloudy Day/Night
  if (code === 1 || code === 2 || code === 3) {
    //Grey
    return '#B0BEC5';
  }

  //Foggy Day
  if (code === 45 || code === 48) {
    //Blue Grey (change later)
    return '#90A4AE';
  }

  //Drizzle/Rain
  if (code === 51 || code === 53 || code === 55 ||
      code === 61 || code === 63 || code === 65 ||
      code === 80 || code === 81 || code === 82) {
    //Blue
    return '#2196F3';
  }

  //Thunderstorm
  if (code === 95 || code === 96 || code === 99) {
    //Purple
    return '#7E57C2';
  }

  //Unknown
  return '#999999';
};
























