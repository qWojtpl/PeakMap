
var cacheIdentifier = "?nocache";

function patchElements(elements) {
    for(let i = 0; i < elements.length; i++) {
        elements[i].src = elements[i].src + getURLAddition();
    }
}

function getURLAddition() {
    return "?nocache=" + cacheIdentifier;
}