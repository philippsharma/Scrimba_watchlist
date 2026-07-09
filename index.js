// shared elements

let watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
                


// index.html elements

const searchForm = document.getElementById("search-form")
const movieSearchField = document.getElementById("movie-search-field")
const indexMovieListCont = document.getElementById("index-movie-list")
const startExploringCont = document.getElementById("start-exploring-cont")
const errorCont = document.getElementById("error-cont")
const errorText = document.getElementById('error-text')

const plusSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
width="20" height="20">
<path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clip-rule="evenodd" />
</svg>`

const tickSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height="20" width="20">
<path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
</svg>`

const addedToWatchlistP = `<p class="movie-el-added-text"> ${tickSVG} Added to watchlist</p>`

// watchlist.html elements

const watchlistCont = document.getElementById("watchlist-movie-list")
const emptyWatchlistCont = document.getElementById("empty-watchlist-cont")
const addMoviesBtn = document.getElementById("add-movies-btn")

const minusSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"      
fill="currentColor" width="20" height="20">
<path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z" clip-rule="evenodd" />
</svg> `


//common functionality

async function getFullMovieList(list){
    let promises = list.map(async (el) => {
        const response = await fetch(`https://www.omdbapi.com/?apikey=1d30fd20&i=${el}&type=movie`)
        const movie = await response.json()
        return movie
    })
    
    const fullMovieList = await Promise.all(promises)
    return fullMovieList 
}

function getMovieListHTML(movieList, watchlist, useAddBtn){
    let returnHTML = ""
    let btnHTML = ""
    
    movieList.forEach((el)=>{
    
        if (useAddBtn) {
        btnHTML = watchlist.includes(el.imdbID) ? addedToWatchlistP : `<button class="add-to-watchlist-btn" data-id="${el.imdbID}"> ${plusSVG} Watchlist</button>`
        
        } else {
            btnHTML = `<button class="remove-from-watchlist-btn" data-id="${el.imdbID}">${minusSVG} Remove</button>`
        }
        
        returnHTML += `
            <li>
                <div class = "movie-el index-movie-el">
                    <img src="${el.Poster}" onerror="this.onerror=null; this.src='images/sans-affiche.png';" alt="poster of the movie ${el.Title}" class="movie-el-poster">
                    <div class="movie-el-info-cont index-movie-el-info-cont">
                        <div class="movie-el-title-cont">
                            <h3 class="movie-el-title">${el.Title}</h3>
                            <p class="movie-el-rating">⭐️  ${el.imdbRating}</p>
                        </div>
                        <div class="movie-el-attributes-cont index-movie-el-attributes-cont">
                            <p class="movie-el-watchtime">${el.Runtime}</p>
                            <p class="movie-el-genres">${el.Genre}</p>
                            ${btnHTML}
                        </div>
                        <p class="movie-el-plot clamped">${el.Plot}</p>
                        <button class="read-more-btn">Read More</button>
                    </div>
                </div>
            </li>
        `
    })
    
    return returnHTML
}

function btnClick(e) {
    const button = e.target
    
    if (button.classList.contains("read-more-btn")) {
        const plotCont = button.closest("div").querySelector(".movie-el-plot")
        plotCont.classList.toggle("clamped")
        button.textContent = plotCont.classList.contains("clamped") ? "Read More" : "Read Less"
    }
    
    if (button.classList.contains("add-to-watchlist-btn")) {
            const movieId = button.dataset.id
            let watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
            if (!watchlist.includes(movieId)) {
                watchlist.push(movieId)
                localStorage.setItem("watchlist", JSON.stringify(watchlist))
            }
            button.outerHTML = addedToWatchlistP
        }
    
    if (button.classList.contains("remove-from-watchlist-btn")){
            const movieId = e.target.dataset.id
            let watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
            watchlist.splice(watchlist.indexOf(movieId), 1)
            localStorage.setItem("watchlist", JSON.stringify(watchlist))
            
            const listItem = button.closest("li");
            listItem.remove();
            
            if (watchlist.length === 0) {
            emptyWatchlistCont.classList.remove("hidden");
            }
        }
}

function checkTextTruncation(){
    const plotConts = document.querySelectorAll(".movie-el-plot")
    
    if (plotConts) {
        plotConts.forEach(plotCont => {
            const readMoreBtn = plotCont.closest("div").querySelector(".read-more-btn")
            const isCurrentlyExpanded = !plotCont.classList.contains("clamped")
            plotCont.classList.add("clamped")
            const needsButton = plotCont.scrollHeight > plotCont.clientHeight
            
            if (isCurrentlyExpanded) {
            plotCont.classList.remove('clamped');
            }
            
            if (needsButton) {
                readMoreBtn.style.display = "inline"
            } else {
                readMoreBtn.style.display = 'none';
            }
        })
    }
}

window.addEventListener('DOMContentLoaded', checkTextTruncation);

window.addEventListener('resize', checkTextTruncation);

// index.html functionality

if (errorCont) {
errorCont.classList.add("hidden")
}

if (searchForm) {
    searchForm.addEventListener("submit", async (e)=> {
    e.preventDefault()
    const title = movieSearchField.value 
    const response = await fetch(`https://www.omdbapi.com/?apikey=1d30fd20&s=${title}&type=movie`)
    const data = await response.json()
    if (data["Response"]  == "True"){
        const movieListIncomplete = data["Search"]
        const idList = movieListIncomplete.map(el=>el.imdbID)
        const movieList = await getFullMovieList(idList)
        renderIndexMovieListCont(movieList)
    } else {
        renderErrorCont(data["Error"])
    }
})
}

if (indexMovieListCont) {
    indexMovieListCont.addEventListener("click", btnClick)
}

function renderErrorCont(message){
    startExploringCont.classList.add("hidden")
    indexMovieListCont.classList.add("hidden")
    errorCont.classList.remove("hidden")
    errorText.innerText = `${message} \n Please try another search term`
}


function renderIndexMovieListCont(list) {
    startExploringCont.classList.add("hidden")
    errorCont.classList.add("hidden")
    indexMovieListCont.classList.remove("hidden")
    
    indexMovieListCont.innerHTML = ""
    watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
    
    let listHTML = getMovieListHTML(list, watchlist, true)
    indexMovieListCont.innerHTML = listHTML
    checkTextTruncation()
}

//watchlist.html functionality

if (emptyWatchlistCont) {
    watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
    if (watchlist.length == 0) {
        emptyWatchlistCont.classList.remove("hidden")
    } else {
        renderWatchlistCont()
    }
}

if (watchlistCont) {
    watchlistCont.addEventListener("click", btnClick)
}

async function renderWatchlistCont() {
    emptyWatchlistCont.classList.add("hidden")
    watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
    
    let movieList = await getFullMovieList(watchlist)
    let listHTML = getMovieListHTML(movieList, watchlist, false)
    watchlistCont.innerHTML = listHTML
    checkTextTruncation()
}

