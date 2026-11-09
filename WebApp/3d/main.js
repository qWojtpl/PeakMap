import * as THREE from "three";
import { MapControls } from "three/addons/controls/MapControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const NAMES = {
  "Mushroom Normie": "Button Shroom",
  "Mushroom Normie Poison": "Button Shroom (poison)",
  "Mushroom Lace": "Bugle Shroom",
  "Mushroom Lace Poison": "Bugle Shroom (poison)",
  "Mushroom Cluster": "Cluster Shroom",
  "Mushroom Cluster Poison": "Cluster Shroom (poison)",
  "Mushroom Chubby": "Chubby Shroom",
  "Mushroom Glow": "Weird Shroom",
  Shroomberry_Red: "Red Shroomberry",
  Shroomberry_Yellow: "Yellow Shroomberry",
  Shroomberry_Green: "Green Shroomberry",
  Shroomberry_Blue: "Blue Shroomberry",
  Shroomberry_Purple: "Purple Shroomberry",
  ShelfShroom: "Shelf Fungus",
  WarpFungus: "Warp Fungus",
  BounceShroom: "Bounce Fungus",
  CloudFungus: "Cloud Fungus",
  HealingPuffShroom: "Remedy Fungus",
  MedicinalRoot: "Medicinal Root",
  Mandrake_Hidden: "Mandrake",
  AncientIdol: "Ancient Idol",
  AloeVera: "Aloe Vera",
  MagicBean: "Magic Bean",
  "Winterberry Yellow": "Winterberry",
  Glizzy_CattailVariant: "Hot Dog (cattail)",
  EarlyWorm: "Early Worm",
  BingBong: "Bing Bong",
  LuggageSmall: "Luggage",
  LuggageBig: "Big Luggage",
  LuggageEpic: "Explorer's Luggage",
  LuggageAncient: "Ancient Luggage",
  LuggageClown: "Clown Luggage",
  LuggageTrick: "Trick Luggage",
  AMULET_CLONE: "Scout's Generosity amulet",
  AMULET_DOUBLEJUMP: "Scout's Initiative amulet",
  AMULET_HEALING: "Scout's Tenacity amulet",
  AMULET_INFINITESTAM: "Scout's Ambition amulet",
};

const AREA_LABELS = { Beach: "Shore", Map: "Misc", VOID: "Secret island" };

const itemTile = (item, ring, on) => ({ key: item, label: NAMES[item] ?? item, icon: item, ring, on });
const BERRY_TILE = { key: "berries", label: "Shroomberry spots", icon: "Shroomberry_Purple", ring: "#c678dd", on: false };
const GROUPS = [
  {
    label: "Luggage",
    always: true,
    tiles: [
      { key: "luggage", label: "Luggage", icon: "LuggageSmall", ring: "#da7c20", on: true },
      { key: "big", label: "Big luggage", icon: "LuggageBig", ring: "#ece2dc", on: true },
      { key: "epic", label: "Explorer's luggage", icon: "LuggageEpic", ring: "#ff5a2a", on: true },
      { key: "ancient", label: "Ancient luggage (cursed)", icon: "LuggageAncient", ring: "#b35cff", on: true },
      { key: "odd", label: "Clown / trick luggage", icon: "LuggageClown", ring: "#ff7eb6", on: true },
    ],
  },
  {
    label: "Landmarks",
    tiles: [
      { key: "revive", label: "Revive statue", icon: "scout_statue", ring: "#9aa3b5", on: true },
      { key: "amulet", label: "Amulets", icon: "AMULET_CLONE", ring: "#7ee787", on: true },
      { key: "tomb", label: "Tomb (open today)", icon: "Tomb", ring: "#ffb000", on: true },
      { key: "belltower", label: "Belltowers", icon: "Belltower", ring: "#c9b6ff", on: true },
      itemTile("AncientIdol", "#ffe08a", true),
    ],
  },
  {
    label: "Mobility",
    tiles: [
      itemTile("MagicBean", "#5fd068", true),
      itemTile("ShelfShroom", "#56d4f5", true),
      itemTile("BounceShroom", "#56d4f5", true),
      itemTile("CloudFungus", "#56d4f5", true),
      itemTile("WarpFungus", "#56d4f5", true),
    ],
  },
  { label: "Healing", tiles: [itemTile("AloeVera", "#ff8fa3", true), itemTile("HealingPuffShroom", "#ff8fa3", true)] },
  { label: "Food", tiles: [itemTile("Glizzy_CattailVariant", "#8bd17c", false)] },
  {
    label: "Creatures",
    tiles: [
      { key: "Capybara", label: "Capybara", icon: "Capybara", ring: "#e2a36b", on: true },
      { key: "Antlion", label: "Antlion", icon: "Antlion", ring: "#e2a36b", on: true },
      itemTile("Beehive", "#ffd84d", true),
      itemTile("Frog", "#c9a27e", false),
      itemTile("EarlyWorm", "#c9a27e", false),
    ],
  },
  { label: "Foraging", tiles: [{ key: "shrooms", label: "Mushroom spots", icon: "Mushroom Normie", ring: "#ff9e3d", on: false }, BERRY_TILE] },
];
const TILES = GROUPS.flatMap((g) => g.tiles);
const ITEM_TILES = new Set(TILES.map((t) => t.key));

const LUGGAGE_KIND = { LuggageSmall: "luggage", LuggageBig: "big", LuggageEpic: "epic", LuggageClown: "odd", LuggageTrick: "odd" };

const EFFECTS = [
  "Infinite stamina 4s",
  "Fast climb 5s",
  "Low gravity 15s",
  "Invincible 10s",
  "Heals hunger, injury & poison",
  "Spore blast launch",
  "Blind 60s",
  "Pass out 8s",
  "+25% spores",
  "Numb 60s",
];

const PALETTE_SIZE = 64;
const BIOME_ORDER = ["Beach", "Tropics", "Roots", "Alpine", "Mesa", "Caldera", "Gloom"];
const REMINDER_3D = "Drag to move, right-drag to turn, scroll to zoom, double-click to go there";
const BASE = new URL(".", import.meta.url).href;
const nameOf = (n) => NAMES[n] ?? n;
const baseName = (go) => go.replace(/ \(\d+\)$/, "");
const areaLabel = (a) => AREA_LABELS[a] ?? a;
const iconUrl = (name) => `${BASE}icons/${name.replaceAll(" ", "%20")}.png`;
const $ = (id) => document.getElementById(id);

const state = {
  active: false,
  level: null,
  lod: "auto",
  biome: null,
  biomeIndex: null,
  groups: {},
  markers: null,
  enabled: new Map(TILES.map((t) => [t.key, t.on])),
  showVoid: false,
  token: 0,
  reminder2d: null,
};

const root = document.createElement("div");
root.id = "view3d";
root.hidden = true;
document.body.appendChild(root);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.NoToneMapping;
root.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color("#a9c7dd");
scene.fog = new THREE.Fog("#a9c7dd", 1800, 5200);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000);
const controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.62;
controls.screenSpacePanning = true;
controls.zoomToCursor = true;
controls.minDistance = 3;
controls.maxDistance = 6000;
controls.keyPanSpeed = 40;
controls.listenToKeyEvents(window);
const ambient = new THREE.HemisphereLight("#d7d7d7", "#262626", 1.25 * Math.PI);
scene.add(ambient);
const sun = new THREE.DirectionalLight("#fff3c9", 3.0 * Math.PI);
sun.position.set(-0.6, 1.4, -0.8);
scene.add(sun);

const terrainRoot = new THREE.Group();
scene.add(terrainRoot);
const areaCache = new Map();

const paletteUniform = { value: Array.from({ length: PALETTE_SIZE }, () => new THREE.Color()) };
const topParamsUniform = { value: Array.from({ length: PALETTE_SIZE }, () => new THREE.Vector3(0.5, 0.8, 1)) };
const gradeGain = { value: 1 };
const gradeLift = { value: new THREE.Vector3(0, 0, 0) };

const terrainMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, metalness: 0, side: THREE.DoubleSide });
terrainMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.topPalette = paletteUniform;
  shader.uniforms.topParams = topParamsUniform;
  shader.uniforms.gradeGain = gradeGain;
  shader.uniforms.gradeLift = gradeLift;
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;")
    .replace(
      "#include <project_vertex>",
      `#include <project_vertex>
      vec4 wp = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        wp = instanceMatrix * wp;
      #endif
      vWorldPos = (modelMatrix * wp).xyz;`,
    );
  shader.fragmentShader = shader.fragmentShader
    .replace("#include <common>", `#include <common>\nvarying vec3 vWorldPos;\nuniform vec3 topPalette[${PALETTE_SIZE}];\nuniform vec3 topParams[${PALETTE_SIZE}];\nuniform float gradeGain;\nuniform vec3 gradeLift;`)
    .replace("#include <tonemapping_fragment>", "gl_FragColor.rgb = gl_FragColor.rgb * gradeGain + gradeLift;\n#include <tonemapping_fragment>")
    .replace(
      "#include <color_fragment>",
      `vec3 enc = clamp(vColor.rgb, 0.0, 1.0);
      vec3 baseCol = mix(enc / 12.92, pow((enc + 0.055) / 1.055, vec3(2.4)), step(0.04045, enc));
      int topIdx = int(floor(vColor.a * 255.0 + 0.5));
      if (topIdx > 0 && topIdx < ${PALETTE_SIZE}) {
        vec3 fn = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
        vec3 tp = topParams[topIdx];
        baseCol = mix(baseCol, topPalette[topIdx], smoothstep(tp.x, max(tp.y, tp.x + 1e-3), fn.y) * tp.z);
      }
      diffuseColor.rgb *= baseCol;`,
    );
};

const iconImages = new Map();
function loadIcon(name) {
  if (!iconImages.has(name)) {
    iconImages.set(
      name,
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = iconUrl(name);
      }),
    );
  }
  return iconImages.get(name);
}

const markerTextures = new Map();
async function markerTexture(tile, iconName = tile.icon) {
  const cacheKey = tile.key + ":" + iconName;
  if (markerTextures.has(cacheKey)) return markerTextures.get(cacheKey);
  const img = (await loadIcon(iconName)) ?? (await loadIcon(tile.icon));
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  g.beginPath();
  g.arc(64, 64, 58, 0, Math.PI * 2);
  g.fillStyle = "rgba(20,24,30,0.85)";
  g.fill();
  g.lineWidth = 9;
  g.strokeStyle = tile.ring;
  g.stroke();
  if (img) {
    const k = 86 / Math.max(img.width, img.height);
    const w = img.width * k;
    const h = img.height * k;
    g.drawImage(img, 64 - w / 2, 64 - h / 2, w, h);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  markerTextures.set(cacheKey, tex);
  return tex;
}

async function fetchJson(url, attempts = 3) {
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
      return await r.json();
    } catch (err) {
      if (i + 1 >= attempts) throw err;
      await new Promise((res) => setTimeout(res, 400 * (i + 1)));
    }
  }
}

function biomeAt(pos, anchors, k = 5) {
  const nearest = anchors
    .map((a) => ({ group: a.group, d: (a.pos[0] - pos[0]) ** 2 + (a.pos[1] - pos[1]) ** 2 + (a.pos[2] - pos[2]) ** 2 }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k);
  const votes = new Map();
  for (const n of nearest) votes.set(n.group, (votes.get(n.group) ?? 0) + 1 / (1 + Math.sqrt(n.d)));
  return [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Map";
}

function categorize(markers) {
  const items = categorizeRaw(markers);
  const anchors = [];
  for (const list of Object.values(markers)) {
    if (!Array.isArray(list)) continue;
    for (const s of list) if (s && s.pos && s.group && s.group !== "Map" && s.group !== "VOID") anchors.push(s);
  }
  for (const item of items) {
    if (item.group === "Map") item.group = biomeAt(item.pos, anchors);
  }
  return items;
}

function categorizeRaw(markers) {
  const items = [];
  const lists = markers.spawnLists ?? {};
  for (const s of markers.Luggage ?? []) {
    const kind = LUGGAGE_KIND[baseName(s.go)] ?? "luggage";
    items.push({ tile: kind, pos: s.pos, group: s.group, title: nameOf(baseName(s.go)), body: "Contents are rolled when someone opens it.", icon: baseName(s.go) });
  }
  for (const s of markers.LuggageCursed ?? []) {
    items.push({ tile: "ancient", pos: s.pos, group: s.group, title: "Ancient Luggage", body: "Cursed: opening it applies curse.", icon: "LuggageAncient" });
  }
  for (const s of markers.RespawnChest ?? []) {
    items.push({ tile: "revive", pos: s.pos, group: s.group, title: "Revive statue", body: "Revives fallen scouts, otherwise drops items.", icon: "scout_statue" });
  }
  for (const s of markers.Amulet ?? []) {
    items.push({ tile: "amulet", pos: s.pos, group: s.group, title: nameOf(s.item), body: "Amulet statue, fixed for this island.", icon: s.item });
  }
  for (const s of markers.Tomb ?? []) {
    if (!s.open) continue;
    items.push({ tile: "tomb", pos: s.pos, group: s.group, title: "Tomb entrance", body: "The tomb is open on this island.", icon: "Tomb" });
  }
  for (const s of markers.Belltower ?? []) {
    items.push({ tile: "belltower", pos: s.pos, group: s.group, title: "Belltower", body: "Ghost fire belltower.", icon: "Belltower" });
  }
  for (const s of markers.Capybara ?? []) {
    items.push({ tile: "Capybara", pos: s.pos, group: s.group, title: "Capybara", body: "Always here.", icon: "Capybara" });
  }
  for (const s of markers.Antlion ?? []) {
    items.push({ tile: "Antlion", pos: s.pos, group: s.group, title: "Antlion", body: "Antlion pit.", icon: "Antlion" });
  }
  const itemBodies = {
    MagicBean: "Always spawns here. Throw it on the ground and it grows into a big plant.",
    WarpFungus: "Always spawns here. Throw it and you teleport where it lands.",
    Glizzy_CattailVariant: "Always spawns here. Called Hot Dog in game: eat it to restore hunger and get extra stamina.",
  };
  for (const s of markers.SingleItemSpawner ?? []) {
    const item = s.item ?? "?";
    if (!ITEM_TILES.has(item)) continue;
    items.push({ tile: item, pos: s.pos, group: s.group, title: nameOf(item), body: itemBodies[item] ?? "Always spawns here.", icon: item });
  }
  for (const s of markers.GroundPlaceSpawner ?? []) {
    const list = lists[String(s.list)] ?? [];
    const names = list.map(([n]) => n);
    const tile = names.some((n) => n.startsWith("Shroomberry")) ? "berries" : names.some((n) => n.startsWith("Mushroom")) ? "shrooms" : null;
    if (!tile) continue;
    const total = list.reduce((a, [, w]) => a + w, 0) || 1;
    const odds = list
      .slice()
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([n, w]) => `${Math.round((100 * w) / total)}% ${nameOf(n)}`)
      .join("\n");
    const body = `${Math.round(s.chance * 100)}% chance something grows here (${s.count?.[0]}-${s.count?.[1]} of one kind):\n${odds}`;
    for (const p of s.spots?.length ? s.spots : [s.pos]) {
      items.push({ tile, pos: p, group: s.group, title: tile === "berries" ? "Shroomberry spot" : "Mushroom spot", body, icon: tile === "berries" ? "Shroomberry_Purple" : "Mushroom Normie" });
    }
  }
  return items;
}

function biomeOrder(groups) {
  const rank = (a) => (BIOME_ORDER.includes(a) ? BIOME_ORDER.indexOf(a) : BIOME_ORDER.length);
  return Object.keys(groups)
    .filter((a) => a !== "VOID" && a !== "Map")
    .sort((a, b) => rank(a) - rank(b));
}

function visibleAreas() {
  const areas = [state.biome];
  if (state.showVoid && state.groups.VOID) areas.push("VOID");
  return areas;
}

function inScope(item) {
  if (item.group === "VOID") return state.showVoid;
  return item.group === state.biome;
}

function resolvedLod() {
  if (state.lod !== "auto") return state.lod;
  const gl = renderer.getContext();
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  const gpu = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
  const weak = /intel|mali|adreno|apple|swiftshader|llvmpipe/i.test(gpu) || /Mobi/i.test(navigator.userAgent);
  return weak ? "lite" : "0";
}

function areaUrl(area) {
  const lod = resolvedLod();
  const file = state.groups[area].file;
  const dir = `${BASE}data/${state.level}/`;
  return lod === "lite" ? `${dir}terrain_lite.${file}.glb` : `${dir}terrain_lod${lod}.${file}.glb`;
}

const texturedMaterials = new Map();
function texturedMaterial(map) {
  if (!texturedMaterials.has(map.uuid)) {
    const m = terrainMaterial.clone();
    m.map = map;
    m.flatShading = false;
    m.onBeforeCompile = terrainMaterial.onBeforeCompile;
    m.customProgramCacheKey = () => "terrain-textured";
    texturedMaterials.set(map.uuid, m);
  }
  return texturedMaterials.get(map.uuid);
}

const ROCK_GLSL = `
uniform sampler2D rockMask;
uniform vec3 rockBase;
uniform vec3 rockC1;
uniform vec3 rockC2;
uniform vec3 rockC3;
uniform vec3 rockStrength;
uniform vec3 rockTint;
uniform vec2 rockRemap[3];
uniform vec3 rockFlip;
uniform vec3 rockUv;
uniform vec3 rockProj;
uniform float rockMask1Gate;
uniform vec3 rockHue;
uniform float rockHueStr;

float rockLayer(vec2 uv, float channel, float flip, vec2 remap, float strength) {
  vec3 t = texture2D(rockMask, uv).rgb;
  float v = channel < 0.5 ? t.r : channel < 1.5 ? t.g : t.b;
  v = flip != 0.0 ? 1.0 - v : v;
  float k = clamp((v - remap.x) / max(remap.y - remap.x, 1e-5), 0.0, 1.0);
  return k * k * (3.0 - 2.0 * k) * strength;
}

vec3 rockHueShift(vec3 c, float offset, float strength) {
  float v = max(c.r, max(c.g, c.b));
  float d = v - min(c.r, min(c.g, c.b));
  float h = 0.0;
  if (d > 1e-10) {
    h = v == c.r ? (c.g - c.b) / d : v == c.g ? 2.0 + (c.b - c.r) / d : 4.0 + (c.r - c.g) / d;
    h = fract(h / 6.0);
  }
  float s = v > 1e-10 ? d / v : 0.0;
  h = abs(h) + offset;
  vec3 p = clamp(abs(fract(vec3(h + 1.0, h + 2.0 / 3.0, h + 1.0 / 3.0)) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
  vec3 shifted = v * (1.0 + s * (p - 1.0));
  return c + (shifted - c) * strength;
}

vec2 rockUvFor(float proj, vec2 meshUv, vec2 tri, vec2 topDown) {
  return proj > 1.5 ? topDown : proj > 0.5 ? tri : meshUv;
}

vec3 rockAlbedo(vec3 worldPos, vec3 worldNormal, vec2 meshUv) {
  vec3 p = vec3(-worldPos.x, worldPos.y, worldPos.z);
  vec3 n = vec3(-worldNormal.x, worldNormal.y, worldNormal.z);
  vec2 tri = abs(n.x) >= abs(n.z) ? p.zy : p.xy;
  tri = abs(n.y) >= 0.7 ? p.xz : tri;
  tri *= 0.1;
  vec2 uv1 = rockUvFor(rockProj.x, meshUv, tri, p.xz) * rockUv.x;
  vec2 uv2 = rockUvFor(rockProj.y, meshUv, tri, p.xz) * rockUv.y;
  vec2 uv3 = rockUvFor(rockProj.z, meshUv, tri, p.xz) * rockUv.z;
  float m1 = rockLayer(uv1, 0.0, rockFlip.x, rockRemap[0], rockStrength.x);
  float m2 = rockLayer(uv2, 1.0, rockFlip.y, rockRemap[1], rockStrength.y);
  if (rockMask1Gate != 0.0) m2 *= m1;
  float m3 = rockLayer(uv3, 2.0, rockFlip.z, rockRemap[2], rockStrength.z);
  vec3 c = mix(mix(mix(rockBase, rockC1, m1), rockC2, m2), rockC3, m3) * rockTint;
  return rockHueShift(c, m1 * rockHue.x + m2 * rockHue.y + m3 * rockHue.z, rockHueStr);
}
`;

function rockMaskTexture(map, keepCrack) {
  const img = map?.image;
  if (!img) return map;
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const g = canvas.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  let level = { data: new Uint8Array(g.getImageData(0, 0, img.width, img.height).data.buffer), width: img.width, height: img.height };
  const mipmaps = [level];
  while (level.width > 1 || level.height > 1) {
    const w = Math.max(1, level.width >> 1);
    const h = Math.max(1, level.height >> 1);
    const out = new Uint8Array(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const px = [];
        for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
          const sx = Math.min(level.width - 1, x * 2 + dx);
          const sy = Math.min(level.height - 1, y * 2 + dy);
          px.push((sy * level.width + sx) * 4);
        }
        const o = (y * w + x) * 4;
        for (let c = 0; c < 2; c++) out[o + c] = (level.data[px[0] + c] + level.data[px[1] + c] + level.data[px[2] + c] + level.data[px[3] + c] + 2) >> 2;
        const b = px.map((i) => level.data[i + 2]);
        out[o + 2] = keepCrack(b);
        out[o + 3] = 255;
      }
    }
    level = { data: out, width: w, height: h };
    mipmaps.push(level);
  }
  const tex = new THREE.DataTexture(mipmaps[0].data, mipmaps[0].width, mipmaps[0].height, THREE.RGBAFormat);
  tex.mipmaps = mipmaps;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.needsUpdate = true;
  return tex;
}

const rockMaterials = new Map();
function rockMaterial(source) {
  const params = source.userData.peakRock;
  const key = source.map ? source.map.uuid : source.uuid;
  if (rockMaterials.has(key)) return rockMaterials.get(key);
  const keepCrack = params.flip[2] !== 0 ? (v) => Math.min(...v) : (v) => Math.max(...v);
  const mask = rockMaskTexture(source.map, keepCrack);
  const v3 = (a) => new THREE.Vector3(...a);
  const uniforms = {
    rockMask: { value: mask },
    rockBase: { value: v3(params.base) },
    rockC1: { value: v3(params.c1) },
    rockC2: { value: v3(params.c2) },
    rockC3: { value: v3(params.c3) },
    rockStrength: { value: v3(params.strength) },
    rockTint: { value: v3(params.tint) },
    rockRemap: { value: params.remap.map((r) => new THREE.Vector2(r[0], r[1])) },
    rockFlip: { value: v3(params.flip) },
    rockUv: { value: v3(params.uv) },
    rockProj: { value: v3(params.projection) },
    rockMask1Gate: { value: params.mask1Gate },
    rockHue: { value: v3(params.hue) },
    rockHueStr: { value: params.hueStr },
  };
  const m = terrainMaterial.clone();
  m.map = mask;
  m.onBeforeCompile = (shader) => {
    terrainMaterial.onBeforeCompile(shader);
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <map_fragment>", "")
      .replace("uniform float gradeGain;", "uniform float gradeGain;\n" + ROCK_GLSL)
      .replace("int topIdx", "baseCol *= rockAlbedo(vWorldPos, normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos))), vMapUv);\n      int topIdx");
  };
  m.customProgramCacheKey = () => "terrain-rock";
  rockMaterials.set(key, m);
  return m;
}

async function loadArea(area) {
  const url = areaUrl(area);
  if (areaCache.has(url)) return areaCache.get(url);
  const promise = (async () => {
    for (let i = 0; i < 3; i++) {
      try {
        const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url);
        gltf.scene.traverse((o) => {
          if (o.isMesh && o.material?.userData?.peakRock) {
            o.material = rockMaterial(o.material);
            o.frustumCulled = !o.isInstancedMesh;
          } else if (o.isMesh) {
            const map = o.material && o.material.map;
            if (map && !o.geometry.attributes.normal) o.geometry.computeVertexNormals();
            o.material = map ? texturedMaterial(map) : terrainMaterial;
            o.frustumCulled = !o.isInstancedMesh;
          }
        });
        return gltf.scene;
      } catch (err) {
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
      }
    }
    return null;
  })();
  areaCache.set(url, promise);
  return promise;
}

async function showTerrain() {
  const token = ++state.token;
  const areas = visibleAreas();
  document.body.classList.add("loading");
  const roots = [];
  for (const area of areas) {
    const root = await loadArea(area);
    if (token !== state.token) return;
    if (root) roots.push(root);
  }
  terrainRoot.clear();
  for (const r of roots) terrainRoot.add(r);
  document.body.classList.remove("loading");
}

const markerGroups = new Map();

async function buildMarkers() {
  markerGroups.clear();
  const items = categorize(state.markers);
  for (const tile of TILES) {
    const mine = items.filter((it) => it.tile === tile.key);
    for (const it of mine) it.canvas = (await markerTexture(tile, tile.key === "amulet" ? it.icon : tile.icon)).image;
    markerGroups.set(tile.key, { tile, all: mine, shown: [] });
  }
  refreshMarkers();
}

function refreshMarkers() {
  for (const g of markerGroups.values()) {
    const on = state.enabled.get(g.tile.key);
    g.shown = on ? g.all.filter(inScope) : [];
  }
  overlayDirty = true;
  redraw = true;
  renderTiles();
}

const BADGE = 30;
const STALKS = [34, 60, 86, 112];
const TOP_MARGIN = 64;
const PRIORITY = { tomb: 0, idol: 0, amulet: 1, beehive: 2, revive: 2, belltower: 3, ancient: 3, epic: 4, odd: 5, animals: 6, big: 6, fungi: 7, luggage: 8 };
const overlay = document.createElement("canvas");
overlay.id = "overlay";
root.appendChild(overlay);
const octx = overlay.getContext("2d");
let overlayDirty = true;
let placed = [];
let lastView = "";
let hoveredBadge = null;
const pointerPx = { x: -1, y: -1 };

function resizeOverlay() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  overlay.width = Math.round(window.innerWidth * dpr);
  overlay.height = Math.round(window.innerHeight * dpr);
  overlay.style.width = window.innerWidth + "px";
  overlay.style.height = window.innerHeight + "px";
  octx.setTransform(dpr, 0, 0, dpr, 0, 0);
  overlayDirty = true;
}
resizeOverlay();

function layoutBadges() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const v = new THREE.Vector3();
  const candidates = [];
  for (const g of markerGroups.values()) {
    for (const item of g.shown) {
      v.set(item.pos[0], item.pos[1] + 0.5, item.pos[2]).project(camera);
      if (v.z < -1 || v.z > 1 || v.x < -1.05 || v.x > 1.05 || v.y < -1.05 || v.y > 1.05) continue;
      candidates.push({ item, canvas: item.canvas, ring: g.tile.ring, ax: ((v.x + 1) / 2) * w, ay: ((1 - v.y) / 2) * h, z: v.z, prio: PRIORITY[g.tile.key] ?? 9 });
    }
  }
  candidates.sort((a, b) => a.prio - b.prio || a.z - b.z);
  placed = [];
  const gap = BADGE + 2;
  for (const c of candidates) {
    let spot = null;
    for (const len of STALKS) {
      const x = c.ax;
      const y = c.ay - len;
      if (y < TOP_MARGIN) break;
      if (!placed.some((p) => Math.abs(p.x - x) < gap && Math.abs(p.y - y) < gap)) {
        spot = { ...c, x, y, more: 0 };
        break;
      }
    }
    if (spot) {
      placed.push(spot);
      continue;
    }
    let best = null;
    let bestD = Infinity;
    for (const p of placed) {
      const d = Math.hypot(p.x - c.ax, p.y - (c.ay - STALKS[0]));
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    if (best && bestD < BADGE * 3) best.more += 1;
  }
}

function drawBadges() {
  octx.clearRect(0, 0, overlay.width, overlay.height);
  for (const p of placed) {
    octx.beginPath();
    octx.moveTo(p.ax, p.ay);
    octx.lineTo(p.x, p.y + BADGE / 2);
    octx.lineWidth = 3;
    octx.strokeStyle = "rgba(0,0,0,0.45)";
    octx.stroke();
    octx.lineWidth = 1.5;
    octx.strokeStyle = p === hoveredBadge ? "#ffffff" : "rgba(255,255,255,0.8)";
    octx.stroke();
    octx.beginPath();
    octx.arc(p.ax, p.ay, 3.5, 0, Math.PI * 2);
    octx.fillStyle = p.ring;
    octx.fill();
    octx.lineWidth = 1.5;
    octx.strokeStyle = "rgba(0,0,0,0.7)";
    octx.stroke();
  }
  for (const p of placed) {
    const size = p === hoveredBadge ? BADGE + 8 : BADGE;
    octx.drawImage(p.canvas, p.x - size / 2, p.y - size / 2, size, size);
    if (p.more) {
      const label = "+" + p.more;
      octx.font = `12px "Darumadrop One", sans-serif`;
      const tw = octx.measureText(label).width + 8;
      const bx = p.x + BADGE / 2 - 6;
      const by = p.y - BADGE / 2 - 4;
      octx.fillStyle = "rgba(0,0,0,0.8)";
      octx.beginPath();
      octx.roundRect(bx, by, tw, 15, 7);
      octx.fill();
      octx.fillStyle = "#fff";
      octx.fillText(label, bx + 4, by + 11.5);
    }
  }
}

function viewKey() {
  return camera.matrixWorld.elements.map((e) => e.toFixed(3)).join(",") + camera.aspect;
}

let popupOwner = null;

function showPopup(owner, icon, label) {
  popupOwner = owner;
  $("item-popup-image").style.backgroundImage = `url('${iconUrl(icon)}')`;
  $("item-popup-name").textContent = label;
  $("item-popup").style.opacity = 1;
}

function hidePopup(owner) {
  if (popupOwner !== owner) return;
  popupOwner = null;
  $("item-popup").style.opacity = 0;
}

const scopeCount = (tile) => markerGroups.get(tile.key)?.all.filter(inScope).length ?? 0;

function renderTiles() {
  renderTileList(scopeCount);
}

function renderTileList(countOf) {
  const el = $("tiles");
  el.innerHTML = "";
  hidePopup("tile");
  for (const group of GROUPS) {
    const present = group.tiles.filter((tile) => group.always || countOf(tile) > 0);
    if (!present.length) continue;
    const entry = document.createElement("div");
    entry.className = "settings-entry";
    const header = document.createElement("div");
    header.className = "tile-group";
    header.textContent = group.label;
    entry.appendChild(header);
    for (const tile of present) renderTile(entry, tile, countOf(tile));
    el.appendChild(entry);
  }
}

const TILE_2D = {
  luggage: ["luggage", ["LuggageSmall"]],
  big: ["luggage", ["LuggageBig"]],
  epic: ["luggage", ["LuggageEpic"]],
  ancient: ["luggage", ["LuggageAncient"]],
  odd: ["luggage", ["LuggageClown", "LuggageTrick"]],
  revive: ["luggage", ["scout_statue"]],
  belltower: ["belltower", null],
  amulet: ["amulets", null],
  tomb: ["tombs", null],
  Capybara: ["animals", ["Capybara"]],
  Antlion: ["animals", ["Antlion"]],
  Beehive: ["animals", ["Beehive"]],
  EarlyWorm: ["animals", ["EarlyWorm"]],
};

function tileOfPoint(el) {
  for (const [key, [group, specials]] of Object.entries(TILE_2D)) {
    if (el.classList.contains(group) && (!specials || specials.some((s) => el.classList.contains(s)))) return key;
  }
  return null;
}

export function apply2dTiles() {
  const counts = new Map();
  for (const el of document.querySelectorAll("#container .point")) {
    const key = tileOfPoint(el);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    el.style.display = state.enabled.get(key) ? "" : "none";
  }
  renderTileList((tile) => counts.get(tile.key) ?? 0);
}

function renderTile(el, tile, count) {
  const on = state.enabled.get(tile.key);
  const b = document.createElement("button");
  b.className = `tile${on ? " on" : ""}${count ? "" : " empty"}`;
  b.disabled = count === 0;
  b.style.setProperty("--ring", tile.ring);
  b.innerHTML = `<img src="${iconUrl(tile.icon)}" alt=""><span class="count">${count}</span>`;
  b.addEventListener("click", () => {
    state.enabled.set(tile.key, !state.enabled.get(tile.key));
    if (state.active) refreshMarkers();
    else apply2dTiles();
  });
  b.addEventListener("mouseenter", () => showPopup("tile", tile.icon, tile.label));
  b.addEventListener("mouseleave", () => hidePopup("tile"));
  el.appendChild(b);
}

function biomeCycle() {
  return biomeOrder(state.groups);
}

function renderBiomes() {
  const sel = $("biome3d");
  sel.innerHTML = biomeCycle()
    .map((area) => `<option value="${area}">${areaLabel(area)}</option>`)
    .join("");
  sel.value = state.biome;
}

export function step(delta) {
  const cycle = biomeCycle();
  const i = cycle.indexOf(state.biome);
  selectBiome(cycle[(i + delta + cycle.length) % cycle.length]);
}

function areaBox(areas) {
  const box = new THREE.Box3();
  for (const a of areas) {
    const g = state.groups[a];
    if (!g) continue;
    box.expandByPoint(new THREE.Vector3(...g.min));
    box.expandByPoint(new THREE.Vector3(...g.max));
  }
  return box;
}

let flight = null;
function flyTo(areas) {
  const box = areaBox(areas);
  if (box.isEmpty()) return;
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const vfov = THREE.MathUtils.degToRad(camera.fov);
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
  const fit = Math.max(size.y / 2 / Math.tan(vfov / 2), size.x / 2 / Math.tan(hfov / 2)) * 0.9;
  const dist = fit + size.z * 0.15;
  const pos = center.clone().add(new THREE.Vector3(0, size.y * 0.12, -dist));
  flight = { fromPos: camera.position.clone(), fromTarget: controls.target.clone(), toPos: pos, toTarget: center.clone(), t: 0 };
}

function selectBiome(area) {
  state.biome = area;
  renderBiomes();
  refreshMarkers();
  flyTo([area]);
  showTerrain();
}

function renderBerry() {
  const el = $("berry");
  const t = state.markers.mushroomTable;
  const lists = state.markers.spawnLists ?? {};
  const has = (state.markers.GroundPlaceSpawner ?? []).some((s) => (lists[String(s.list)] ?? []).some(([n]) => n.startsWith("Shroomberry")));
  if (!t || !has) {
    el.hidden = true;
    return;
  }
  const effect = t.effects[4 % t.effects.length];
  const good = effect <= 4;
  el.innerHTML = `<img src="${iconUrl("Shroomberry_Purple")}" alt=""><div>Purple berry: <span class="${good ? "good" : "bad"}">${good ? "good" : "bad"}</span> (${EFFECTS[effect]})<br><span class="note">Red/Yellow good, Green/Blue bad</span></div>`;
  el.hidden = false;
}

async function loadLevelData(level) {
  state.level = level;
  document.body.classList.add("loading");
  const base = `${BASE}data/${level}/`;
  const [groups, markers, palette] = await Promise.all([fetchJson(base + "groups.json"), fetchJson(base + "markers.json"), fetchJson(base + "palette.json").catch(() => [])]);
  if (state.level !== level) return;
  state.groups = groups;
  state.markers = markers;
  paletteUniform.value.forEach((c, i) => {
    const p = palette[i];
    if (p) c.setRGB(p[0], p[1], p[2], THREE.SRGBColorSpace);
    else c.setRGB(0, 0, 0);
    if (p && p.length >= 6) topParamsUniform.value[i].set(p[3], p[4], p[5]);
    else topParamsUniform.value[i].set(0.5, 0.8, 1);
  });
  const order = biomeOrder(groups);
  if (state.biomeIndex != null) {
    state.biome = order[Math.min(state.biomeIndex, order.length - 1)];
    state.biomeIndex = null;
  } else if (!order.includes(state.biome)) {
    state.biome = order[0];
  }
  renderBerry();
  await buildMarkers();
  renderBiomes();
  flyTo([state.biome]);
  if (!camera.position.lengthSq() && flight) {
    camera.position.copy(flight.toPos);
    controls.target.copy(flight.toTarget);
    flight = null;
  }
  await showTerrain();
}

function pickBadge() {
  for (let i = placed.length - 1; i >= 0; i--) {
    const p = placed[i];
    if (Math.hypot(pointerPx.x - p.x, pointerPx.y - p.y) <= BADGE / 2 + 3) return p;
  }
  return null;
}

function buildUi() {
  const biomeEntry = document.querySelector("#settings-content .settings-buttons").parentElement;
  const biomeSelect = document.createElement("select");
  biomeSelect.id = "biome3d";
  biomeSelect.className = "only-3d";
  biomeSelect.title = "Biome";
  biomeEntry.insertBefore(biomeSelect, biomeEntry.firstChild);

  const content = $("settings-content");
  content.insertAdjacentHTML(
    "beforeend",
    `<div id="tiles"></div>
    <div class="settings-entry only-3d">
      <select id="detail" title="Detail">
        <option value="auto">Detail: Auto</option>
        <option value="lite">Detail: Lite</option>
        <option value="0">Detail: Full</option>
      </select>
    </div>
    <div class="settings-entry only-3d">
      <label for="opt-void">Secret island</label>
      <input type="checkbox" id="opt-void">
    </div>`,
  );

  $("zoom-reminder").insertAdjacentHTML("beforebegin", `<div id="berry" class="ui-panel only-3d" hidden></div>`);

  biomeSelect.addEventListener("change", (e) => selectBiome(e.target.value));
  $("detail").addEventListener("change", (e) => {
    state.lod = e.target.value;
    showTerrain();
  });
  $("opt-void").addEventListener("change", (e) => {
    state.showVoid = e.target.checked;
    refreshMarkers();
    showTerrain();
  });
}

window.addEventListener("pointermove", (e) => {
  pointerPx.x = e.clientX;
  pointerPx.y = e.clientY;
});

function flyToPoint(target, dist) {
  const dir = camera.position.clone().sub(controls.target).normalize();
  flight = { fromPos: camera.position.clone(), fromTarget: controls.target.clone(), toPos: target.clone().add(dir.multiplyScalar(dist)), toTarget: target.clone(), t: 0 };
}

const raycaster = new THREE.Raycaster();
function terrainPointAt(clientX, clientY) {
  raycaster.setFromCamera(new THREE.Vector2((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1), camera);
  return raycaster.intersectObject(terrainRoot, true)[0]?.point ?? null;
}

let downAt = null;
renderer.domElement.addEventListener("pointerdown", (e) => (downAt = [e.clientX, e.clientY]));
renderer.domElement.addEventListener("pointerup", (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 4) return;
  const item = pickBadge()?.item;
  if (item) flyToPoint(new THREE.Vector3(...item.pos), 14);
});
renderer.domElement.addEventListener("dblclick", (e) => {
  const point = terrainPointAt(e.clientX, e.clientY);
  if (point) flyToPoint(point, Math.max(camera.position.distanceTo(controls.target) * 0.4, 12));
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  resizeOverlay();
});

let redraw = true;
function frame() {
  if (flight) {
    flight.t = Math.min(1, flight.t + 0.035);
    const k = flight.t * flight.t * (3 - 2 * flight.t);
    camera.position.lerpVectors(flight.fromPos, flight.toPos, k);
    controls.target.lerpVectors(flight.fromTarget, flight.toTarget, k);
    if (flight.t >= 1) flight = null;
  }
  controls.update();
  renderer.render(scene, camera);
  const key = viewKey();
  const moved = key !== lastView;
  if (moved || overlayDirty) {
    lastView = key;
    overlayDirty = false;
    layoutBadges();
  }
  const over = pickBadge();
  if (moved || over !== hoveredBadge || redraw) {
    redraw = false;
    hoveredBadge = over;
    drawBadges();
    if (over) showPopup("badge", over.item.icon, over.item.title + (over.more ? ` (+${over.more} nearby)` : ""));
    else hidePopup("badge");
    renderer.domElement.style.cursor = over ? "pointer" : "";
  }
}

buildUi();
apply2dTiles();

function setReminder(active) {
  const h = $("zoom-reminder")?.querySelector("h2");
  if (!h) return;
  if (active) {
    state.reminder2d ??= h.textContent;
    h.textContent = REMINDER_3D;
  } else if (state.reminder2d != null) {
    h.textContent = state.reminder2d;
  }
}

export function isActive() {
  return state.active;
}

export async function activate(level, biomeIndex = 0) {
  state.active = true;
  state.biomeIndex = Number.isFinite(biomeIndex) ? biomeIndex : 0;
  document.body.classList.add("mode-3d");
  root.hidden = false;
  setReminder(true);
  redraw = true;
  overlayDirty = true;
  renderer.setAnimationLoop(frame);
  await loadLevelData(level);
}

export function setLevel(level) {
  return loadLevelData(level);
}

export function deactivate() {
  state.active = false;
  state.token++;
  renderer.setAnimationLoop(null);
  root.hidden = true;
  document.body.classList.remove("mode-3d", "loading");
  hidePopup("badge");
  hidePopup("tile");
  setReminder(false);
  const i = biomeOrder(state.groups).indexOf(state.biome);
  return Math.min(Math.max(i, 0), 4);
}
