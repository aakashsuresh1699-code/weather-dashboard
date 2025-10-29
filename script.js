// API Configuration
const API_KEY = '3bb43e1e308a7913ec05b61b1f59d956'; // Replace with your OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');
const weatherContent = document.getElementById('weatherContent');

// Weather Icons Mapping
const weatherIcons = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
};

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Handle Search
function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    }
}

// Fetch Weather Data
async function getWeather(city) {
    showLoading();
    hideError();
    weatherContent.classList.add('hidden');

    try {
        const currentWeatherUrl = `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const forecastUrl = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`;

        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);

        if (!currentResponse.ok) {
            throw new Error('City not found');
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        displayCurrentWeather(currentData);
        displayForecast(forecastData);

        weatherContent.classList.remove('hidden');
    } catch (error) {
        const message = error.message === 'City not found' 
            ? 'City not found. Please try again.' 
            : 'Failed to fetch weather data. Please check your API key.';
        showError(message);
    } finally {
        hideLoading();
    }
}

// Display Current Weather
function displayCurrentWeather(data) {
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('weatherIcon').textContent = weatherIcons[data.weather[0].icon] || '🌤️';
    document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
}

// Display 5-Day Forecast
function displayForecast(data) {
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';

    // Get one forecast per day (every 8th item = 24 hours)
    const dailyData = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);

    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">${weatherIcons[day.weather[0].icon] || '🌤️'}</div>
            <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
            <div>${day.weather[0].description}</div>
        `;
        forecastGrid.appendChild(forecastItem);
    });
}

// UI Helper Functions
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

function showLoading() {
    loadingDiv.classList.remove('hidden');
}

function hideLoading() {
    loadingDiv.classList.add('hidden');
}

// Load default city on page load
window.addEventListener('load', () => {
    getWeather('London');
});