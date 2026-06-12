import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// ============================================================
// 1. CREDENTIALS — the ONLY two lines you must edit!
// ============================================================
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4YTFiMDQyZC0xMWY0LTRlMmEtOGUxZi1hMmIxODJlNzQ0ZWQiLCJpZCI6NDMzOTc3LCJzdWIiOiJhc2htZWVyYSIsImlzcyI6Imh0dHBzOi8vYXBpLmNlc2l1bS5jb20iLCJhdWQiOiJhc2htZWVyYV9kZWZhdWx0IiwiaWF0IjoxNzgxMjU4ODE4fQ.k19CApFHDlRS5vtmYlL9OPJvqgc6As448ijYnxPnS30';
const MY_ASSET_ID = 4901454; // ← your Ion Asset ID (a number, no quotes)

// ============================================================
// 2. Viewer: 3D globe + World Terrain + timeline + SHADOWS
//    (Extension: shadows — buildings cast real sunlight shadows;
//     drag the timeline at the bottom to change the time of day)
// ============================================================
const viewer = new Cesium.Viewer('cesiumContainer', {
  terrain: Cesium.Terrain.fromWorldTerrain(),
  timeline: true,
  animation: true,
  shadows: true,
  infoBox: false,
});

// ============================================================
// 3. Load the 3D buildings (your converted CityGML) and fly there
// ============================================================
const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(4901454);
viewer.scene.primitives.add(tileset);
await viewer.zoomTo(tileset);

// ============================================================
// 4. WMS basemap: TopPlusOpen (German federal mapping agency)
//    Starts HIDDEN so the app opens with satellite imagery;
//    the toolbar button turns it on.
// ============================================================
const wmsLayer = viewer.imageryLayers.addImageryProvider(
  new Cesium.WebMapServiceImageryProvider({
    url: 'https://sgx.geodatenzentrum.de/wms_topplus_open',
    layers: 'web',
    parameters: { format: 'image/png', transparent: false },
    credit: '© Bundesamt für Kartographie und Geodäsie',
  })
);
wmsLayer.show = false;

// ============================================================
// 5. Extension: color buildings by height
//    Reads each building's Height attribute from the CityGML data
// ============================================================
const heightStyle = new Cesium.Cesium3DTileStyle({
  color: {
    conditions: [
      ['${Height} >= 50', "color('#d73027')"], // tall   -> red
      ['${Height} >= 25', "color('#fc8d59')"], // medium -> orange
      ['${Height} >= 10', "color('#fee08b')"], // low    -> yellow
      ['true',            "color('#d9ef8b')"], // rest   -> green
    ],
  },
});
let colored = false; // buildings start plain white

// ============================================================
// 6. Extension: click a building to see its attributes
// ============================================================
const infoBox = document.getElementById('infoBox');
const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

handler.setInputAction((click) => {
  const picked = viewer.scene.pick(click.position);
  if (picked instanceof Cesium.Cesium3DTileFeature) {
    const id = picked.getProperty('gml:id') ?? 'unknown';
    const raw = picked.getProperty('Height');
	const h = raw !== undefined ? Number(raw).toFixed(2) : 'n/a';
    infoBox.innerHTML = `<b>🏢 Building</b><br>ID: ${id}<br>Height: ${h} m`;
    infoBox.style.display = 'block';
  } else {
    infoBox.style.display = 'none'; // clicked the ground -> hide the box
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// ============================================================
// 7. Toolbar buttons
// ============================================================
const basemapBtn = document.getElementById('basemapBtn');
basemapBtn.addEventListener('click', () => {
  wmsLayer.show = !wmsLayer.show;
  basemapBtn.textContent = wmsLayer.show
    ? '🗺️ Show Satellite'
    : '🗺️ Show Topo Map (WMS)';
});

const buildingsBtn = document.getElementById('buildingsBtn');
buildingsBtn.addEventListener('click', () => {
  tileset.show = !tileset.show;
  buildingsBtn.textContent = tileset.show
    ? '🏠 Hide Buildings'
    : '🏠 Show Buildings';
});

const colorBtn = document.getElementById('colorBtn');
const legend = document.getElementById('legend');

colorBtn.addEventListener('click', () => {
  colored = !colored;
  tileset.style = colored ? heightStyle : undefined;
  legend.style.display = colored ? 'block' : 'none'; // legend follows the coloring
  colorBtn.textContent = colored ? '🎨 Plain White' : '🎨 Color by Height';
});