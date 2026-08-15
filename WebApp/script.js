
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
    if(level < 0) {
        loadLevel(maxLevel);
        return;
    }
    if(level > maxLevel) {
        loadLevel(0);
        return;
    }
    zoom = 1;
    zoomTop = 0;
    zoomLeft = 0;
    updateZoom();

    removeLuggage();
    removeBelltowers();
    currentLevel = level;
    
    let map = document.getElementById("map");
    map.loading = true;
    let newImage = new Image();
    newImage.onload = function() {
        requestAnimationFrame(() => {
            map.src = this.src;
            document.getElementById("luggage-frame").src = "./data/level_" + level + "_luggage.json"; 
            document.getElementById("belltowers-frame").src = "./data/level_" + level + "_belltowers.json"; 
            requestAnimationFrame(() => {
                map.loading = false;
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
        let deltaX = (dragStartX - e.screenX) / 10;
        zoomLeft -= deltaX;
        
        let deltaY = (dragStartY - e.screenY) / 10;
        zoomTop -= deltaY;

        updateZoom();
    });
});

function updateZoom() {
    const container = document.getElementById("container");
    container.style.transform = `scale(${zoom})`;
    container.style.top = `${zoomTop}px`;
    container.style.left = `${zoomLeft}px`;

    let points = document.getElementsByClassName("point");
    let size = 3 - zoom / 2;
    if(size < 0.3) {
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