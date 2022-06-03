/*  Deklarerar variablar som kommer kallas på genom programmet */
const all = {
    menu: document.querySelector(".menu"),
    menuList: document.querySelector(".menuList"),
    main: document.querySelector(".main"),
    mainList: document.querySelector(".mainList"),
    formatNum: Intl.NumberFormat()
};
/*  Funktion som hämtar information från JSON-filerna */
const getData = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}
/*  Funktion som printar ut menyn och "hela hemsidan". Det mesta skapas via Javascript.
    Här hämtas data från filen land.json och skapar nödvändiga html-element.
    Fyller elementen med datan från json-filen. 
    Alla funktioner går på ett eller annat sätt igenom printMenu-funktionen. */
const printMenu = async () => {
    const countryData = await getData("https://api-stader-lander.herokuapp.com/country");
    const menuList = all.menuList;
    const start = myCreateElement("li", "menuItem noSelect", "start");
    start.innerText = "Startsida";
    menuList.appendChild(start);
    const mainList = all.mainList;
    const mainStart = myCreateElement("ul", "", "startMain")
    mainList.appendChild(mainStart);
    const dropDown = myCreateElement("li", "noSelect dropDown", "dropDown");
    dropDown.innerText = "Länder";
    menuList.appendChild(dropDown);
    const dropDownContent = myCreateElement("ul", "dropDownContent", "dropDownContent");
    dropDown.appendChild(dropDownContent);

    for (i = 0; i < countryData.length; i++) {
        const country = myCreateElement("li", "menuItem noSelect", countryData[i].id);
        country.innerText = countryData[i].countryname;
        dropDownContent.appendChild(country);
        const cityList = myCreateElement("ul", "countryList hideText", "country" + countryData[i].id);
        mainList.appendChild(cityList);
        const countryName = myCreateElement("li", "countryName", "");
        cityList.insertAdjacentHTML("beforeend", "<h1>" + countryData[i].countryname + "</h1>");
        countryName.innerText = countryData[i].countryname;
        printCity(countryData[i]);
    }

    const visit = myCreateElement("li", "menuItem noSelect", "visited");
    visit.innerText = "Besökta städer";
    menuList.appendChild(visit);

    const mainVisit = myCreateElement("ul", "hideText", "visitedMain");
    mainList.appendChild(mainVisit);

    printStart();
    printVisited();
}
/*  Funktion som skapar element för att korta ner koden. */
const myCreateElement = (element, myClass, myId) => {
    const create = document.createElement(element);
    create.setAttribute("class", myClass);
    create.setAttribute("id", myId);
    return create;
}
/*  Printar ut sidan och alla funktioner */
printMenu();

/*  Här nedanför kommer alla funktioner som kopplas in i printMenu*/

/*  Funktion som printar ut startsidan */
const printStart = () => {
    const start = document.getElementById("startMain");
    const startInfo = document.createElement("li");
    start.appendChild(startInfo);
    startInfo.insertAdjacentHTML("beforeend",
        "<h1>Städer och Länder!</h1>" +
        "<p>Högst upp på sidan har du en meny där du kan klicka vidare till vilket land du vill." +
        " Under varje meny finns städer du kan klicka på för att få fram lite information om staden" +
        " och en checklista som du kan klicka i om du har besökt staden. På sista sidan kommer" +
        " en sammanfattning av vilka städer du har besökt och hur många personer du kan ha stött" +
        " på. Ha så kul!</p>");
}
/*  Funktion som hämtar data från stad.json och skapar html-element och sedan 
    printar ut städerna när man klicka på valt land. */
const printCity = async (countryData) => {
    const cityData = await getData("https://api-stader-lander.herokuapp.com/city");
    for (i = 0; i < cityData.length; i++) {
        const country = document.getElementById("country" + countryData.id);
        if (cityData[i].countryid === countryData.id) {
            const city = document.createElement("li");
            city.setAttribute("id", "city" + cityData[i].id);
            country.appendChild(city);
            city.insertAdjacentHTML("beforeend", "<h2 class='noSelect' = id='cityHead" + cityData[i].id + "'>" + cityData[i].stadname + "</h2>");
            const infoP = document.createElement("p");
            infoP.setAttribute("class", "hideText");
            city.appendChild(infoP);
            infoP.insertAdjacentHTML("beforeend", cityData[i].stadname + " ligger i " + countryData.countryname + " och har " +
                all.formatNum.format(cityData[i].population) + " invånare.<br>Klicka i den här rutan om du har varit i denna stad: " +
                "<input type='checkbox' id='checkBox" + cityData[i].id + "'>");
            const cityClick = document.querySelector("#city" + cityData[i].id + " h2:nth-child(1)");

            printCityInfo(cityClick, cityData[i].id);
            fillVisited();
            visited(cityData[i].id);
        }
    }
    /*  En loop för att gömma element när man klickar på olika val i menyn.
        Alltså för att bläddra mellan menyns olika val så att man kommer till rätt sida. */
    let menus = document.querySelectorAll(".menuItem");
    for (let menu of menus) {
        menu.addEventListener('click', function () {
            let mainLists = document.querySelectorAll(".mainList ul");
            for (let mainList of mainLists) {
                if (mainList.id === "country" + menu.getAttribute("id") || mainList.id === menu.getAttribute("id") + "Main") {
                    mainList.style.display = "block";
                } else {
                    mainList.style.display = "none";
                }
            }
        });
    }
}
/*  Funktion som printar ut info om vald stad när man klickar på en stad */
const printCityInfo = (elm, cityId) => {
    elm.addEventListener("click", async () => {
        const hideP = document.querySelector("#city" + cityId + " p:nth-child(2)");
        hideP.classList.toggle("hideText");
    });
}
/*  Funktion som sparar användarens val av stad denne har besökt. 
    Detta sparas i localStorage om en checkbox är kryssad */
const visited = (cityId) => {
    const checkBox = document.getElementById("checkBox" + cityId);
    checkBox.addEventListener("click", () => {
        let savedVisitedString = localStorage.getItem("visited");
        let visitedArr = [];
        if (checkBox.checked) {
            if (savedVisitedString === null) {
                visitedArr = [{ "city": cityId }];
                const visitedString = JSON.stringify(visitedArr);
                localStorage.setItem("visited", visitedString);
            } else {
                savedVisitedString = localStorage.getItem("visited");
                visitedArr = JSON.parse(savedVisitedString);
                visitedArr.push({ "city": cityId });
                const newVisitedString = JSON.stringify(visitedArr);
                localStorage.setItem("visited", newVisitedString);
            }
        } else {
            const visitedArr = JSON.parse(savedVisitedString);
            const unChecked = visitedArr.find(a => a.city === cityId);
            const unCheckedPlace = visitedArr.indexOf(unChecked);
            visitedArr.splice(unCheckedPlace, 1);
            const newVisitedString = JSON.stringify(visitedArr);
            localStorage.setItem("visited", newVisitedString);
        }
    });
}
/*  Funktion som fyller i kryssen i alla checkboxar igen, om användaren kommer tillbaka eller
    inte har klickat på knappen "Radera" på sidan "Besökta städer".  */
const fillVisited = async () => {
    const cityData = await getData("https://api-stader-lander.herokuapp.com/city");
    const checkedCity = localStorage.getItem("visited");
    if (checkedCity !== null) {
        const allChecks = JSON.parse(checkedCity);
        for (i = 0; i < cityData.length; i++) {
            for (j = 0; j < allChecks.length; j++) {
                if (cityData[i].id === allChecks[j].city) {
                    const checkBox = document.getElementById('checkBox' + cityData[i].id);
                    checkBox.checked = true;
                }
            }
        }
    } else {
        for (i = 0; i < cityData.length; i++) {
            const checkBox = document.getElementById('checkBox' + cityData[i].id);
            checkBox.checked = false;
        }
    }
}
/*  Funktion som printar ut sidan "Besökta städer".
    Hämtar data från json fil, skapar element och knappar.
    Vid klick på knapparna sker olika event. */
const printVisited = async () => {
    const cityData = await getData("https://api-stader-lander.herokuapp.com/city");
    const visited = document.getElementById("visitedMain");
    const visitedInfo = document.createElement("li");
    visited.appendChild(visitedInfo);
    visitedInfo.insertAdjacentHTML("beforeend",
        "<h1>Vilka städer har du besökt?</h1>" +
        "<p>Här kommer en sammanfattning av de städer du har kryssat i att du har besökt:</p>" +
        '<p>Klicka på "Uppdatera" för att uppdatera dina kryssningar. <br>' +
        'Klicka på "Radera" för att radera alla dina kryssningar.</p>');
    const buttonUpdate = document.createElement("button");
    buttonUpdate.innerText = "Uppdatera";
    visited.appendChild(buttonUpdate);
    const buttonDelete = document.createElement("button");
    buttonDelete.innerText = "Radera";
    visited.appendChild(buttonDelete);
    const visitedList = document.createElement("ul");
    visited.appendChild(visitedList);

    /*  Printar ut vilka städer som har besökts och befolkningsmängd samt summa på personer man mött */
    buttonUpdate.addEventListener("click", () => {
        visitedList.innerHTML = "";
        visitedList.style.display = "block";
        const visitedString = localStorage.getItem("visited");
        if (visitedString !== null) {
            const visitedArr = JSON.parse(visitedString);
            let peopleSeen = 0;
            for (i = 0; i < cityData.length; i++) {
                for (j = 0; j < visitedArr.length; j++) {
                    if (cityData[i].id === visitedArr[j].city) {
                        const visitedCountry = document.createElement("li");
                        visitedCountry.insertAdjacentHTML("beforeend", "<p>Stad: " +
                            cityData[i].stadname + "<br>Befolkning: " + all.formatNum.format(cityData[i].population) + "</p>");
                        visitedList.appendChild(visitedCountry);
                        peopleSeen += cityData[i].population;
                    }
                }
            }
            const peopleVisited = document.createElement("li");
            peopleVisited.insertAdjacentHTML("beforeend",
                "<p>När du har besökt dessa resmål har du haft möjligheten att stöta på " +
                all.formatNum.format(peopleSeen) + " personer.</p>");
            visitedList.appendChild(peopleVisited);
        }
    });

    /*  Delete i localstorage, samt i ul på städer jag har besökt och ta bort checkade boxar */
    buttonDelete.addEventListener("click", () => {
        localStorage.removeItem("visited");
        visitedList.innerHTML = "";
        fillVisited();
    });
}