console.log("Hej html!");
'use strict'

const app = { //Objekt som innehåller variabler, så de inte ligger i Globan Scope.

    visitedCitiesBtn: document.getElementById("visitedCitiesBtn"),
    countriesContainer: document.getElementById("countriesContainer"),
    infoRightSide: document.getElementById("infoRightSide"),
};

let citiciesArray = []; //Skapar en array för besökat städer
if (JSON.parse(localStorage.getItem('id') != null)){ //Lägger i arrayen in data som sparats i LocalStorage, om inte LS är null.
    citiciesArray = JSON.parse(localStorage.getItem('id'));
}

const getContries = async () => { //En function som fetchar länderna i land.json.
    const responseLand = await fetch ("https://nikbjo.herokuapp.com/country");
    const land = await responseLand.json();

    for (i = 0; i < land.length; i++){ //En loop som dynamiskt gör knappar av varje stad och lägger i den vänstra menyn. Lägger också in land-id:t som parameter till den funktion som attributet onklick kör.
        app.countriesContainer.insertAdjacentHTML('beforeend', '<div id="countryBtn" class="row"><a class="btn btn-primary" onclick="countryInfo('+land[i].id+')" role="button">'+land[i].countryname+'</a></div>');
    }
};
getContries() //Kallar på ovan funktion.

const countryInfo = async (countryId) => { // Funktion som skriver ut städerna för specifikt land, vid klick på landknappen.
    app.infoRightSide.innerHTML = ""; //Tömmer ev innnehåll i högra sidans informationscolumn.

    const responseLand = await fetch ("https://nikbjo.herokuapp.com/country"); //Hämtar data från filen land.json.
    const land = await responseLand.json();

    let country = land.find(a => a.id === countryId); //Lägger landets information i variabeln country genom att jämföra parametern som skickats med funktionen(countryId) med id i land.json.

    app.infoRightSide.insertAdjacentHTML('afterbegin', '<div id="header" class="row"><h1>'+country.countryname+'</h1></div><div id="countryRow" class="row"><h4>Städer:</h4></div>'); //Skriver ut lansdnamnet som rubrik samt kolumnrubrik.

    const responseStad = await fetch ("https://nikbjo.herokuapp.com/city"); //Hämtar information ur filen stad.json med fetch.
    const stad = await responseStad.json();

    for (i = 0; i < stad.length; i++){ //Loopar igenom alla städer i filen. 
        if (countryId === stad[i].countryid){ //Om de städer som har countryid som stämmer med den inmatade parametern (countryId), skrivs de ut i högra informationscolumnen. Plus "Besökt" switch och "Lär mer om..."
            app.infoRightSide.insertAdjacentHTML('beforeend', '<li class="border-top my-3"></li><h5>'+stad[i].stadname+'</h5><div class="form-check form-switch"><input class="form-check-input" type="checkbox" onclick="addCityToLocalStorage('+stad[i].id+')" id="'+stad[i].stadname+'"><label class="form-check-label" for="'+stad[i].stadname+'">Besökt</label></div><p><a id="readMoreBtn" class="btn btn-primary" data-bs-toggle="collapse"href="#collapse'+stad[i].id+'" role="button" aria-expanded="false"aria-controls="collapse'+stad[i].id+'">Läs mer om '+stad[i].stadname+'</a></p><div class="collapse" id="collapse'+stad[i].id+'"><div class="card card-body">Antal invånare i '+stad[i].stadname+' är '+stad[i].population+' människor.</div></div>');
            
            let LoStArray = JSON.parse(localStorage.getItem('id')); //Gör en array av sparad data i LocalStorage. Denna och if-satsen nedan gör att switcharna behålls aktiverade(Besökt) även vid uppdatering av sida.

            if (LoStArray){ //Om arryen inte är null.
                for (j = 0; j < LoStArray.length; j++){ //Loppar igenom arryen.
                    if (LoStArray[j] === stad[i].id){ //Om stad-id stämmer med nummer i arrayen, så sätter raden nedan attributet checked="true" på switchen med id="stadsnamn"
                        document.getElementById(stad[i].stadname).setAttribute('checked', 'true');
                    }
                }
            }
        }
    }
};

app.visitedCitiesBtn.addEventListener("click", async function(){ //En lyssnare som lyssnar efter klick på "Besökta städer"-knapp.
    app.infoRightSide.innerHTML = ""; //Rensar element i höger informationskolumn.

    const responseStad = await fetch ("https://nikbjo.herokuapp.com/city"); //Hämter information från filen stad.json.
    const stad = await responseStad.json();
    //Skriver ut rubrik, underrubrik samt kolumner i höger sidokolumn.
    app.infoRightSide.insertAdjacentHTML('afterbegin', '<div id="header" class="row"><h1>Besökta städer</h1></div><div id="CityAndCitizensRow" class="row"><div id="cityColumn" class="col"><h4>Stad:</h4></div><div id="residentsColumn" class="col"><h4>Antal invånare:</h4></div><li class="border-top my-3"></li></div><div id="visitedCities"></div>');
    
    let visitedCities = document.getElementById("visitedCities"); // Hämtar element med id och lägger i variabel.
    let sumOfAllCitiesPopulation = []; //Definierar en array.
    
    for (i = 0; i < citiciesArray.length; i++){ //Loopar igenom array och skriver ut alla besökta städer samt invånarantal.
        let visitedCity = stad.find(a => a.id === citiciesArray[i]); //Definierar variabel och sätter värdet till staden med samma id som i arryen.
        let cityPopulation = visitedCity.population; //Sätter variabel cityPopulation till befolkningsmängd för staden i variabeln visitedCity.
        visitedCity = visitedCity.stadname; //Sätter variabeln visitedCity till stadsnamnet.
        visitedCities.insertAdjacentHTML('beforeend','<div class="row"><div class="col"<h5>'+visitedCity+'</h5></div><div class="col"><p>'+cityPopulation+' st</p></div></div>'); //Sätter in element med information i DOM.
        sumOfAllCitiesPopulation.push(cityPopulation); //Lägger in invånarantal i array.
    }
    
    function sumArray(total, num) { //Funktion som returnerar total summa + tal i array.
        return total + num;
    }

    if (sumOfAllCitiesPopulation.length != 0){ //Om inte längden på arryen "sumOfAllCitiesPopulation" är noll, körs detta.
        let sumCities = sumOfAllCitiesPopulation.reduce(sumArray); //Funktionen reduce kör funktionen sumArray för alla tal i arrayen sumOfAllCitiesPopulation, vilket ger summan av alla tal i arrayen.
        visitedCities.insertAdjacentHTML('beforeend', '<a id="kuriosaBtn" class="btn btn-primary" data-bs-toggle="collapse" href="#kuriosaInfo" role="button" aria-expanded="true" aria-controls="kuriosaInfo" >Kuriosa om dina stadsbesök</a><div class="collapse show" id="kuriosaInfo" ><div class="card card-body">När du varit ute på dina resor i alla städer ovan, finns möjligheten att du skapat kontakt med '+sumCities+' st människor.</div>');
    }   //Raden ovan sätter in elementen för informationstexten "Kuriosa" i DOM. Text, uträkning samt knapp för att collapsa.

    app.infoRightSide.insertAdjacentHTML('beforeend', '<div id="clearHistoryBtn" class="row"><a class="btn btn-primary" onclick="clearLocalStorage()" role="button">Rensa besökshistoriken</a></div>');
    //Rad ovan sätter in knapp sist på "Besökta städer"-sida som rensar besöka städer-historik. Sätter attributet onklick till funktionen clearLocalStorage().
});

function addCityToLocalStorage(cityId){ //Funktion som lägger in "Besökta" städer i en array samt lägger in arrayen i LocalStorage.

    if (citiciesArray.length === 0){ //Om citiciesArray skulle vara tom så läggs stadsid:t in direkt i arrayen.
        citiciesArray.push(cityId);
    }
    else{ //Om inte tom, kollar denna loop om stadsid:t redan finns i arrayen. Om den gör det tas det bort (vilket innebär att switchen avaktiveras). Om id:t inte finns läggs det till i arrayen.
        let erase = false;
        for (i=0; i<citiciesArray.length; i++){ //Loopar igenom arrayen.
            if (citiciesArray[i] === cityId){ //Om id:t finna i arrayen
                citiciesArray = citiciesArray.filter(item => item != cityId); //Tar bort id:t.
                erase = true; //Sätter erase till true
            }
        }
        if (!erase){ //Om id:t inte finns i arrayen och har tagits bort, d.v.s. erase fortfarande är = false.
            citiciesArray.push(cityId); //Id:t läggs till i arrayen.
        }
    }

    localStorage.setItem('id', JSON.stringify(citiciesArray)); //Lägger till den juserade arrayen citiciesArray i LocalStorage, genom att göra den till en sträng med JSON.stringify.
}

function clearLocalStorage(){ //Funktion som rensar "Besökta städer"-historik.
    localStorage.clear(); //Tömmer LocalStorage.
    citiciesArray = []; //Tömmer array.
    let visitedCities = document.getElementById("visitedCities"); //Hämtar element som ska tas bort från DOM.
    visitedCities.innerHTML = ""; //Tar bort elementen i högra informationsfältet direkt vid knapptryckning.
}