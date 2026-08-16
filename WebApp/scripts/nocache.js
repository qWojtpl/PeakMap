
const cacheIdentifier = new Date().toLocaleDateString() + "," + (new Date().getUTCHours() < 17);

function patchElements(elements) {
    for(let i = 0; i < elements.length; i++) {
        elements[i].src = elements[i].src + getURLAddition();
    }
}

function getURLAddition() {
    return "?nocache=" + cacheIdentifier;
}

document.addEventListener("DOMContentLoaded", () => {
    patchElements(document.getElementsByTagName("iframe"));
    patchElements(document.getElementsByTagName("img"));
});