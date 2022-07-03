var searchButton = document.querySelector("#search-btn")
var closeButton = document.getElementById("closeBtn")
var userInput = document.querySelector("#userInput")
var today = moment();
var currentWeather = document.querySelector(".currentWeatherContainer")
var recentSearches = document.querySelector(".recentSearches")

var searchHistory = [];

// The following function renders items in recent searches list as <li> elements
function renderSearchHistory() {
    // clear search history
    recentSearches.innerHTML = "";

    // render a new li for each search item
    for (var i = 0; i < searchHistory.length; i++) {
        var History = searchHistory[i];
        var li = document.createElement("li");
        li.textContent = History;
        li.setAttribute("data-value", History)
        recentSearches.appendChild(li)
    }
}

// The function below will run whent the page loads
function init() {
    // Get stored recent searches from localStorage
    var storedHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if (storedHistory !== null) {
        searchHistory = storedHistory;
    }
    renderSearchHistory();
}

function storeHistory() {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

function addSearchInput() {
    // var cityName = JSON.stringify(cityName)
    // return function if submitted city is not found
    if (citySearchName === "city not found") {
        return;
    }

    // adds new search input to list
    searchHistory.push(citySearchName);

    // updates localStorage and re-renders recent searches' list
    storeHistory();
    renderSearchHistory();
}

// Add click event to recentSearches
recentSearches.addEventListener("click", function (event) {
    var element = event.target;
    addHide()
    // checks if element is a li, and re-calls city weather
    if (element.matches("li") === true) {
        // gets city name from "data-value" attribute
        var inputValue = element.getAttribute("data-value");
        // uses city name from above and sets it as userInput
        userInput.value = inputValue
        weatherInfo()
    }
})


searchButton.addEventListener("click", function (event) {
    event.preventDefault
    weatherInfo()
})

function weatherInfo() {

    currentWeather.innerHTML = "";

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

            // function to add search input to recent searches
            function addSearchInput() {
                // return function if submitted city is not found
                if (citySearchName === "city not found" || searchHistory.includes(citySearchName)) {
                    return;
                }

                // adds new search input to list
                searchHistory.push(citySearchName);

                // updates localStorage and re-renders recent searches' list
                storeHistory();
                renderSearchHistory();
            }

            addSearchInput()

            // creating h2 element for name, date, and weather icon
            var nameDateIcon = document.createElement('h2')
            nameDateIcon.innerHTML = `${cityName} (${today.format("MM/DD/YY")}) <img id="icon" src=${iconUrl} alt="Weather icon">`
            nameDateIcon.setAttribute("class", "name");
            currentWeather.appendChild(nameDateIcon)
            //  adding more weather information to current weather container
            var currWeatherInfo = document.createElement('div')
            currWeatherInfo.setAttribute("class", "currWeatherInfo")
            currWeatherInfo.innerHTML = `
            <p>Temp: ${temp}&#176F</p>
            <p>Wind: ${wind} MPH</p>
            <p>Humidity: ${humidity}%</p>
            `
            currentWeather.appendChild(currWeatherInfo)

            fetch('https://api.openweathermap.org/data/2.5/onecall?lat=' + latValue + '&lon=' + lonValue + '&exclude=daily,hourly,minutely,alerts&appid=ce650ca3b8256a609c92e10eac6097e7')
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    var uvIndex = data['current']['uvi']
                    var uvValue = document.createElement('p')
                    uvValue.innerHTML = `UV Index: <span id="uvCondition">${uvIndex}</span>`
                    document.querySelector(".currWeatherInfo").appendChild(uvValue)

                    // changes uv index background color based on the uv index value
                    if (uvIndex < 3) {
                        document.getElementById("uvCondition").style.backgroundColor = "green";
                    } else if (uvIndex < 6) {
                        document.getElementById("uvCondition").style.backgroundColor = "orange";
                    } else if (uvIndex >= 6) {
                        document.getElementById("uvCondition").style.backgroundColor = "red";
                    }

                })

            // shows weather information after all information is retrieved
            removeHide()
            // clears search input box after weather information is displayed
            userInput.value = "";

        })
        // If invalid input is entered, modal of no location found is triggered.
        .catch(error => noLocation())


}

// toggles on modal prompting user that no location has been found 
function noLocation() {
    $('#exampleModal').modal('toggle');
    addHide()
}

// clears input value after no location modal has been closed
closeButton.addEventListener("click", function () {
    userInput.value = "";
})

// function to add and remove hide class (hides weather information)
function removeHide() {
    if (currentWeather.classList.contains("hide")) {
        currentWeather.classList.remove("hide");
    }
}

function addHide() {
    if (!currentWeather.classList.contains("hide")) {
        currentWeather.classList.add("hide");
    }
}

// Calls init to retrieve data and render it to the page on load
init()
