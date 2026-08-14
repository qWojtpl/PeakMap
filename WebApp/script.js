
let currentLevel = 0;
const maxLevel = 3;

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
            json[i].PositionOnScreen[0], 
            json[i].PositionOnScreen[1], 
            json[i].Name,
            "red",
            `${json[i].Name}.png`
        );
    }
}

function removeLuggage() {
    removePoints(luggage);
    luggage = [];
}

function switchLuggage(checkbox) {
    if(checkbox.checked) {
        createLuggage(document.getElementById("luggage-frame"));
    } else {
        removeLuggage();
    }
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
            json[i].PositionOnScreen[0], 
            json[i].PositionOnScreen[1], 
            json[i].Name,
            "purple",
            `${json[i].Name}.png`
        );
    }
}

function removeBelltowers() {
    removePoints(belltowers);
    belltowers = [];
}

function switchBelltowers(checkbox) {
    if(checkbox.checked) {
        createBelltowers(document.getElementById("belltowers-frame"));
    } else {
        removeBelltowers();
    }
}

// General

function createPoint(x, y, name, borderColor, image) {
    const container = document.getElementById("container");
    const element = document.createElement("div");
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

function removePoint(point) {
    const container = document.getElementById("container");
    container.removeChild(point);
}

function removePoints(pointsToRemove) {
    for(let i = 0; i < pointsToRemove.length; i++) {
        removePoint(pointsToRemove[i]);
    }
}

function previousLevel() {
    loadLevel(currentLevel - 1);
}

function nextLevel() {
    loadLevel(currentLevel + 1);
}

function loadLevel(level) {
    if(level < 0 || level > maxLevel) {
        return;
    }
    removeLuggage();
    removeBelltowers();
    currentLevel = level;
    document.getElementById("map").setAttribute("src", "./data/level_" + level + ".png");
    document.getElementById("luggage-frame").src = "./data/level_" + level + "_luggage.json"; 
    document.getElementById("belltowers-frame").src = "./data/level_" + level + "_belltowers.json"; 
}