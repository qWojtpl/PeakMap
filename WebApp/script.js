
let currentLevel = 0;
const maxLevel = 3;

// Info

function createInfo(frame) {
    const frameDocument = frame.contentDocument || frame.contentWindow.document;
    const rawText = frameDocument.documentElement.textContent;
    const json = JSON.parse(rawText);
    let date = new Date(json.DataTimestamp * 1000);
    document.getElementById("settings-lastupdated").innerText = date.toLocaleDateString() + " " + date.toLocaleTimeString();
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
                document.getElementById("luggage-frame").src = "./data/level_" + level + "_luggage.json"; 
                document.getElementById("belltowers-frame").src = "./data/level_" + level + "_belltowers.json"; 
                document.getElementById("capybara-frame").src = "./data/level_" + level + "_capybara.json"; 
                document.getElementById("tomb-frame").src = "./data/level_" + level + "_tomb.json"; 
                for(let i = 0; i < buttons.length; i++) {
                    buttons[i].disabled = false;
                }
            });
        });
    }
    newImage.src = "./data/level_" + level + ".png";
}

// Zoom

let zoom = 1;
let zoomTop = 0;
let zoomLeft = 0;
let dragStartX = 0;
let dragStartY = 0;

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("container");
    document.addEventListener("wheel", (e) => {
        if(e.deltaY > 0) {
            if(zoom > 1) {
                zoom -= 0.5;
            } else {
                zoomTop = 0;
                zoomLeft = 0;
            }
        } else if(e.deltaY < 0) {
            if(zoom < 19.5) {
                zoom += 0.5;
            }
        }
        updateZoom();
    });
    container.addEventListener("dragstart", (e) => {
        dragStartX = e.screenX;
        dragStartY = e.screenY;
    });
    container.addEventListener("dragover", (e) => {
        if(zoom == 1) {
            return;
        }
        let deltaX = dragStartX - e.screenX;
        zoomLeft -= deltaX;
        
        let deltaY = dragStartY - e.screenY;
        zoomTop -= deltaY;

        dragStartX = e.screenX;
        dragStartY = e.screenY;

        updateZoom();
    });
});

function updateZoom() {
    const container = document.getElementById("container");
    
    if(zoom == 1) {
        zoomLeft = 0;
        zoomTop = 0;
    } else {
        const parent = container.parentElement || document.body;
        const rect = parent.getBoundingClientRect();
        
        const maxShiftX = (rect.width * (zoom - 1)) / 2;
        const maxShiftY = (rect.height * (zoom - 1)) / 2;
        zoomLeft = Math.max(-maxShiftX, Math.min(maxShiftX, zoomLeft));
        zoomTop = Math.max(-maxShiftY, Math.min(maxShiftY, zoomTop));
    }
    
    container.style.transform = `scale(${zoom})`;
    container.style.top = `${zoomTop}px`;
    container.style.left = `${zoomLeft}px`;

    let points = document.getElementsByClassName("point");
    let size = 4 - zoom;
    if(size < 1) {
        size = 1;
    }
    for(let i = 0; i < points.length; i++) {
        points[i].style.width = `${size}vmin`;
        points[i].style.height = `${size}vmin`;
        points[i].style.borderWidth = `${size / 10}vmin`;
    }
    if(zoom == 1) {
        document.getElementById("settings").style.position = "absolute";
    } else {
        document.getElementById("settings").style.position = "fixed";
    }
}