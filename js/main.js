//Attributes
const GIPHY_KEY = "fBi5Q6X5qeSHkNA2C0a2V1CRAotgOxiL";
const prefix = "jnp5616-";
const searchKey = prefix + "search-terms";
let url = "";
let index = 0;
let displayTerm = "";
let items = [];
let searchItems = JSON.parse(localStorage.getItem(searchKey));
    
// 1
const init = () => {
    //set up buttons
    document.querySelector("#search-btn").onclick = searchButtonClicked;
    document.querySelector("#next-btn").onclick = nextButtonClicked;
    document.querySelector("#previous-btn").onclick = previousButtonClicked;
    //load trending gifs
    document.querySelector("#trending-btn").onclick = trendingItems;
    trendingItems();
    document.querySelector("#status").innerHTML = "Ready to search!";

    //set the search options to items from local storage
    if(searchItems != null){
        for(let i = 0; i < searchItems.length; i++){
            let node = document.createElement("option");
            node.value = searchItems[i];
            document.querySelector("#previous-searches").appendChild(node);
            items.push(searchItems[i]);
        }
    }
};

//get current trending GIFs on load or click on Trending button
const trendingItems = () => {
    //url for trending gifs
    const GIPHY_URL = "https://api.giphy.com/v1/gifs/trending?"

    url = GIPHY_URL; 
    url += "api_key=" + GIPHY_KEY;
        
    let limit = document.querySelector("#limit-select").value;

    url += "&limit=" + limit;

    index = 0;

    //update status
    document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here is what is trending!</i></p>";

    //get gifs
    getData(url);
};

//adjust the index when next button is clicked
const nextButtonClicked = () => {
    //set index for new gifs
    let offset = parseInt(document.querySelector("#limit-select").value);
    index += offset;
    //check if index is in bounds
    if(index > 4999){
        index -= index;
    }

    //get new gifs
    getData(url);
};

//adjust the index when previous button is clicked
const previousButtonClicked = () => {
    //set index for new gifs
    let offset = parseInt(document.querySelector("#limit-select").value);
    index -= offset;
    //check for valid index
    if(index < 0){
        index = 0;
    }

    //get new gifs
    getData(url);
};

//Search Button - search for gifs with a term
const searchButtonClicked = () => {
    //reset the index
    index = 0;
		
    // create url for searching gifs with inputed term
    const GIPHY_URL = "https://api.giphy.com/v1/gifs/search?";

    url = GIPHY_URL;
    url += "api_key=" + GIPHY_KEY;

    let term = document.querySelector("#search-input").value;

    //display message if user doesn't input term
    if(displayTerm == ""){
        document.querySelector("#status").innerHTML = "<b>Please enter a search term!</b>";
    }

    displayTerm = term;

    // add display term to local storage, if not already added
    if(displayTerm != "" && isRepeat(displayTerm) == false){
        items.push(displayTerm);
        localStorage.setItem(searchKey, JSON.stringify(items));
    }

    term = term.trim();

    term = encodeURIComponent(term);

    if(term.length < 1) return;

    url += "&q=" + term;

    let limit = document.querySelector("#limit-select").value;
    url += "&limit=" + limit;

    document.querySelector("#status").innerHTML = `<b>Searching for ${displayTerm}</b>`;

    getData(url);

    //Update the status
    document.querySelector("#status").innerHTML = `<b>Success!</b><p><i>Here are ${limit} results for "${displayTerm}"</i>!</p>`;
};

const getData = url => {
    if (displayTerm != "") {
        document.querySelector("#loader").innerHTML = `<img id="loading" src="images/spinner.gif" alt="loading"></img>`;
    }

    //set offset value and add to URL
    url += "&offset=" + index;

    let xhr = new XMLHttpRequest();

    xhr.onload = dataLoaded;
    xhr.onerror = dataError;

    xhr.open("GET", url);
    xhr.send();
};

const dataLoaded = e => {
    let xhr = e.target;

    let obj = JSON.parse(xhr.responseText);

    //if there are no results, print a message and return
    if(!obj.data || obj.data.length == 0){
        document.querySelector("#status").innerHTML = `<b>No results found for ${displayTerm}</b>`;
        document.querySelector("#content").innerHTML = "";
        document.querySelector("#loader").innerHTML = "";
        return;
    }

    // start building an HTML string to display to user
    let results = obj.data;
    let bigString = "";

    for(let i=0; i < results.length; i++){
        let result = results[i];

        //get the url to the gif
        let smallURL = result.images.fixed_width_downsampled.url;
        if(!smallURL) smallURL = "../images/no-image-found.png";

        //get the url to the giphy page
        let url = result.url;

        //build a <div> to hold each result
        let line = `<div class='result'><img src='${smallURL}' title = '${result.id}' />`;
        line += `<span><a target='_blank' href = '${url}'>View on Giphy!</a></span><p>Rating: ${result.rating.toUpperCase()}</p></div>`;

        //add the divs to bigString and loop
        bigString += line;
    }

    document.querySelector("#content").innerHTML = bigString;
    document.querySelector("#loader").innerHTML = "";
};

const dataError = e => {
    console.log("An error occurred");
};

//helper function to check for duplicates when adding search terms to storage
const isRepeat = e => {
    for(let i = 0; i < items.length; i++){
        if(e == items[i]){
            return true;
        }
    }
    return false;
};

export {init};