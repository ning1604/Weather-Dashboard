var searchButton = document.querySelector("#search-btn")
var closeButton = document.getElementById("closeBtn")
var userInput = document.querySelector("#userInput")
var currentWeather = document.querySelector(".currentWeatherContainer")
var fiveDayForecast = document.querySelector(".fiveDayForecast")
var recentSearches = document.querySelector(".recentSearches")
var weatherInformation = document.querySelector(".weatherInformation")
var forecastHeader = document.querySelector(".forecastHeader")
var fiveDays = ["", moment().add(1, 'days').format("MM/DD/YY"), moment().add(2, 'days').format("MM/DD/YY"), moment().add(3, 'days').format("MM/DD/YY"), moment().add(4, 'days').format("MM/DD/YY"), moment().add(5, 'days').format("MM/DD/YY")]
var weatherInformation = document.querySelector(".weatherInformation")
var today = moment();
var searchHistory = [];

// The following function renders items in recent searches list as <li> elements
function renderSearchHistory() {
    // clear search history
    recentSearches.innerHTML = "";

    // Render a new li for each search item
    for (var i = 0; i < searchHistory.length; i++) {
        var History = searchHistory[i];
        var li = document.createElement("li");
        li.textContent = History;
        li.setAttribute("data-value", History)
        recentSearches.appendChild(li)
    }
}

// The function below will run when the page loads
function init() {
    // Get stored recent searches from localStorage
    var storedHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if (storedHistory !== null) {
        searchHistory = storedHistory;
    }
    renderSearchHistory();
}

// Function for storing search input to recent searches
function storeHistory() {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

function addSearchInput() {
    // Return function if submitted city is not found
    if (citySearchName === "city not found") {
        return;
    }

    // Adds new search input to list
    searchHistory.push(citySearchName);

    // Updates localStorage and re-renders recent searches' list
    storeHistory();
    renderSearchHistory();
}

// Add click event to recentSearches
recentSearches.addEventListener("click", function (event) {
    var element = event.target;
    addHide()
    // Checks if element is a li, and re-calls city weather
    if (element.matches("li") === true) {
        // gets city name from "data-value" attribute
        var inputValue = element.getAttribute("data-value");
        // Uses city name from above and sets it as userInput
        userInput.value = inputValue
        weatherInfo()
        forecastHeader.classList.remove("hide")
    }
})

// Added event listener to search button, when clicked, run weatherInfo function
searchButton.addEventListener("click", function (event) {
    event.preventDefault
    weatherInfo()
})

// Main purpose of this function is to fetch weather information from api and display them on the page
function weatherInfo() {
    // Clearing previous weather information
    currentWeather.innerHTML = "";
    fiveDayForecast.innerHTML = "";

    fetch('https://api.openweathermap.org/data/2.5/forecast?q=' + userInput.value + '&units=imperial&appid=ce650ca3b8256a609c92e10eac6097e7')
        .then(response => response.json())
        .then(data => {
            console.log(data)

            var latValue = data['city']['coord']['lat']
            var lonValue = data['city']['coord']['lon']
            var cityName = data['city']['name'];
            var citySearchName = data['city']['name'];
            var weatherIcon = data['list'][0]['weather'][0]['icon']
            var iconUrl = 'http://openweathermap.org/img/w/' + weatherIcon + '.png'
            var temp = data['list'][0]['main']['temp']
            var wind = data['list'][0]['wind']['speed']
            var humidity = data['list'][0]['main']['humidity']

            // Function to add search input to recent searches
            function addSearchInput() {
                // Return function if submitted city is not found or if it is already on the list
                if (citySearchName === "city not found" || searchHistory.includes(citySearchName)) {
                    return;
                }

                // Adds new search input to list
                searchHistory.push(citySearchName);

                // Updates localStorage and re-renders recent searches' list
                storeHistory();
                renderSearchHistory();
            }

            addSearchInput()

            // Creating h2 element for name, date, and weather icon
            var nameDateIcon = document.createElement('h2')
            nameDateIcon.innerHTML = `${cityName} (${today.format("MM/DD/YY")}) <img id="icon" src=${iconUrl} alt="Weather icon">`
            nameDateIcon.setAttribute("class", "name");
            currentWeather.appendChild(nameDateIcon)

            //  Adding more weather information to current weather container
            var currWeatherInfo = document.createElement('div')
            currWeatherInfo.setAttribute("class", "currWeatherInfo")
            currWeatherInfo.innerHTML = `
            <p>Temp: ${temp}&#176F</p>
            <p>Wind: ${wind} MPH</p>
            <p>Humidity: ${humidity}%</p>
            `
            currentWeather.appendChild(currWeatherInfo)

            // Creating 5 day forecast elements
            function dailyForecast() {
                for (i = 1; i < 6; i++) {
                    var dayForecast = document.createElement("div")

                    dayForecast.setAttribute("class", "daily-forecast d-flex flex-column")
                    dayForecast.innerHTML = `
                <h4>${fiveDays[i]}</h4>
                <img id="icon" src=${'http://openweathermap.org/img/w/' + data['list'][i]['weather'][0]['icon'] + '.png'} alt="Weather icon">
                <p>Temp: ${data['list'][i]['main']['temp']}&#176F</p>
                <p>Wind: ${data['list'][i]['wind']['speed']} MPH</p>
                <p>Humidity: ${data['list'][i]['main']['humidity']}%</p>
                `
                    fiveDayForecast.appendChild(dayForecast)
                }
            }

            dailyForecast()

            // Purpose of second fetch is to get uv index using the latitude and longitude value provided from previous fetch
            fetch('https://api.openweathermap.org/data/2.5/onecall?lat=' + latValue + '&lon=' + lonValue + '&exclude=daily,hourly,minutely,alerts&appid=ce650ca3b8256a609c92e10eac6097e7')
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    var uvIndex = data['current']['uvi']
                    var uvValue = document.createElement('p')
                    uvValue.innerHTML = `UV Index: <span id="uvCondition">${uvIndex}</span>`
                    document.querySelector(".currWeatherInfo").appendChild(uvValue)

                    // Changes uv index background color based on the uv index value (favorable, moderate, or severe)
                    if (uvIndex < 3) {
                        document.getElementById("uvCondition").style.backgroundColor = "green";
                    } else if (uvIndex < 6) {
                        document.getElementById("uvCondition").style.backgroundColor = "orange";
                    } else if (uvIndex >= 6) {
                        document.getElementById("uvCondition").style.backgroundColor = "red";
                    }

                })

            // Shows weather information after all information is retrieved
            removeHide()
            forecastHeader.classList.remove("hide")

            // Clears search input box after weather information is displayed
            userInput.value = "";

        })
        // If invalid input is entered or an error, no location function is triggered
        .catch(error => noLocation())
}

// Toggles on modal prompting user that no location has been found 
function noLocation() {
    $('#exampleModal').modal('toggle');
    forecastHeader.classList.add("hide")
    addHide()
}

// Functions to add and remove hide class (hides/displays weather information)
function removeHide() {
    if (weatherInformation.classList.contains("hide")) {
        weatherInformation.classList.remove("hide");
    }
}

function addHide() {
    if (!weatherInformation.classList.contains("hide")) {
        weatherInformation.classList.add("hide");
    }
}

// Clears input value after no location modal has been closed
closeButton.addEventListener("click", function () {
    userInput.value = "";
})

// Calls init to retrieve data and render it to the page on load
init()
