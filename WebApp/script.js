
let currentLevel = 0;
const maxLevel = 4;

// Info

function createInfo(frame) {
    const frameDocument = frame.contentDocument || frame.contentWindow.document;
    const rawText = frameDocument.documentElement.textContent;
    const json = JSON.parse(rawText);
    let lastUpdateDate = new Date(json.DataTimestamp * 1000);
    document.getElementById("settings-lastupdated").innerText = lastUpdateDate.toLocaleDateString() + " " + lastUpdateDate.toLocaleTimeString();
    const nextUpdate = document.getElementById("settings-nextupdate");

    const now = new Date();

    const todayUpdate = new Date(now);
    todayUpdate.setUTCHours(17, 0, 0, 0);

    const expectedUpdate = new Date(todayUpdate);

    if(now < todayUpdate) {
        expectedUpdate.setUTCDate(expectedUpdate.getUTCDate() - 1);
    }

    if(lastUpdateDate < expectedUpdate) {
        nextUpdate.innerText = "SOON!";
        return;
    }

    let targetDate = new Date(todayUpdate);

    if(now >= targetDate) {
        targetDate.setUTCDate(targetDate.getUTCDate() + 1);
    }

    setInterval(() => {
        const currentTime = new Date();
        let diff = targetDate - currentTime;

        if(diff <= 0) {
            nextUpdate.innerText = "Refresh the page";
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const pad = num => String(num).padStart(2, '0');

        nextUpdate.innerText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }, 1000);
    
}

// Luggage

let luggage = [];

function createLuggage(frame) {
    const frameDocument = frame.contentDocument || frame.contentWindow.document;
    const rawText = frameDocument.documentElement.textContent;
    const json = JSON.parse(rawText);
    if(!document.getElementById("luggage-checkbox").checked) {
        return;
    }
    for(let i = 0; i < json.length; i++) {
        luggage[i] = createPoint(
            "luggage" + currentLevel,
            json[i].PositionOnScreen[0], 
            json[i].PositionOnScreen[1], 
            json[i].Name,
            "red",
            `${json[i].Name}.png`
        );
    }
}

function removeLuggage(level) {
    removePoints("luggage" + level);
}

function switchLuggage(checkbox) {
    if(checkbox.checked) {
        createLuggage(document.getElementById("luggage-frame"));
    } else {
        removeLuggage(currentLevel);
    }
    updateZoom();
}

// Belltowers

let belltowers = [];

function createBelltowers(frame) {
    const frameDocument = frame.contentDocument || frame.contentWindow.document;
    const rawText = frameDocument.documentElement.textContent;
    const json = JSON.parse(rawText);
    if(!document.getElementById("belltowers-checkbox").checked) {
        return;
    }
    for(let i = 0; i < json.length; i++) {
        belltowers[i] = createPoint(
            "belltower" + currentLevel,
            json[i].PositionOnScreen[0], 
            json[i].PositionOnScreen[1], 
            json[i].Name,
            "purple",
            `${json[i].Name}.png`
        );
    }
}

function removeBelltowers(level) {
    removePoints("belltower" + level);
}

function switchBelltowers(checkbox) {
    if(checkbox.checked) {
        createBelltowers(document.getElementById("belltowers-frame"));
    } else {
        removeBelltowers(currentLevel);
    }
    updateZoom();
}

// Capybara

let capybara = [];

function createCapybara(frame) {
    const frameDocument = frame.contentDocument || frame.contentWindow.document;
    const rawText = frameDocument.documentElement.textContent;
    const json = JSON.parse(rawText);
    if(!document.getElementById("capybara-checkbox").checked) {
        return;
    }
    for(let i = 0; i < json.length; i++) {
        capybara[i] = createPoint(
            "capybara" + currentLevel,
            json[i].PositionOnScreen[0], 
            json[i].PositionOnScreen[1], 
            json[i].Name,
            "brown",
            `${json[i].Name}.png`
        );
    }
}

function removeCapybara(level) {
    removePoints("capybara" + level);
}

function switchCapybara(checkbox) {
    if(checkbox.checked) {
        createCapybara(document.getElementById("capybara-frame"));
    } else {
        removeCapybara(currentLevel);
    }
    updateZoom();
}

// Tomb

let tomb = [];

function createTomb(frame) {
    const frameDocument = frame.contentDocument || frame.contentWindow.document;
    const rawText = frameDocument.documentElement.textContent;
    const json = JSON.parse(rawText);
    if(!document.getElementById("tomb-checkbox").checked) {
        return;
    }
    for(let i = 0; i < json.length; i++) {
        tomb[i] = createPoint(
            "tomb" + currentLevel,
            json[i].PositionOnScreen[0], 
            json[i].PositionOnScreen[1], 
            json[i].Name,
            "gold",
            `${json[i].Name}.png`
        );
    }
}

function removeTomb(level) {
    removePoints("tomb" + level);
}

function switchTomb(checkbox) {
    if(checkbox.checked) {
        createTomb(document.getElementById("tomb-frame"));
    } else {
        removeTomb(currentLevel);
    }
    updateZoom();
}


// General

function createPoint(clazz, x, y, name, borderColor, image) {
    const container = document.getElementById("container");
    const element = document.createElement("div");
    element.classList.add(clazz);
    element.classList.add("point");
    element.style = `--x: ${x}; --y: ${y}`;
    element.style.borderColor = borderColor;
    element.style.backgroundImage = `url('./images/${image}')`;
    element.addEventListener("mouseover", () => {
        document.getElementById("item-popup").style.opacity = 1;
        document.getElementById("item-popup-name").innerText = name;
        document.getElementById("item-popup-image").style.backgroundImage = element.style.backgroundImage;
    });
    element.addEventListener("mouseleave", () => {
        document.getElementById("item-popup").style.opacity = 0;
    });
    container.appendChild(element);
    return element;
}

function removePoints(clazz) {
    const container = document.getElementById("container");
    const elements = Array.from(document.getElementsByClassName(clazz));
    elements.forEach(element => {
        container.removeChild(element);
    });
}

function removeAll(level) {
    removeLuggage(level);
    removeBelltowers(level);
    removeCapybara(level);
    removeTomb(level);
}

function previousLevel() {
    loadLevel(currentLevel - 1);
}

function nextLevel() {
    loadLevel(currentLevel + 1);
}

function loadLevel(level) {
    if(level < 0) {
        loadLevel(maxLevel);
        return;
    }
    if(level > maxLevel) {
        loadLevel(0);
        return;
    }
    
    console.log("Loading level: " + level);

    const buttons = document.getElementsByTagName("button");
    for(let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
    }

    zoom = 1;
    zoomTop = 0;
    zoomLeft = 0;
    updateZoom();

    removeAll(currentLevel);

    currentLevel = level;
    
    let map = document.getElementById("map");
    map.loading = true;
    let newImage = new Image();
    newImage.onload = function() {
        requestAnimationFrame(() => {
            map.src = this.src;
            requestAnimationFrame(() => {
                map.loading = false;
                document.getElementById("luggage-frame").src = "./data/level_" + level + "_luggage.json" + getURLAddition(); 
                document.getElementById("belltowers-frame").src = "./data/level_" + level + "_belltowers.json" + getURLAddition(); 
                document.getElementById("capybara-frame").src = "./data/level_" + level + "_capybara.json" + getURLAddition(); 
                document.getElementById("tomb-frame").src = "./data/level_" + level + "_tomb.json" + getURLAddition(); 
                for(let i = 0; i < buttons.length; i++) {
                    buttons[i].disabled = false;
                }
            });
        });
    }
    newImage.src = "./data/level_" + level + ".png" + getURLAddition();
}