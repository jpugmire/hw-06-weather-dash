//setup event listeners
document.addEventListener('DOMContentLoaded', renderSearchHistory)
$('.submit-btn').click(handleSubmitBtn)
//get search history from local storage (for now just setting)
searchHistory = [];
weatherApiRootUrl = 'https://api.openweathermap.org';
//set background image according to time

const weatherApiKey = '42191b3d902dfa3a9665b3b3625ee9c5';
const sysDate = new Date();

const searchHistoryElement = $('.search-history-wrapper')[0];

//listen for finished loading

function handleSubmitBtn(){
    fetchLocationCoordinate($('.search-bar').val());
}
function handleHistoryBtn(e){
    var element = e.target;
    fetchLocationCoordinate(element.textContent);
}

function fetchLocationCoordinate(value) {
    
    var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${value}&limit=5&appid=${weatherApiKey}`;
    fetch(apiUrl)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            if (!data) {
                alert('invalid location name');
            } else {
                appendToHistory(value);
                fetchCurrentWeather(value, data[0]);
            }
        })
        .catch(function (err) {
            console.error(err);
        });
}

function fetchCurrentWeather(cityName, data) {
    //send nothing if no value
    if(!data)
        return;
    //construct api url
    var { lat } = data;
    var { lon } = data;
    apiUrl = `${weatherApiRootUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${weatherApiKey}`;
    //create request
    fetch(apiUrl)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            if (!data) {
                alert('error getting weather data');
            } else {
                renderData(cityName, data);
                renderForecast(data);
            }
        })
        .catch(function (err) {
            console.error(err);
        });
}

function appendToHistory(search) {
    if (searchHistory.indexOf(search) !== -1 || !search)
        return;
    
    searchHistory.push(search);
    localStorage.setItem('search-history', JSON.stringify(searchHistory));
    renderSearchHistory();
}

function renderSearchHistory() {
    //make sure dashboard is hidden
    $('.dashboard-pane').hide();
    //update variable to what local storage has
    var storedHistory = localStorage.getItem('search-history');
    if (storedHistory) {
        searchHistory = JSON.parse(storedHistory);
    }
    //render items according to variable
    searchHistoryElement.innerHTML = "";
    for (var i = searchHistory.length - 1; i >= 0; i--) {
        var element = document.createElement('div');
        element.classList.add('search-item', 'history-item');
        element.textContent = searchHistory[i];
        element.addEventListener('click', handleHistoryBtn)
        searchHistoryElement.append(element);
    }
}

function renderData(cityName, data) {
    $('.dashboard-pane').show();
    $('.city-name')[0].innerHTML = '<h1>' + cityName + ' ' + sysDate.toDateString() + '</h1>';
    $('.temperature')[0].innerHTML = 'Temperature: <h2>' + data.current.temp + ' °F</h2>';
    $('.wind')[0].innerHTML = 'Wind: ' + data.current.wind_speed + ' mph'
    $('.humidity')[0].innerHTML = 'Humidity: ' + data.current.humidity;
    //uv stuff


    if(data.current.uvi < 3) {
        $('.uv-index')[0].innerHTML = '<div class="uv-mild">UV Index: ' + data.current.uvi + '</div>';
    } else if (data.current.uvi < 7) {
        $('.uv-index')[0].innerHTML = '<div class="uv-moderate">UV Index: ' + data.current.uvi + '</div>';
    } else {
        $('.uv-index')[0].innerHTML = '<div class="uv-severe">UV Index: ' + data.current.uvi + '</div>';
    }
    
}

function renderForecast(data) {
    const renderDate = new Date(sysDate.valueOf());
    for(i = 1; i < 6; i++){
        renderDate.setDate(renderDate.getDate() + 1);
        var forecastElement = $('.forecast-item.' + i)[0];
        forecastElement.innerHTML = '';
        var iconUrl = `https://openweathermap.org/img/w/${data.daily[i-1].weather[0].icon}.png`;
        var iconDescription = data.daily[i-1].weather[0].description;

        var dateEl = document.createElement('div');
        dateEl.classList.add('forecast-header');
        dateEl.innerHTML = renderDate.toLocaleDateString();
        var weatherIcon = document.createElement('img');
        weatherIcon.setAttribute('src', iconUrl)
        weatherIcon.setAttribute('alt', iconDescription);
        var iconEl = document.createElement('div');
        iconEl.classList.add('forecast-detail');
        iconEl.textContent = 'wthr_ico';
        var tempEl = document.createElement('div');
        tempEl.classList.add('forecast-detail');
        tempEl.textContent = 'Temp: ' + data.daily[i-1].temp.day + ' °F';
        var windEl = document.createElement('div');
        windEl.classList.add('forecast-detail');
        windEl.textContent = data.daily[i-1].wind_speed + ' MPH';
        var humEl = document.createElement('div');
        humEl.classList.add('forecast-detail');
        humEl.textContent = 'Humidity: ' + data.daily[i-1].humidity + '%';

        forecastElement.append(dateEl, weatherIcon, tempEl, windEl, humEl);
    }
}