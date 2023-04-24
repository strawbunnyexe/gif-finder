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
    window.onload = function(){
        //set up buttons
        document.querySelector("#search").onclick = searchButtonClicked;
        document.querySelector("#next").onclick = nextButtonClicked;
        document.querySelector("#previous").onclick = previousButtonClicked;
        //load trending gifs
        document.querySelector("#trending").onclick = trendingItems;
        trendingItems();
        document.querySelector("#status").innerHTML = "Ready to search!";

        //set the search options to items from local storage
        if(searchItems != null){
            for(let i = 0; i < searchItems.length; i++){
                let node = document.createElement("option");
                node.value = searchItems[i];
                document.querySelector("#previousSearches").appendChild(node);
                items.push(searchItems[i]);
            }
        }
    }

    //get current trending GIFs on load or click on Trending button
    function trendingItems(){
        //url for trending gifs
        const GIPHY_URL = "https://api.giphy.com/v1/gifs/trending?"

        url = GIPHY_URL; 
        url += "api_key=" + GIPHY_KEY;
        
        let limit = document.querySelector("#limit").value;

        url += "&limit=" + limit;

        index = 0;

        //update status
        document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here is what is trending!</i></p>";

        //get gifs
        getData(url);
    }

    //adjust the index when next button is clicked
    function nextButtonClicked(){
        //set index for new gifs
        let offset = parseInt(document.querySelector("#limit").value);
        index += offset;
        //check if index is in bounds
        if(index > 4999){
            index -= index;
        }

        //get new gifs
        getData(url);
    }

    //adjust the index when previous button is clicked
    function previousButtonClicked(){
        //set index for new gifs
        let offset = parseInt(document.querySelector("#limit").value);
        index -= offset;
        //check for valid index
        if(index < 0){
            index = 0;
        }
        console.log(index);

        //get new gifs
        getData(url);
    }

	//Search Button - search for gifs with a term
	function searchButtonClicked(){
        //reset the index
        index = 0;
		
        // create url for searching gifs with inputed term
        const GIPHY_URL = "https://api.giphy.com/v1/gifs/search?";

        url = GIPHY_URL;
        url += "api_key=" + GIPHY_KEY;

        let term = document.querySelector("#searchterm").value;

        //display message if user doesn't input term
        if(displayTerm == ""){
            document.querySelector("#status").innerHTML = "<b>Please enter a search term!<b>";
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

        let limit = document.querySelector("#limit").value;
        url += "&limit=" + limit;

        document.querySelector("#status").innerHTML = "<b>Searching for '" + displayTerm + "'<b>";

        getData(url);

        //Update the status
        document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here are " + limit + " results for '" + displayTerm + "'</i>!</p>";
	}

    function getData(url){
        if (displayTerm != "") {
            document.querySelector("#loader").innerHTML = `<img id="loading" src="images/spinner.gif" alt="loading"></img>`;
        }

        //set offset value and add to URL
        url += "&offset=" + index;

        // 1 - create a new XHR object
        let xhr = new XMLHttpRequest();

        // 2 - set the onload handler
        xhr.onload = dataLoaded;

        //3 - set the onerror handler
        xhr.onerror = dataError;

        //4 - open connection and send the request
        xhr.open("GET", url);
        xhr.send();
    }

    function dataLoaded(e){
        // 5- event.target is the xhr object
        let xhr = e.target;

        //6 - xhr.responseText is the JSON file we just downloaded
        //console.log(xhr.responseText);

        // 7 - turn the text into a parsable JavaScript object
        let obj = JSON.parse(xhr.responseText);

        //8 - if there are no results, printa message and return
        if(!obj.data || obj.data.length == 0){
            document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
            document.querySelector("#content").innerHTML = "";
            document.querySelector("#loader").innerHTML = "";
            return;
        }

        // 9 - start building an HTML string we will display to user
        let results = obj.data;
        //console.log("results.length = " + results.length);
        let bigString = "";

        //10 - loop through array of results
        for(let i=0; i < results.length; i++){
            let result = results[i];

            //11 - get the url to the gif
            let smallURL = result.images.fixed_width_downsampled.url;
            if(!smallURL) smallURL = "../images/no-image-found.png";

            //12 - get the url to the giphy page
            let url = result.url;

            //13 - build a <div> to hold each result
            let line = `<div class='result'><img src='${smallURL}' title = '${result.id}' />`;
            line += `<span><a target='_blank' href = '${url}'>View on Giphy!</a></span><p>Rating: ${result.rating.toUpperCase()}</p></div>`;

            //14 - another way of doing it
            // var line = "<div class = 'result'>";
            //     line += "<img src='";
            //     line += smallURL;
            //     line += "' title= '";
            //     line += "' />";

            //     line += "<span><a target='_blank' href='" + url + "'>View on Giphy</a></span>";
            //     line += "</div>";

            //15 - add the divs to bigString and loop
            bigString += line;
        }

        // 16 - all done building HTML
        document.querySelector("#content").innerHTML = bigString;

        document.querySelector("#loader").innerHTML = "";
    }

    function dataError(e){
        console.log("An error occurred");
    }

    //helper function to check for duplicates when adding search terms to storage
    function isRepeat(e){
        for(let i = 0; i < items.length; i++){
            if(e == items[i]){
                return true;
            }
        }
        return false;
    }
