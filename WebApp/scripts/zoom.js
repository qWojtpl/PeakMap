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
    container.addEventListener("mousedown", (e) => {
        dragStartX = e.screenX;
        dragStartY = e.screenY;
    });
    document.addEventListener("mousemove", (e) => {
        if(zoom == 1 || (e.buttons | e.button) !== 1) {
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
        document.getElementById("zoom-reminder").style.opacity = 1;
        document.getElementById("star-reminder").style.position = "absolute";
    } else {
        const parent = container.parentElement || document.body;
        const rect = parent.getBoundingClientRect();
        
        const maxShiftX = (rect.width * (zoom - 1)) / 2;
        const maxShiftY = (rect.height * (zoom - 1)) / 2;
        zoomLeft = Math.max(-maxShiftX, Math.min(maxShiftX, zoomLeft));
        zoomTop = Math.max(-maxShiftY, Math.min(maxShiftY, zoomTop));
        document.getElementById("zoom-reminder").style.opacity = 0;
        document.getElementById("star-reminder").style.position = "fixed";
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