

let checkboxes = [];
let lastAdditional = null;

function createAdditionalSettings() {
    const extend = document.getElementsByClassName("settings-extend");
    const additionalSettings = document.getElementById("additional-settings");
    additionalSettings.style.display = "none";

    for(let i = 0; i < extend.length; i++) {
        extend[i].addEventListener("click", () => {
            if(additionalSettings.style.display == "block") {
                additionalSettings.style.display = "none";
                return;
            }
            additionalSettings.style.display = "block";
            setupAdditionalSettings(extend[i].getAttribute("for"));
        });
    }
}

function setupAdditionalSettings(settingsFor) {
    if(lastAdditional != null) {
        if(lastAdditional == settingsFor) {
            return;
        }
    }
    lastAdditional = settingsFor;
    const settingsContainer = document.getElementById("additional-settings-container");
    checkboxes = [];
    settingsContainer.innerHTML = "";
    document.getElementById("additional-settings-title").innerText = settingsFor;
    if(settingsFor == "luggage") {
        createLuggageSettings();
    }
}

function createAdditionalSettingsEntry(group, name, image, special, createPointsFunction) {
    const settingsContainer = document.getElementById("additional-settings-container");
    let div = document.createElement("div");
    div.classList.add("settings-entry");
    
    let checkboxId = "additional-" + special + "-checkbox";

    let label = document.createElement("label");
    label.setAttribute("for", checkboxId);
    label.innerHTML = `<span class="icon" style="background-image:url('./images/${image}')"></span>${name}`;
    div.appendChild(label);
    
    let checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("id", checkboxId);
    checkbox.setAttribute("group", group);
    checkbox.setAttribute("special", special);
    checkbox.checked = true;
    checkboxes[checkboxes.length] = checkbox;
    div.appendChild(checkbox);

    checkbox.addEventListener("change", () => {
        removePoints(name);
        Promise.all([
            createPointsFunction(currentLevel)
        ]).then(() => {
            refreshAdditionalFilter();
        });
    });

    settingsContainer.appendChild(div);
}

function refreshAdditionalFilter() {
    for(let i = 0; i < checkboxes.length; i++) {
        if(!checkboxes[i].checked) {
            removePointsWithSpecial(checkboxes[i].getAttribute("group"), checkboxes[i].getAttribute("special"));
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    createAdditionalSettings();
});