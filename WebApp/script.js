

function updateLuggage(frame) {
    const frameDocument = frame.contentDocument || frame.contentWindow.document;
    const rawText = frameDocument.documentElement.textContent;
    const json = JSON.parse(rawText);
    for(let i = 0; i < json.length; i++) {
        createPoint(
            json[i].PositionOnScreen[0], 
            json[i].PositionOnScreen[1], 
            `${json[i].Name}.png`
        );
    }
}

function createPoint(x, y, image) {
    const container = document.getElementById("container");
    const element = document.createElement("div");
    element.classList.add("point");
    element.style = `--x: ${x}; --y: ${y}`;
    element.style.backgroundImage = `url('./images/${image}')`;
    container.appendChild(element);
}