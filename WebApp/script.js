
let luggage = [];
let currentLevel = 0;

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
            `${json[i].Name}.png`
        );
    }
}

function removeLuggage() {
    const container = document.getElementById("container");
    for(let i = 0; i < luggage.length; i++) {
        container.removeChild(luggage[i]);
    }
    luggage = [];
}

function switchLuggage(checkbox) {
    if(checkbox.checked) {
        createLuggage(document.getElementById("luggage-frame"));
    } else {
        removeLuggage();
    }
}

function createPoint(x, y, name, image) {
    const container = document.getElementById("container");
    const element = document.createElement("div");
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

function previousLevel() {
    loadLevel(currentLevel - 1);
}

function nextLevel() {
    loadLevel(currentLevel + 1);
}

function loadLevel(level) {
    if(level < 0 || level > 1) {
        return;
    }
    removeLuggage();
    currentLevel = level;
    document.getElementById("map").setAttribute("src", "./data/level_" + level + ".png");
    document.getElementById("luggage-frame").src = "./data/level_" + level + "_luggage.json"; 
}