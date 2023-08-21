let slideIndex = 1;

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

async function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("slide");
  if (slides.length == 0) {
    return
  }
  if (n > slides.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = slides.length }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex - 1].style.display = "block";
}


//---------------------------------------------------------------


fetchSteamAppIDs().then(async (steamAppIDs) => {
  steamAppIDs = steamAppIDs["applist"]["apps"]
  steamAppIDs.forEach((x) => x.name = x.name.toLowerCase())
  var humbleGamesList = document.getElementsByClassName("selector-content")
  for (var gameSelector of humbleGamesList) {
    const gameName = gameSelector.querySelector(".text-holder").querySelector("h2").title.toLowerCase()

    const steamID = await getSteamID(steamAppIDs, gameName)
    if (steamID == -1) {
      continue
    }

    gameSelector.onclick = () => { manipulateDetailsWindow(gameName, steamID) }
    gameSelector.parentElement.id = steamID
    if (gameSelector.querySelector(".icon")) {
      gameSelector.querySelector(".text-holder").remove()
      var newIcon = document.createElement("img")
      newIcon.src = `https://cdn.akamai.steamstatic.com/steam/apps/${steamID}/header.jpg`
      newIcon.className = "steamIconImg"
      gameSelector.querySelector(".icon").appendChild(newIcon)
    }
    if (gameSelector.parentElement.classList.contains("selected")) {
      await manipulateDetailsWindow(gameName, steamID)
    }
  }
})


async function fetchSteamAppIDs() {
  const response = await fetch("http://api.steampowered.com/ISteamApps/GetAppList/v0002/?key=STEAMKEY&format=json")
  return response.json()
}

async function fetchSteamAppInfo(steamID) {
  const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${steamID}`)
  return response.ok ? response.json() : -1
}

async function getSteamID(steamAppIDs, gameName) {
  const steamID = steamAppIDs.find((game) => game.name === gameName)
  return steamID ? steamID["appid"] : -1
}

async function manipulateDetailsWindow(gameName, steamID) {
  slideIndex = 1
  // console.log(`${gameName}, ${steamID}`)
  const steamAppInfo = await fetchSteamAppInfo(steamID)

  if (steamAppInfo == -1 || !steamAppInfo[steamID]["success"]) {
    console.log(`Somehow the game ${gameName.toLocaleUpperCase()} with steam ID ${steamID} is not accessible.`)
    return
  }

  var steamGallery = makeSteamGallery(steamID, steamAppInfo)
  var infoText = makeInfoText(steamID, steamAppInfo)
  var steamDetails = document.querySelector(".details-heading")
  steamDetails.replaceChildren()
  steamDetails.appendChild(steamGallery)
  steamDetails.appendChild(infoText)

  await showSlides(slideIndex)

  var steamLogo = document.getElementsByClassName("steam").item(0).querySelector("h3")
  var steamStorePageLink = document.createElement("a")
  steamStorePageLink.setAttribute("href", `https://store.steampowered.com/app/${steamID}`)
  steamStorePageLink.setAttribute("target", "_blank")
  steamStorePageLink.setAttribute("referrerpolicy", "no-referrer")
  steamLogo.parentNode.insertBefore(steamStorePageLink, steamLogo)
  steamStorePageLink.appendChild(steamLogo)
}


function makeSteamGallery(steamID, steamAppInfo) {
  slideIndex = 1
  var slideshowContainer = document.createElement("div")
  slideshowContainer.className = "slideshow-container"

  for (var video of steamAppInfo[steamID].data.movies) {
    var slide = document.createElement("div")
    slide.className = "slide fade"
    var videoNode = document.createElement("video")
    videoNode.setAttribute("controls", true)
    var webmSource = document.createElement("source")
    webmSource.setAttribute("src", video.webm.max.replace("http", "https"))
    webmSource.setAttribute("type", "video/webm")
    var mp4Source = document.createElement("source")
    mp4Source.setAttribute("src", video.mp4.max.replace("http", "https"))
    mp4Source.setAttribute("type", "video/mp4")
    videoNode.append(webmSource, mp4Source)
    slide.append(videoNode)
    slideshowContainer.appendChild(slide)
  }

  for (var screenshot of steamAppInfo[steamID].data.screenshots) {
    var slide = document.createElement("div")
    slide.className = "slide fade"
    var imgNode = document.createElement("img")
    imgNode.className = "gallery-image"
    imgNode.setAttribute("src", screenshot.path_full)
    slide.append(imgNode)
    slideshowContainer.appendChild(slide)
  }

  var aPrev = document.createElement("a")
  aPrev.className = "prev"
  aPrev.onclick = () => plusSlides(-1)
  aPrev.innerHTML = "❮"
  var aNext = document.createElement("a")
  aNext.className = "next"
  aNext.onclick = () => plusSlides(1)
  aNext.innerHTML = "❯"
  slideshowContainer.appendChild(aPrev)
  slideshowContainer.appendChild(aNext)

  return slideshowContainer
}

function makeInfoText(steamID, steamAppInfo) {
  const shortDescription = steamAppInfo[steamID].data.short_description
  var infoText = document.createElement("div")
  infoText.className = "info-text"
  infoText.innerText = shortDescription
  return infoText
}