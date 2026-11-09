let zoom = 1;
let minZoom = 1;
let panX = 0;
let panY = 0;
let dragStartX = 0;
let dragStartY = 0;
let lastTouches = null;

const MAX_ZOOM = 20;
const STEP = 0.15;

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("container");
    const map = document.getElementById("map");

    if (map) {
        map.addEventListener("load", () => initZoom(true));
    }
    window.addEventListener("resize", () => initZoom(false));

    initZoom(true);

    // zoom toward cursor position
    document.addEventListener("wheel", (e) => {
        if (is3DActive()) {
            return;
        }
        e.preventDefault();
        const factor = e.deltaY < 0 ? (1 + STEP) : (1 - STEP);
        zoomAt(e.clientX, e.clientY, factor);
    }, { passive: false });

    // mouse drag
    container.addEventListener("mousedown", (e) => {
        dragStartX = e.clientX;
        dragStartY = e.clientY;
    });

    document.addEventListener("mousemove", (e) => {
        if (!dragStartX || (e.buttons | e.button) !== 1 || is3DActive()) {
            return;
        }
        panX += e.clientX - dragStartX;
        panY += e.clientY - dragStartY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        applyZoom();
    });

    document.addEventListener("mouseup", () => {
        dragStartX = 0;
    });

    // mobile touch drag and pinch zoom
    container.addEventListener("touchstart", (e) => {
        e.preventDefault();
        lastTouches = e.touches;
    }, { passive: false });

    document.addEventListener("touchmove", (e) => {
        if (!lastTouches || lastTouches.length === 0) {
            return;
        }
        if (e.touches.length === 2 && lastTouches.length === 2) {
            e.preventDefault();
            const prev = getTouchInfo(lastTouches);
            const curr = getTouchInfo(e.touches);
            zoomAt(curr.x, curr.y, curr.dist / prev.dist);
            panX += curr.x - prev.x;
            panY += curr.y - prev.y;
        } else if (e.touches.length === 1 && lastTouches.length === 1) {
            e.preventDefault();
            panX += e.touches[0].clientX - lastTouches[0].clientX;
            panY += e.touches[0].clientY - lastTouches[0].clientY;
        }
        lastTouches = e.touches;
        applyZoom();
    }, { passive: false });

    document.addEventListener("touchend", () => {
        lastTouches = null;
    });
});

function getTouchInfo(touches) {
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2,
        dist: Math.hypot(dx, dy) || 1
    };
}

function zoomAt(cx, cy, factor) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ox = cx - vw / 2;
    const oy = cy - vh / 2;
    const newZoom = Math.min(MAX_ZOOM, Math.max(minZoom, zoom * factor));
    const scale = newZoom / zoom;
    panX = ox + (panX - ox) * scale;
    panY = oy + (panY - oy) * scale;
    zoom = newZoom;
    applyZoom();
}

function initZoom(resetState = false) {
    const container = document.getElementById("container");
    if (!container) {
        return;
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cw = container.offsetWidth || vw;
    const ch = container.offsetHeight || vh;

    // zoom to fit max viewport unit (width for landscape, height for portrait) and set that as the minimum zoom
    minZoom = Math.max(1, Math.max(vw / cw, vh / ch));
    if (resetState || zoom <= 1 || zoom < minZoom) {
        zoom = minZoom;
        panX = 0;
        panY = 0;
    }
    applyZoom();
}

function applyZoom() {
    const container = document.getElementById("container");
    if (!container) {
        return;
    }

    zoom = Math.min(MAX_ZOOM, Math.max(minZoom, zoom));

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxX = Math.max(0, (container.offsetWidth * zoom - vw) / 2);
    const maxY = Math.max(0, (container.offsetHeight * zoom - vh) / 2);
    panX = Math.max(-maxX, Math.min(maxX, panX));
    panY = Math.max(-maxY, Math.min(maxY, panY));

    container.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;

    const zoomReminder = document.getElementById("zoom-reminder");
    if (zoomReminder) {
        zoomReminder.style.display = zoom > minZoom + 0.01 ? 'none' : 'block';
    }

    let points = document.getElementsByClassName("point");
    let size = 4 - zoom;
    if (size < 1) {
        size = 1;
    }
    for (let i = 0; i < points.length; i++) {
        points[i].style.width = `${size}vmin`;
        points[i].style.height = `${size}vmin`;
        points[i].style.borderWidth = `${size / 10}vmin`;
    }
}

function updateZoom() {
    if (zoom <= 1) {
        initZoom(true);
    } else {
        applyZoom();
    }
}