
let currentLevel = 0;
const maxLevel = 4;

// Info

function downloadAndCreateInfo() {
    fetch("./data/info.json" + getURLAddition())
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            createInfo(json);
        });
}

function createInfo(json) {
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

downloadAndCreateInfo();

// Luggage

let luggage = [];

function createLuggage(level) {
    const container = document.getElementById("container");
    if(!document.getElementById("luggage-checkbox").checked) {
        return;
    }
    if(typeof luggage[level] != "undefined") {
        for(let i = 0; i < luggage[level].length; i++) {
            container.appendChild(luggage[level][i]);
        }
        Promise.resolve();
        return;
    }
    fetch("./data/level_" + level + "_luggage.json" + getURLAddition())
        .then(function(response) {
            return response.json();
        }) 
        .then(function(json) {
            luggage[level] = [];
            for(let i = 0; i < json.length; i++) {
                luggage[level][i] = createPoint(
                    "luggage",
                    json[i].PositionOnScreen[0], 
                    json[i].PositionOnScreen[1], 
                    json[i].DisplayName,
                    `${json[i].Name}.png`
                );
            }
        });
}

function removeLuggage(level) {
    removePoints("luggage", level);
}

function switchLuggage(checkbox) {
    if(checkbox.checked) {
        createLuggage(currentLevel);
    } else {
        removeLuggage(currentLevel);
    }
    updateZoom();
}

// Belltowers

let belltowers = [];

function createBelltowers(level) {
    const container = document.getElementById("container");
    if(!document.getElementById("belltowers-checkbox").checked) {
        return;
    }
    if(typeof belltowers[level] != "undefined") {
        for(let i = 0; i < belltowers[level].length; i++) {
            container.appendChild(belltowers[level][i]);
        }
        Promise.resolve();
        return;
    }
    fetch("./data/level_" + level + "_belltowers.json" + getURLAddition())
        .then(function(response) {
            return response.json();
        }) 
        .then(function(json) {
            belltowers[level] = [];
            for(let i = 0; i < json.length; i++) {
                belltowers[level][i] = createPoint(
                    "belltower",
                    json[i].PositionOnScreen[0], 
                    json[i].PositionOnScreen[1], 
                    json[i].DisplayName,
                    `${json[i].Name}.png`
                );
            }
        });
}

function removeBelltowers(level) {
    removePoints("belltower", level);
}

function switchBelltowers(checkbox) {
    if(checkbox.checked) {
        createBelltowers(currentLevel);
    } else {
        removeBelltowers(currentLevel);
    }
    updateZoom();
}

// Animals

let animals = [];

function createAnimals(level) {
    const container = document.getElementById("container");
    if(!document.getElementById("animals-checkbox").checked) {
        return;
    }
    if(typeof animals[level] != "undefined") {
        for(let i = 0; i < animals[level].length; i++) {
            container.appendChild(animals[level][i]);
        }
        Promise.resolve();
        return;
    }
    fetch("./data/level_" + level + "_animals.json" + getURLAddition())
        .then(function(response) {
            return response.json();
        }) 
        .then(function(json) {
            animals[level] = [];
            for(let i = 0; i < json.length; i++) {
                animals[level][i] = createPoint(
                    "animals",
                    json[i].PositionOnScreen[0], 
                    json[i].PositionOnScreen[1], 
                    json[i].DisplayName,
                    `${json[i].Name}.png`
                );
            }
        });
}

function removeAnimals(level) {
    removePoints("animals", level);
}

function switchAnimals(checkbox) {
    if(checkbox.checked) {
        createAnimals(currentLevel);
    } else {
        removeAnimals(currentLevel);
    }
    updateZoom();
}

// Amulets

let amulets = [];

function createAmulets(level) {
    const container = document.getElementById("container");
    if(!document.getElementById("amulets-checkbox").checked) {
        return;
    }
    if(typeof amulets[level] != "undefined") {
        for(let i = 0; i < amulets[level].length; i++) {
            container.appendChild(amulets[level][i]);
        }
        Promise.resolve();
        return;
    }
    fetch("./data/level_" + level + "_amulets.json" + getURLAddition())
        .then(function(response) {
            return response.json();
        }) 
        .then(function(json) {
            amulets[level] = [];
            for(let i = 0; i < json.length; i++) {
                amulets[level][i] = createPoint(
                    "amulets",
                    json[i].PositionOnScreen[0], 
                    json[i].PositionOnScreen[1], 
                    json[i].DisplayName,
                    `${json[i].Name}.png`
                );
            }
        });
}

function removeAmulets(level) {
    removePoints("amulets", level);
}

function switchAmulets(checkbox) {
    if(checkbox.checked) {
        createAmulets(currentLevel);
    } else {
        removeAmulets(currentLevel);
    }
    updateZoom();
}

// General

function createPoint(clazz, x, y, name, image) {
    const container = document.getElementById("container");
    const element = document.createElement("div");
    element.classList.add(clazz);
    element.classList.add("point");
    element.style = `--x: ${x}; --y: ${y}`;
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
    removeAnimals(level);
    removeAmulets(level);
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
            Promise.all([
                createLuggage(level),
                createBelltowers(level),
                createAnimals(level),
                createAmulets(level)
            ]).then(() => {
                requestAnimationFrame(() => {
                    map.loading = false;
                    for(let i = 0; i < buttons.length; i++) {
                        buttons[i].disabled = false;
                    }
                });
            });
        });
    }
    newImage.src = "./data/level_" + level + ".png" + getURLAddition();
}

document.addEventListener("DOMContentLoaded", () => {
    loadLevel(0);
});