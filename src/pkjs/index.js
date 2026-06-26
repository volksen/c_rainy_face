var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};

function weatherCodeToCondition(code) {
  if (code === 0) return 'Klar';
  if (code <= 3) return 'Bewölkt';
  if (code <= 48) return 'Nebel';
  if (code <= 55) return 'Nieselregen';
  if (code <= 57) return 'Gefr. Nieselregen';
  if (code <= 65) return 'Regen';
  if (code <= 67) return 'Gefr. Regen';
  if (code <= 75) return 'Schnee';
  if (code <= 77) return 'Schneegraupel';
  if (code <= 82) return 'Regenschauer';
  if (code <= 86) return 'Schneeschauer';
  if (code === 95) return 'Gewitter';
  if (code <= 99) return 'Gewitter';
  return 'Unknown';
}

function locationSuccess(pos) {
  var url = 'https://api.open-meteo.com/v1/forecast?' +
    'latitude=' + pos.coords.latitude +
    '&longitude=' + pos.coords.longitude +
    '&current=temperature_2m,weather_code,precipitation,precipitation_probability' +
    '&daily=temperature_2m_min,temperature_2m_max,weather_code,precipitation_sum,precipitation_hours,precipitation_probability_max' +
    '&forecast_days=1';


  xhrRequest(url, 'GET',
    function (responseText) {
      var json = JSON.parse(responseText);

      var current_temperature = Math.round(json.current.temperature_2m);
      var current_conditions = weatherCodeToCondition(json.current.weather_code);
      var current_rain = Math.round(json.current.precipitation*10);
      var current_rain_prob = json.current.precipitation_probability;

      var daily_temperature_min = Math.round(json.daily.temperature_2m_min[0]);
      var daily_temperature_max = Math.round(json.daily.temperature_2m_max[0]);
      var daily_temperature_conditions = weatherCodeToCondition(json.daily.weather_code[0]);

      var daily_rain_sum = Math.round(json.daily.precipitation_sum[0]*10);
      var daily_rain_hours = json.daily.precipitation_hours[0];
      var daily_rain_prob_max = json.daily.precipitation_probability_max[0];

      var dictionary = {
        'CURRENT_TEMPERATURE': current_temperature,
        'CURRENT_CONDITIONS': current_conditions,
        "CURRENT_RAIN": current_rain,
        "CURRENT_RAIN_PROB": current_rain_prob,
        'DAILY_TEMPERATURE_MIN': daily_temperature_min,
        'DAILY_TEMPERATURE_MAX': daily_temperature_max,
        'DAILY_CONDITIONS': daily_temperature_conditions,
        "DAILY_RAIN_SUM": daily_rain_sum,
        "DAILY_RAIN_HOURS": daily_rain_hours,
        "DAILY_RAIN_PROB_MAX": daily_rain_prob_max
      };

      Pebble.sendAppMessage(dictionary,
        function (e) { console.log('Weather info sent!'); },
        function (e) { console.log('Error sending weather info!'); }
      );
    }
  );
}

function locationError(err) {
  console.log('Error requesting location!');
}

function getWeather() {
  navigator.geolocation.getCurrentPosition(
    locationSuccess,
    locationError,
    { timeout: 15000, maximumAge: 60000 }
  );
}

Pebble.addEventListener('ready',
  function (e) {
    console.log('PebbleKit JS ready!');
    getWeather();
  }
);

Pebble.addEventListener('appmessage',
  function (e) {
    console.log('AppMessage received!');
    if (e.payload['REQUEST_WEATHER']) {
      getWeather();
    }
  }
);
