
// options handling

// get a saved option or fall back to default value
function getOption(key, defaultValue) {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
        return saved
    } else {
        return defaultValue
    }
}

// save an option to localstorage
function setOption(key, value) {
    localStorage.setItem(key, value);
}

// option: UI
function switchOptionUI(value) {
    setOption("ui", value);
    document.body.classList.toggle("legacy-ui", value === "legacy");
}

// option: start page
function switchOptionPage(value) {
    setOption("start_page", value);
}

// apply saved options on startup
function loadOptions() {
    // option: UI
    const ui = getOption("ui", "modern");
    document.body.classList.toggle("legacy-ui", ui === "legacy");
    const uiToggle = document.getElementById("ui-toggle");
    if (uiToggle) uiToggle.value = ui;

    // option: start page
    const page = getOption("start_page", "map");
    window.addEventListener("DOMContentLoaded", () => switchTab(page));
    const pageToggle = document.getElementById("start-page-toggle");
    if (pageToggle) pageToggle.value = page;
}

function dismissOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.style.setProperty("display", "none", "important");

    const version = overlay.dataset.version;
    if (version) {
        localStorage.setItem("seen_update_version", version);
    }
}
function checkUpdateOverlay() {
    const overlay = document.getElementById("update-overlay");
    if (!overlay) return;
    const version = overlay.dataset.version;
    const seenVersion = localStorage.getItem("seen_update_version");
    if (seenVersion !== version) {
        overlay.style.display = "flex";
    }
}
let currentBiome = 0;
const maxBiome = 4;
let nextMapUtcHour = 17;
let biomeJson;
let levelName;
let levels;
let dayLevels
let todayDateKey;
let startLevelNum;
let startDateUTC;
let selectedDateKey;

// Info

function checkEmbed() {
    const inIframe = window.self !== window.top;
    if(inIframe) {
        let body = document.getElementsByTagName("body")[0];
        body.innerHTML = "";
        body.style.backgroundColor = "red";
        let element = document.createElement("no-data-yet");
        element.style.display = "flex";
        element.innerHTML = "<h2>This site is embedding original site: <a href='https://qwojtpl.github.io/PeakMap/WebApp/' target='_blank' rel='noopener noreferrer'>https://qwojtpl.github.io/PeakMap/WebApp/</a>. Click to use original site!</h2>";
        body.appendChild(element);
        return false;
    }
    return true;
}

function getTodayDateKey() {
    let now = new Date();
    if (now.getUTCHours() < nextMapUtcHour) {
        now.setUTCDate(now.getUTCDate() - 1);
    }
    return toDateKey(now);
}

function downloadAndCreateInfo() {
    fetch("./data/info.json" + getURLAddition() + "&now=" + new Date().getTime())
        .then(function (response) {
            return response.json();
        })
        .then(function (json) {
            dayLevels = json.LevelBiomes;
            startLevelNum = parseInt(json.StartLevel.split("_")[1]);
            const startDateParts = json.StartDate.split("-"); // ["28", "10", "2026"]
            const startDay = parseInt(startDateParts[0]);
            const startMonth = parseInt(startDateParts[1]) - 1; // -1 is for going from normal month to js month
            const startYear = parseInt(startDateParts[2]);
            startDateUTC = new Date(Date.UTC(startYear, startMonth, startDay));
            todayDateKey = getTodayDateKey();
            console.log("Scene date: " + todayDateKey);
            levelName = levelFromDateKey(todayDateKey);
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
            updateBiomeTabLabels();
            selectedDateKey = todayDateKey;
            generateDayCards();
            updateCalendarBiomeCards(levelName);
            updateBiomeRotationText(levelName);
            let now = new Date();
            now.setUTCHours(nextMapUtcHour, 0, 0, 0);
            document.getElementById("settings-lastupdated").innerText = now.toLocaleDateString() + " " + now.toLocaleTimeString();
            cacheIdentifier = cacheIdentifier + "&levelName=" + levelName + "&sceneDate=" + todayDateKey;
            loadBiome(0);
        });
}

function toDateKey(date) {
    return date.getUTCDate() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCFullYear();
}

function makeDateKey(day, month, year) {
    return parseInt(day) + "-" + parseInt(month) + "-" + parseInt(year);
}

// turns a d-m-yyyy date key into a js date object (utc)
function parseKey(key) {
    const parts = key.split("-");
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    return new Date(Date.UTC(year, month, day));
}

// figure out which level corresponds to a given date
function levelFromDateKey(dateKey) {
    const date = parseKey(dateKey);
    const diffMs = date - startDateUTC;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return "Level_" + (startLevelNum + diffDays) % 208;
}

// figure out which date corresponds to a given level
function dateKeyFromLevel(levelNum) {
    let diffDays = (levelNum - startLevelNum) % 208;
    if (diffDays < 0) diffDays += 208;
    const date = new Date(startDateUTC);
    date.setUTCDate(date.getUTCDate() + diffDays);
    return toDateKey(date);
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

function switchDate(dateKey) {
    const newLevel = levelFromDateKey(dateKey);
    if (newLevel === levelName) return;
    if (!dayLevels.hasOwnProperty(newLevel)) {
        console.log("No data for level: " + newLevel + " (" + dateKey + ")");
        return;
    }
    removeAll(currentBiome);
    levelName = newLevel;
    console.log("Switching to level: " + levelName + " (" + dateKey + ")");
    updateBiomeTabLabels();
    updateCalendarBiomeCards(levelName);
    updateBiomeRotationText(levelName);
    loadBiome(0);
}

function switchToLevel(levelNum) {
    const level = "Level_" + levelNum;
    if (!dayLevels.hasOwnProperty(level)) {
        console.log("No data for level: " + level);
        return;
    }
    removeAll(currentBiome);
    levelName = level;
    updateBiomeTabLabels();
    updateCalendarBiomeCards(levelName);
    updateBiomeRotationText(levelName);
    loadBiome(0);
}

function offsetDateKey(dateKey, days) {
    const date = parseKey(dateKey);
    date.setUTCDate(date.getUTCDate() + days);
    return toDateKey(date);
}

function isBeforeStartDate(dateKey) {
    const date = parseKey(dateKey);
    return date < startDateUTC;
}

function formatDayInfo(date) {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return {
        weekday: dayNames[date.getUTCDay()],
        formattedDate: monthNames[date.getUTCMonth()] + " " + date.getUTCDate()
    };
}

function generateDayCards() {
    const container = document.querySelector(".calendar-days");
    container.innerHTML = "";

    // show 3 days before and 3 days after the selected date
    for (let offset = -3; offset <= 3; offset++) {
        const dateKey = offsetDateKey(selectedDateKey, offset);
        const date = parseKey(dateKey);
        const level = levelFromDateKey(dateKey);
        const biomes = dayLevels[level];

        const card = document.createElement("button");
        card.classList.add("day-card");

        if (dateKey === selectedDateKey) {
            card.classList.add("active");
        }

        const info = formatDayInfo(date);

        const dayName = document.createElement("span");
        dayName.classList.add("day-card-name");
        dayName.textContent = info.weekday;
        card.appendChild(dayName);

        const dateLabel = document.createElement("span");
        dateLabel.classList.add("day-card-date");
        dateLabel.textContent = info.formattedDate;
        card.appendChild(dateLabel);

        const disabledInfo = document.createElement("span");
        disabledInfo.classList.add("day-card-disabled-info");
        disabledInfo.textContent = "";
        disabledInfo.style.display = "none";
        card.appendChild(disabledInfo);

        // show biome icons if data
        if (biomes) {
            const iconsRow = document.createElement("div");
            iconsRow.classList.add("day-card-icons");

            biomes.forEach(function (biome) {
                const finalBiomes = biome === "Swamp" ? "Gloom & The Citadel" : "Caldera & The Kiln"
                const isFinalBiome = biome === "Swamp" || biome === "Volcano"
                const wrapper = document.createElement("div");
                const img = document.createElement("img");
                img.src = "images/biome_icon/" + biome.toLowerCase() + ".png";
                img.alt = biome;
                wrapper.dataset.tooltip = isFinalBiome ? finalBiomes : biome;
                img.classList.add("day-card-biome-icon");
                wrapper.appendChild(img);
                iconsRow.appendChild(wrapper);
            });
            card.appendChild(iconsRow);
        } else {
            disabledInfo.textContent = "No data available yet!"
            disabledInfo.style.display = "flex";
            card.disabled = true;
        }

        if (isBeforeStartDate(dateKey)) {
            disabledInfo.textContent = "Before starting date!";
            disabledInfo.style.display = "flex";
            card.disabled = true;
        }

        card.onclick = function () {
            selectedDateKey = dateKey;
            switchDate(dateKey);
            const allCards = container.querySelectorAll(".day-card");
            allCards.forEach(function (c) {
                c.classList.remove("active");
            });
            card.classList.add("active");
        };

        container.appendChild(card);
    }
    scrollCalendarToToday();
}

function scrollCalendarToToday() {
    const container = document.querySelector(".calendar-days");
    if (!container || container.clientWidth === 0) return;
    const activeCard = container.querySelector(".day-card.active");
    if (!activeCard) return;
    container.scrollLeft = activeCard.offsetLeft - (container.clientWidth - activeCard.offsetWidth) / 2;
    updateCalendarDaysScrollFade();
}

function updateCalendarDaysScrollFade() {
    const container = document.querySelector(".calendar-days");
    if (!container) return;

    if (!isMobile()) {
        container.classList.remove("can-scroll-left", "can-scroll-right");
        return;
    }

    const canScrollRight = (container.scrollWidth - container.scrollLeft - container.clientWidth) > 2;
    const canScrollLeft = container.scrollLeft > 2;

    container.classList.toggle("can-scroll-right", canScrollRight);
    container.classList.toggle("can-scroll-left", canScrollLeft);
}

function updateCalendarBiomeCards(level) {
    const biomes = getBiomeNames(level);
    const cards = document.querySelectorAll("#biomes .biome");
    cards.forEach((card, index) => {
        const title = card.querySelector("h2");
        if (title) title.textContent = biomes.display[index];
        card.style.backgroundImage = " linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.75)), url('../WebApp/images/biome_image/" + getBiomeNames(level).raw[index].toLowerCase() + ".jpg')";
    });

    const finalCard = document.querySelector("#final-biomes .biome-wide");
    const finalCardText = document.querySelector("#final-biomes .biome-wide h2");
    finalCardText.textContent = biomes.finalCombinedName;
    finalCard.style.backgroundImage = "linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.75)), url('../WebApp/images/biome_image/" + getBiomeNames(level).raw[3].toLowerCase() + ".jpg')";

    finalCard.style.backgroundPosition = getBiomeNames(level).raw[3] === "Volcano" ? "50% 45%" : "50% 30%"
}

function updateBiomeRotationText(level) {
    const rotation = getBiomeNames(level).display;
    const text = document.getElementById("biome-rotation");
    text.textContent = "Current Biome Rotation: " + rotation.join(" → ");
}

// move the selected date forward or backward and refresh the cards
function shiftSelectedDate(offset) {
    const newDateKey = offsetDateKey(selectedDateKey, offset);
    if (isBeforeStartDate(newDateKey)) {
        return;
    }
    selectedDateKey = newDateKey;
    switchDate(selectedDateKey);
    generateDayCards();
}

function goToToday() {
    selectedDateKey = todayDateKey;
    switchDate(selectedDateKey);
    generateDayCards();
}

function switchPopoverMode(mode) {
    const dateMode = document.getElementById("popover-date-mode");
    const levelMode = document.getElementById("popover-level-mode");
    const tabs = document.querySelectorAll("#date-picker-popover .tab-switcher .tab");

    if (mode === "date") {
        dateMode.style.display = "";
        levelMode.style.display = "none";
        tabs[0].classList.add("active");
        tabs[1].classList.remove("active");
    } else {
        dateMode.style.display = "none";
        levelMode.style.display = "";
        tabs[0].classList.remove("active");
        tabs[1].classList.add("active");
    }
    checkPopoverValidity();
}

function checkPopoverValidity() {
    const errorEl = document.getElementById("popover-error");
    if (!errorEl) return true;

    const dateMode = document.getElementById("popover-date-mode");
    if (dateMode && dateMode.style.display !== "none") {
        const day = document.getElementById("date-day-input").value;
        const month = document.getElementById("date-month-input").value;
        const year = document.getElementById("date-year-input").value;
        if (day && month && year) {
            const dateKey = makeDateKey(day, month, year);
            const level = levelFromDateKey(dateKey);
            const isAvailable = !isBeforeStartDate(dateKey) && dayLevels && dayLevels.hasOwnProperty(level);
            errorEl.style.display = isAvailable ? "none" : "block";
            return isAvailable;
        } else {
            errorEl.style.display = "none";
            return true;
        }
    } else {
        const levelNum = document.getElementById("level-input").value;
        if (levelNum) {
            const level = "Level_" + parseInt(levelNum);
            const isAvailable = dayLevels && dayLevels.hasOwnProperty(level);
            errorEl.style.display = isAvailable ? "none" : "block";
            return isAvailable;
        } else {
            errorEl.style.display = "none";
            return true;
        }
    }
}

function submitPopover() {
    const errorEl = document.getElementById("popover-error");
    const dateMode = document.getElementById("popover-date-mode");

    if (dateMode.style.display !== "none") {
        const day = document.getElementById("date-day-input").value;
        const month = document.getElementById("date-month-input").value;
        const year = document.getElementById("date-year-input").value;
        if (!day || !month || !year) {
            return;
        }
        const dateKey = makeDateKey(day, month, year);
        const level = levelFromDateKey(dateKey);
        if (isBeforeStartDate(dateKey) || !dayLevels || !dayLevels.hasOwnProperty(level)) {
            if (errorEl) errorEl.style.display = "block";
            return;
        }
        selectedDateKey = dateKey;
        switchDate(dateKey);
        generateDayCards();

    } else {
        const levelNum = document.getElementById("level-input").value;
        if (!levelNum) {
            return;
        }
        const num = parseInt(levelNum);
        const level = "Level_" + num;
        if (!dayLevels || !dayLevels.hasOwnProperty(level)) {
            if (errorEl) errorEl.style.display = "block";
            return;
        }
        selectedDateKey = dateKeyFromLevel(num);
        switchToLevel(num);
        generateDayCards();
    }

    if (errorEl) errorEl.style.display = "none";
    document.getElementById("date-picker-popover").hidePopover();
}

downloadAndCreateInfo();

document.addEventListener("DOMContentLoaded", () => {
    checkEmbed();
});

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

function switchAngle() {
    let biome;
    if ((currentBiome + "").includes("_")) {
        biome = parseInt(currentBiome.split("_")[0]);
    } else {
        biome = currentBiome + "_side";
    }
    loadBiome(biome);
}

function previousBiome() {
    let biome = currentBiome;
    if ((currentBiome + "").includes("_")) {
        biome = parseInt(currentBiome.split("_")[0]);
    }
    loadBiome(biome - 1);
}

function nextBiome() {
    let biome = currentBiome;
    if ((currentBiome + "").includes("_")) {
        biome = parseInt(currentBiome.split("_")[0]);
    }
    loadBiome(biome + 1);
}

function switchBiome(biome) {
    loadBiome(biome);
}

function updateActiveBiome(biome) {
    const tabs = document.querySelectorAll(".biome-tab");
    tabs.forEach(tab => {
        tab.classList.toggle("active", tab.dataset.tab == biome);
    });
}

function getBiomeNames(level) {
    const rawBiomes = dayLevels[level];
    if (!rawBiomes) return null;

    const lastBiome = rawBiomes[3];
    const isVolcano = lastBiome === "Volcano";

    return {
        raw: rawBiomes,
        display: [
            rawBiomes[0],
            rawBiomes[1],
            rawBiomes[2],
            isVolcano ? "Caldera" : "Gloom",
            isVolcano ? "The Kiln" : "The Citadel"
        ],
        finalCombinedName: isVolcano ? "Caldera & The Kiln" : "Gloom & The Citadel"
    };
}

function updateBiomeTabLabels() {
    const tabs = document.querySelectorAll(".biome-tab");
    tabs.forEach(tab => {
        const index = tab.dataset.tab;
        tab.textContent = getBiomeNames(levelName).display[index];
    })
    setupBiomeNavPeek()
}

function isMobile() {
    return window.matchMedia("(max-width: 960px)").matches;
}

function toggleUI(button) {
    const label = button.querySelector(".btn-text");
    const hideIcon = button.querySelector("#hide-icon");
    const showIcon = button.querySelector("#show-icon");
    const isHidden = document.body.classList.toggle("ui-hidden");
    if (label) label.textContent = isHidden ? "Show UI" : "Hide UI";
    if (isMobile()) {
        if (hideIcon) hideIcon.style.display = isHidden ? "none" : "inline";
        if (showIcon) showIcon.style.display = isHidden ? "inline" : "none";
    } else {
        if (hideIcon) hideIcon.style.display = "none";
        if (showIcon) showIcon.style.display = "none";
    }
}

function toggleMapFilters() {
    document.getElementById("settings")?.classList.toggle("mobile-open");
}

function syncTopbarHeight() {
    const topbar = document.getElementById("topbar");
    if (topbar) {
        document.documentElement.style.setProperty("--topbar-height", `${topbar.offsetHeight}px`);
    }
    const biomeBar = document.getElementById("biome-bar");
    if (biomeBar) {
        document.documentElement.style.setProperty("--biomebar-height", `${biomeBar.offsetHeight}px`);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadOptions();
    checkUpdateOverlay();
    syncTopbarHeight();
    const topbar = document.getElementById("topbar");
    if (topbar && window.ResizeObserver) {
        new ResizeObserver(syncTopbarHeight).observe(topbar);
    }
    const biomeNav = document.getElementById('biome-nav');
    const biomeTabsScroll = document.getElementById('biome-tabs-scroll') || biomeNav;
    if (biomeNav) {
        if (window.ResizeObserver) {
            new ResizeObserver(() => {
                setupBiomeNavPeek();
                syncTopbarHeight();
            }).observe(biomeNav.parentElement);
        }
        if (biomeTabsScroll) {
            biomeTabsScroll.addEventListener('scroll', updateBiomeNavScrollFade, { passive: true });
        }
    }
    const calendarDays = document.querySelector(".calendar-days");
    if (calendarDays) {
        calendarDays.addEventListener("scroll", updateCalendarDaysScrollFade, { passive: true });
    }
    const popover = document.getElementById("date-picker-popover");
    if (popover) {
        popover.addEventListener("input", checkPopoverValidity);
    }
    setupBiomeNavPeek();
});

function switchTab(tabName) {
    document.body.dataset.activeTab = tabName;

    const tabs = document.querySelectorAll(".nav-tab");
    tabs.forEach(tab => {
        tab.classList.toggle("active", tab.dataset.tab === tabName);
    });

    const contents = document.querySelectorAll(".tab-content");
    contents.forEach(content => {
        content.style.display = content.id === `tab-${tabName}` ? "flex" : "none";
    });

    if (tabName === "map") {
        if (typeof initZoom === "function") {
            initZoom(false);
        }
        setupBiomeNavPeek();
        syncTopbarHeight();
    } else if (tabName === "calendar") {
        scrollCalendarToToday();
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
    const biomeLetter = biome.toString().charAt(0);
    updateActiveBiome(biomeLetter);
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

// SUPER HELL.
function setupBiomeNavPeek() {
    const nav = document.getElementById('biome-nav');
    if (!nav) return;

    const scrollContainer = document.getElementById('biome-tabs-scroll') || nav;

    // reset when not mobile
    if (!isMobile()) {
        nav.style.width = "";
        nav.style.maxWidth = "";
        nav.style.minWidth = "";
        updateBiomeNavScrollFade();
        return;
    }

    const tabs = scrollContainer.querySelectorAll('.biome-tab');
    if (!tabs.length) return;

    const container = nav.parentElement; // #biome-bar
    if (!container) return;
    const containerWidth = container.offsetWidth;



    const scrollStyle = getComputedStyle(scrollContainer);
    const paddingRight = parseFloat(scrollStyle.paddingRight) || 10;

    // max width of nav (90% of screen)
    const maxAvailableWidth = containerWidth * 0.9;

    // width needed to display all tabs fully
    const lastTab = tabs[tabs.length - 1];
    const totalTabsWidth = lastTab.offsetLeft + lastTab.offsetWidth + paddingRight;

    // all tabs fit
    if (maxAvailableWidth >= totalTabsWidth) {
        nav.style.width = "";
        nav.style.maxWidth = "";
        nav.style.minWidth = "";
        updateBiomeNavScrollFade();
        return;
    }

    // stepped widths: /N/ AMOUNT OF FULL TABS plus PEEK% of the next tab for a peek
    // steps[0] = 1 tab + PEEK% peek of tab 1
    // steps[1] = 2 tabs + PEEK% peek of tab 2
    // ETC ETC
    const PEEK = 0.6;
    const steps = [];
    for (let i = 1; i < tabs.length; i++) {
        const nextTab = tabs[i];
        const stepWidth = Math.round(nextTab.offsetLeft + (nextTab.offsetWidth * PEEK));
        steps.push(stepWidth);
    }

    // min width 1tab + peek
    const minStepWidth = steps[0];
    nav.style.minWidth = `${minStepWidth}px`;

    // find largest step that still fits within the max available width
    let selectedWidth = minStepWidth;
    for (let i = steps.length - 1; i >= 0; i--) {
        if (maxAvailableWidth >= steps[i]) {
            selectedWidth = steps[i];
            break;
        }
    }

    nav.style.width = `${selectedWidth}px`;
    nav.style.maxWidth = `${selectedWidth}px`;
    updateBiomeNavScrollFade();
}

function updateBiomeNavScrollFade() {
    const scrollContainer = document.getElementById('biome-tabs-scroll') || document.getElementById('biome-nav');
    if (!scrollContainer) return;

    if (!isMobile()) {
        scrollContainer.classList.remove('can-scroll-right', 'can-scroll-left');
        return;
    }

    const canScrollRight = (scrollContainer.scrollWidth - scrollContainer.scrollLeft - scrollContainer.clientWidth) > 2;
    const canScrollLeft = scrollContainer.scrollLeft > 2;

    scrollContainer.classList.toggle('can-scroll-right', canScrollRight);
    scrollContainer.classList.toggle('can-scroll-left', canScrollLeft);
}