
let currentBiome = 0;
const maxBiome = 4;
let nextMapUtcHour = 17;
let biomeJson;
let levelName;
let levels;
let todayDateKey;

// Info

function getTodayDateKey() {
    let now = new Date();
    if (now.getUTCHours() < nextMapUtcHour) {
        now.setUTCDate(now.getUTCDate() - 1);
    }
    return now.getUTCDate() + "-" + (now.getUTCMonth() + 1) + "-" + now.getUTCFullYear();
}

function downloadAndCreateInfo() {
    fetch("./data/info.json" + getURLAddition() + "&now=" + new Date().getTime())
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            dayLevels = json.LevelBiomes;
            todayDateKey = getTodayDateKey();
            console.log("Scene date: " + todayDateKey);
            const todayDateKeySplit = todayDateKey.split("-");
            const startDateSplit = json.StartDate.split("-");
            const diffTime = Math.abs(
                new Date(Date.UTC(todayDateKeySplit[2], todayDateKeySplit[1] - 1, todayDateKeySplit[0])) - 
                new Date(Date.UTC(startDateSplit[2], startDateSplit[1] - 1, startDateSplit[0])));
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            levelName = "Level_" + (parseInt(json.StartLevel.split("_")[1]) + diffDays) % 208;
            console.log("Current level name: " + levelName);
            if (!dayLevels.hasOwnProperty(levelName)) {
                console.log("No data for current scene");
                levelName = "Level_1";
                document.getElementById("map").loading = true;
                document.getElementById("map").src = "data/Level_1/biome_0.jpg";
                document.getElementById("no-data-yet").style.display = "flex";
                document.getElementById("settings-nextupdate").innerText = "SOON!";

                const buttons = Array.from(document.getElementsByTagName("button"));
                buttons.forEach(button => {
                    button.disabled = true;
                });
                return;
            }
            createInfo();
            // createDatePicker();
            let now = new Date();
            now.setUTCHours(nextMapUtcHour, 0, 0, 0);
            document.getElementById("settings-lastupdated").innerText = now.toLocaleDateString() + " " + now.toLocaleTimeString();
            cacheIdentifier = cacheIdentifier + "&levelName=" + levelName + "&sceneDate=" + todayDateKey;
            loadBiome(0);
        });
}

function createInfo() {
    const nextUpdate = document.getElementById("settings-nextupdate");

    const now = new Date();

    const todayUpdate = new Date(now);
    todayUpdate.setUTCHours(nextMapUtcHour, 0, 0, 0);

    const expectedUpdate = new Date(todayUpdate);

    if (now < todayUpdate) {
        expectedUpdate.setUTCDate(expectedUpdate.getUTCDate() - 1);
    }

    let targetDate = new Date(todayUpdate);

    if (now >= targetDate) {
        targetDate.setUTCDate(targetDate.getUTCDate() + 1);
    }

    setInterval(() => {
        const currentTime = new Date();
        let diff = targetDate - currentTime;

        if (diff <= 0) {
            nextUpdate.innerText = "Refresh the page";
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const pad = num => String(num).padStart(2, '0');

        nextUpdate.innerText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }, 1000);
}

function parseKey(key) {
    const [d, m, y] = key.split("-");
    return new Date(y, m - 1, d);
}

// function createDatePicker() {
//     const picker = document.getElementById("date-picker");
//     const sorted = Object.keys(dayLevels).sort((a, b) => parseKey(a) - parseKey(b));

//     sorted.forEach(key => {
//         const opt = document.createElement("option");
//         opt.value = key;
//         let label = parseKey(key).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
//         if (key === todayDateKey) label += " (today)";
//         label += ` (${dayLevels[key].Level})`;
//         opt.innerText = label;
//         picker.appendChild(opt);
//     });
//     picker.value = todayDateKey;
// }

function switchDate(dateKey) {
    if (dayLevels[dateKey].Level === levelName) return;
    removeAll(currentBiome);
    levelName = dayLevels[dateKey].Level;
    console.log("Switching to level: " + levelName + " (" + dateKey + ")");
    loadBiome(0);
}

downloadAndCreateInfo();

// Luggage

let luggage = [];

function createLuggage(biome) {
    const container = document.getElementById("container");
    if (!document.getElementById("luggage-checkbox").checked) {
        return;
    }
    let identifier = levelName + "_" + biome;
    if (typeof luggage[identifier] != "undefined") {
        for (let i = 0; i < luggage[identifier].length; i++) {
            container.appendChild(luggage[identifier][i]);
        }
        return;
    }
    luggage[identifier] = [];
    for (let i = 0; i < biomeJson.Luggage.length; i++) {
        luggage[identifier][i] = createPoint(
            "luggage",
            biomeJson.Luggage[i].PositionOnScreen[0],
            biomeJson.Luggage[i].PositionOnScreen[1],
            biomeJson.Luggage[i].DisplayName,
            biomeJson.Luggage[i].Name.replaceAll(" ", "_"),
            `${biomeJson.Luggage[i].Name}.png`
        );
    }
}

function removeLuggage() {
    removePoints("luggage");
}

function switchLuggage(checkbox) {
    if (checkbox.checked) {
        createLuggage(currentBiome);
    } else {
        removeLuggage();
    }
    refreshAdditionalFilter();
    updateZoom();
}

function createLuggageSettings() {
    createAdditionalSettingsEntry("luggage", "Luggage", "LuggageSmall.png", "LuggageSmall", createLuggage);
    createAdditionalSettingsEntry("luggage", "Big luggage", "LuggageBig.png", "LuggageBig", createLuggage);
    createAdditionalSettingsEntry("luggage", "Explorer's luggage", "LuggageEpic.png", "LuggageEpic", createLuggage);
    createAdditionalSettingsEntry("luggage", "Ancient luggage", "LuggageAncient.png", "LuggageAncient", createLuggage);
    createAdditionalSettingsEntry("luggage", "Clown luggage", "LuggageClown.png", "LuggageClown", createLuggage);
    createAdditionalSettingsEntry("luggage", "Mimic luggage", "LuggageTrick.png", "LuggageTrick", createLuggage);
    createAdditionalSettingsEntry("luggage", "Ancient statue", "scout statue.png", "scout_statue", createLuggage);
}

// Belltowers

let belltowers = [];

function createBelltowers(biome) {
    const container = document.getElementById("container");
    if (!document.getElementById("belltowers-checkbox").checked) {
        return;
    }
    let identifier = levelName + "_" + biome;
    if (typeof belltowers[identifier] != "undefined") {
        for (let i = 0; i < belltowers[identifier].length; i++) {
            container.appendChild(belltowers[identifier][i]);
        }
        return;
    }
    belltowers[identifier] = [];
    for (let i = 0; i < biomeJson.Belltowers.length; i++) {
        belltowers[identifier][i] = createPoint(
            "belltower",
            biomeJson.Belltowers[i].PositionOnScreen[0],
            biomeJson.Belltowers[i].PositionOnScreen[1],
            biomeJson.Belltowers[i].DisplayName,
            biomeJson.Belltowers[i].Name.replaceAll(" ", "_"),
            `${biomeJson.Belltowers[i].Name}.png`
        );
    }
}

function removeBelltowers() {
    removePoints("belltower");
}

function switchBelltowers(checkbox) {
    if (checkbox.checked) {
        createBelltowers(currentBiome);
    } else {
        removeBelltowers();
    }
    updateZoom();
}

// Animals

let animals = [];

function createAnimals(biome) {
    const container = document.getElementById("container");
    if (!document.getElementById("animals-checkbox").checked) {
        return;
    }
    let identifier = levelName + "_" + biome;
    if (typeof animals[identifier] != "undefined") {
        for (let i = 0; i < animals[identifier].length; i++) {
            container.appendChild(animals[identifier][i]);
        }
        return;
    }
    animals[identifier] = [];
    for (let i = 0; i < biomeJson.Animals.length; i++) {
        animals[identifier][i] = createPoint(
            "animals",
            biomeJson.Animals[i].PositionOnScreen[0],
            biomeJson.Animals[i].PositionOnScreen[1],
            biomeJson.Animals[i].DisplayName,
            biomeJson.Animals[i].Name.replaceAll(" ", "_"),
            `${biomeJson.Animals[i].Name}.png`
        );
    }
}

function removeAnimals() {
    removePoints("animals");
}

function switchAnimals(checkbox) {
    if (checkbox.checked) {
        createAnimals(currentBiome);
    } else {
        removeAnimals();
    }
    updateZoom();
}

// Amulets

let amulets = [];

function createAmulets(biome) {
    const container = document.getElementById("container");
    if (!document.getElementById("amulets-checkbox").checked) {
        return;
    }
    let identifier = levelName + "_" + biome;
    if (typeof amulets[identifier] != "undefined") {
        for (let i = 0; i < amulets[identifier].length; i++) {
            container.appendChild(amulets[identifier][i]);
        }
        return;
    }
    amulets[identifier] = [];
    for (let i = 0; i < biomeJson.Amulets.length; i++) {
        amulets[identifier][i] = createPoint(
            "amulets",
            biomeJson.Amulets[i].PositionOnScreen[0],
            biomeJson.Amulets[i].PositionOnScreen[1],
            biomeJson.Amulets[i].DisplayName,
            biomeJson.Amulets[i].Name.replaceAll(" ", "_"),
            `${biomeJson.Amulets[i].Name}.png`
        );
    }
}

function removeAmulets() {
    removePoints("amulets");
}

function switchAmulets(checkbox) {
    if (checkbox.checked) {
        createAmulets(currentBiome);
    } else {
        removeAmulets();
    }
    updateZoom();
}

// Tomb

let tombs = [];

function createTombs(biome) {
    const container = document.getElementById("container");
    if (!document.getElementById("tombs-checkbox").checked) {
        return;
    }
    let identifier = levelName + "_" + biome;
    if (typeof tombs[identifier] != "undefined") {
        for (let i = 0; i < tombs[identifier].length; i++) {
            container.appendChild(tombs[identifier][i]);
        }
        return;
    }
    tombs[identifier] = [];
    for (let i = 0; i < biomeJson.Tombs.length; i++) {
        tombs[identifier][i] = createPoint(
            "tombs",
            biomeJson.Tombs[i].PositionOnScreen[0],
            biomeJson.Tombs[i].PositionOnScreen[1],
            biomeJson.Tombs[i].DisplayName,
            biomeJson.Tombs[i].Name.replaceAll(" ", "_"),
            `${biomeJson.Tombs[i].Name}.png`
        );
    }
}

function removeTombs() {
    removePoints("tombs");
}

function switchTombs(checkbox) {
    if (checkbox.checked) {
        createTombs(currentBiome);
    } else {
        removeTombs();
    }
    updateZoom();
}

// General

function createPoint(group, x, y, name, special, image) {
    const container = document.getElementById("container");
    let element = document.createElement("div");
    element.classList.add(group);
    element.classList.add("point");
    element.classList.add(special);
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

function removePoints(group) {
    const container = document.getElementById("container");
    const elements = Array.from(document.getElementsByClassName(group));
    elements.forEach(element => {
        container.removeChild(element);
    });
}

function removePointsWithSpecial(group, special) {
    const container = document.getElementById("container");
    const elements = Array.from(document.getElementsByClassName(group));
    elements.forEach(element => {
        if (Array.from(element.classList).includes(special)) {
            container.removeChild(element);
        }
    });
}

function removeAll(biome) {
    removeLuggage(biome);
    removeBelltowers(biome);
    removeAnimals(biome);
    removeAmulets(biome);
    removeTombs(biome);
}

function previousBiome() {
    let biome = currentBiome;
    if ((currentBiome + "").includes("_")) {
        biome = parseInt(currentBiome.split("_")[0]);
    }
    loadBiome(biome - 1);
}

function switchAngle() {
    let biome;
    if ((currentBiome + "").includes("_")) {
        biome = parseInt(currentBiome.split("_")[0]);
    } else {
        biome = currentBiome + "_side";
    }
    loadBiome(biome);
}

function nextBiome() {
    let biome = currentBiome;
    if ((currentBiome + "").includes("_")) {
        biome = parseInt(currentBiome.split("_")[0]);
    }
    loadBiome(biome + 1);
}

function toggleUI(button) {
    const isHidden = document.body.classList.toggle("ui-hidden");
    button.innerText = isHidden ? "Show UI" : "Hide UI";
}

function toggleSettings(button) {
    const settings = document.getElementById("settings");
    if (!settings) return;
    const isExpanded = settings.classList.toggle("settings-expanded");
    button.innerText = isExpanded ? "Settings ▲" : "Settings ▼";
}

function toggleBottomUI(button) {
    const bottomContainer = document.getElementById("bottom-container");
    if (!bottomContainer) return;
    const isExpanded = bottomContainer.classList.toggle("expanded");
    if (button) {
        button.innerText = isExpanded ? "Info ▼" : "Info ▲";
    }
}

function loadBiome(biome) {
    if (biome < 0) {
        loadBiome(maxBiome);
        return;
    }
    if (biome > maxBiome) {
        loadBiome(0);
        return;
    }

    console.log("Loading biome: " + biome);

    const switchAngleButton = document.getElementById("switch-angle-button");
    //
    const buttons = Array.from(document.getElementsByTagName("button")).filter(btn => btn !== switchAngleButton);

    buttons.forEach(button => {
        button.disabled = true;
    });

    if (biome == 3 || biome == 4) {
        switchAngleButton.disabled = true;
    } else {
        switchAngleButton.disabled = false;
    }

    zoom = 1;
    updateZoom();

    removeAll(currentBiome);

    currentBiome = biome;

    let map = document.getElementById("map");
    map.loading = true;
    let newImage = new Image();
    newImage.onload = function () {
        requestAnimationFrame(() => {
            map.src = this.src;
            Promise.all([
                loadBiomeJson(biome)
            ]).then(() => {
                refreshAdditionalFilter();
                requestAnimationFrame(() => {
                    map.loading = false;
                    for (let i = 0; i < buttons.length; i++) {
                        buttons[i].disabled = false;
                    }
                });
            });
        });
    }
    newImage.src = "./data/" + levelName + "/biome_" + biome + ".jpg" + getURLAddition();
}

function loadBiomeJson(biome) {
    return fetch("./data/" + levelName + "/biome_" + biome + ".json" + getURLAddition())
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            biomeJson = json;
            createLuggage(biome);
            createBelltowers(biome);
            createAnimals(biome);
            createAmulets(biome);
            createTombs(biome);
            updateZoom();
        });
}