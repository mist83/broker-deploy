import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';

const SECTION_SPACING = 11.5;
const PLOT_SPACING = 0.72;

function statChip(label, value) {
  const chip = document.createElement('div');
  chip.className = 'graveyard-summary-chip';
  chip.innerHTML = `<strong>${value}</strong><span>${label}</span>`;
  return chip;
}

function gravePosition(grave) {
  const sectionX = (grave.plot.sectionGrid.x - 7.5) * SECTION_SPACING;
  const sectionZ = (grave.plot.sectionGrid.z - 7.5) * SECTION_SPACING;
  const plotX = (grave.plot.plotGrid.x - 7.5) * PLOT_SPACING;
  const plotZ = (grave.plot.plotGrid.z - 7.5) * PLOT_SPACING;

  return new THREE.Vector3(sectionX + plotX, 0, sectionZ + plotZ);
}

function createSectionMarker(scene, sectionAnchors, grave) {
  if (sectionAnchors.has(grave.plot.sectionCode)) {
    return;
  }

  sectionAnchors.add(grave.plot.sectionCode);
  const sectionX = (grave.plot.sectionGrid.x - 7.5) * SECTION_SPACING;
  const sectionZ = (grave.plot.sectionGrid.z - 7.5) * SECTION_SPACING;

  const pedestal = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.34, 2.6),
    new THREE.MeshStandardMaterial({
      color: 0x1b1712,
      roughness: 1,
      metalness: 0.02,
    }),
  );
  pedestal.position.set(sectionX - SECTION_SPACING * 0.54, 0.18, sectionZ - SECTION_SPACING * 0.54);
  scene.add(pedestal);

  const marker = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.24, 1.9, 6),
    new THREE.MeshStandardMaterial({
      color: 0x6e5a41,
      roughness: 0.92,
      metalness: 0.08,
    }),
  );
  marker.position.set(pedestal.position.x, 1.14, pedestal.position.z);
  scene.add(marker);
}

function createWorld(graves) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x15110d);
  scene.fog = new THREE.Fog(0x1f1813, 40, 160);

  const ambientLight = new THREE.HemisphereLight(0xd4bc8c, 0x1a1410, 2.6);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xf2b36f, 2.4);
  keyLight.position.set(26, 24, 8);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x8ca45d, 1.6);
  fillLight.position.set(-18, 18, -26);
  scene.add(fillLight);

  const moonGlow = new THREE.PointLight(0xead2a4, 18, 220, 2.1);
  moonGlow.position.set(4, 30, 6);
  scene.add(moonGlow);

  const groundGeometry = new THREE.PlaneGeometry(260, 260, 84, 84);
  const positions = groundGeometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const swell = Math.sin(x * 0.12) * 0.32 + Math.cos(y * 0.08) * 0.3;
    const drift = Math.sin((x + y) * 0.05) * 0.22;
    positions.setZ(index, swell + drift);
  }
  groundGeometry.computeVertexNormals();

  const ground = new THREE.Mesh(
    groundGeometry,
    new THREE.MeshStandardMaterial({
      color: 0x15110d,
      roughness: 0.98,
      metalness: 0.02,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.28;
  scene.add(ground);

  const pathMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2118,
    roughness: 0.95,
    metalness: 0.03,
  });

  for (const [width, depth, x, z] of [
    [190, 4.5, 0, 0],
    [4.5, 190, 0, 0],
    [128, 2.2, -32, -28],
    [2.2, 128, 34, 28],
  ]) {
    const path = new THREE.Mesh(new THREE.BoxGeometry(width, 0.05, depth), pathMaterial);
    path.position.set(x, -0.02, z);
    scene.add(path);
  }

  const hazeGeometry = new THREE.BufferGeometry();
  const hazeCount = 280;
  const hazePositions = new Float32Array(hazeCount * 3);
  for (let index = 0; index < hazeCount; index += 1) {
    hazePositions[index * 3] = (Math.random() - 0.5) * 220;
    hazePositions[index * 3 + 1] = Math.random() * 5 + 0.5;
    hazePositions[index * 3 + 2] = (Math.random() - 0.5) * 220;
  }
  hazeGeometry.setAttribute('position', new THREE.BufferAttribute(hazePositions, 3));
  const haze = new THREE.Points(
    hazeGeometry,
    new THREE.PointsMaterial({
      color: 0xe1cb9d,
      size: 0.22,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    }),
  );
  scene.add(haze);

  const gravesById = new Map();
  const gravesByMesh = new Map();
  const interactiveMeshes = [];
  const sectionAnchors = new Set();
  const gravePositions = [];

  graves.forEach((grave) => {
    createSectionMarker(scene, sectionAnchors, grave);

    const group = new THREE.Group();
    group.position.copy(gravePosition(grave));
    gravePositions.push(group.position.clone());

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.56, 0.24, 1.28),
      new THREE.MeshStandardMaterial({
        color: 0x18130f,
        roughness: 0.95,
        metalness: 0.03,
      }),
    );
    base.position.y = 0.12;
    group.add(base);

    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x9b876e,
      roughness: 0.9,
      metalness: 0.06,
    });

    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.7, 0.28), stoneMaterial);
    shaft.position.y = 1;
    group.add(shaft);

    const crown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.46, 0.28, 24, 1, false, Math.PI, Math.PI),
      stoneMaterial,
    );
    crown.rotation.z = Math.PI / 2;
    crown.position.set(0, 1.84, 0);
    group.add(crown);

    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(0.56, 0.22),
      new THREE.MeshStandardMaterial({
        color: 0x3c342a,
        roughness: 0.56,
        metalness: 0.32,
      }),
    );
    plaque.position.set(0, 1.05, 0.145);
    group.add(plaque);

    const graveLight = new THREE.PointLight(0xd97b2d, 0, 5.4, 2.4);
    graveLight.position.set(0, 1.4, 1.1);
    group.add(graveLight);

    group.userData = { grave, graveLight };
    scene.add(group);

    gravesById.set(grave.repo, group);
    gravesByMesh.set(shaft, group);
    gravesByMesh.set(crown, group);
    gravesByMesh.set(plaque, group);
    interactiveMeshes.push(shaft, crown, plaque);
  });

  const min = gravePositions[0]?.clone() || new THREE.Vector3(-40, 0, -40);
  const max = gravePositions[0]?.clone() || new THREE.Vector3(40, 0, 40);

  gravePositions.forEach((value) => {
    min.min(value);
    max.max(value);
  });

  const worldCenter = min.clone().add(max).multiplyScalar(0.5);
  worldCenter.y = 1.6;
  const worldRadius = Math.max(max.x - min.x, max.z - min.z) * 0.62 || 48;

  return {
    scene,
    haze,
    gravesById,
    gravesByMesh,
    interactiveMeshes,
    worldCenter,
    worldRadius: Math.max(worldRadius, 48),
  };
}

export function mountGroundsView(root, model) {
  const sceneCanvas = root.querySelector('[data-graveyard-scene]');
  const searchInput = root.querySelector('[data-graveyard-search]');
  const summaryStrip = root.querySelector('[data-graveyard-summary]');
  const hoverReadout = root.querySelector('[data-graveyard-hover-readout]');
  const sectionReadout = root.querySelector('[data-graveyard-section-readout]');
  const graveList = root.querySelector('[data-graveyard-plot-list]');
  const visibleCount = root.querySelector('[data-graveyard-visible-count]');
  const selectedTitle = root.querySelector('[data-graveyard-selected-title]');
  const selectedSummary = root.querySelector('[data-graveyard-selected-summary]');
  const selectedFacts = root.querySelector('[data-graveyard-selected-facts]');
  const selectedEpitaph = root.querySelector('[data-graveyard-selected-epitaph]');
  const selectedTags = root.querySelector('[data-graveyard-selected-tags]');
  const selectedSalvage = root.querySelector('[data-graveyard-selected-salvage]');
  const selectedSection = root.querySelector('[data-graveyard-selected-section]');

  if (!sceneCanvas) {
    return () => {};
  }

  summaryStrip.replaceChildren(
    statChip('repos', model.summary.graveCount),
    statChip('sections', model.summary.sectionCount),
    statChip('replaced', model.summary.supersededCount),
    statChip('bundles', model.summary.bundleCount),
  );

  const renderer = new THREE.WebGLRenderer({
    canvas: sceneCanvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const { scene, haze, gravesById, gravesByMesh, interactiveMeshes, worldCenter, worldRadius } = createWorld(model.graves);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 500);
  const cameraHome = worldCenter.clone().add(new THREE.Vector3(worldRadius * 0.28, worldRadius * 0.26, worldRadius * 0.42));
  camera.position.copy(cameraHome);

  const controls = new OrbitControls(camera, sceneCanvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI * 0.44;
  controls.minDistance = 12;
  controls.maxDistance = worldRadius * 1.2;
  controls.target.copy(worldCenter);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-10, -10);
  const clock = new THREE.Clock();

  let filteredGraves = [...model.graves];
  let hoveredRepo = null;
  let selectedRepo = null;
  let overviewMode = true;
  let cameraFocus = worldCenter.clone();
  let animationFrame = 0;

  function factRow(label, value) {
    const term = document.createElement('dt');
    term.textContent = label;
    const detail = document.createElement('dd');
    detail.textContent = value;
    selectedFacts.append(term, detail);
  }

  function fillOverview() {
    selectedTitle.dataset.graveState = 'overview';
    selectedTitle.textContent = 'Overview';
    selectedSummary.textContent = 'Browse retired repos.';
    selectedSection.textContent = 'All repos';
    selectedEpitaph.textContent = 'Search or click a repo.';

    selectedFacts.replaceChildren();
    factRow('Repos', String(model.summary.graveCount));
    factRow('Sections', String(model.summary.sectionCount));
    factRow('Latest repo', model.recent[0] ? `${model.recent[0].repo} · ${new Date(model.recent[0].died).toISOString().slice(0, 10)}` : 'unknown');
    factRow('Largest snapshot', model.heavySnapshots[0] ? `${model.heavySnapshots[0].repo} · ${model.heavySnapshots[0].snapshotSizeLabel}` : 'none');

    selectedTags.replaceChildren();
    ['archive', 'stable plots', 'bundles'].forEach((value) => {
      const pill = document.createElement('span');
      pill.className = 'graveyard-pill';
      pill.textContent = value;
      selectedTags.append(pill);
    });

    selectedSalvage.replaceChildren();
    [
      'Search jumps to matching repos.',
      'Repo hash decides section and plot.',
      'Each repo can link to a snapshot, bundle, and replacement repo.',
    ].forEach((value) => {
      const item = document.createElement('li');
      item.textContent = value;
      selectedSalvage.append(item);
    });
  }

  function fillSelection(grave) {
    selectedTitle.dataset.graveState = 'repo';
    selectedTitle.textContent = grave.repo;
    selectedSummary.textContent = grave.summary || 'No summary found.';
    selectedEpitaph.textContent = grave.epitaph || 'No note saved.';
    selectedSection.textContent = `Section ${grave.plot.sectionCode.toUpperCase()} · Plot ${grave.plot.plotCode.toUpperCase()}`;

    selectedFacts.replaceChildren();
    factRow('Superseded by', grave.supersededBy || 'NONE');
    factRow('Born', grave.born || 'unknown');
    factRow('Died', grave.died || 'unknown');
    factRow('Snapshot', `${grave.files} files · ${grave.snapshotSizeLabel}`);
    factRow('Bundle', grave.hasBundle ? grave.bundleSizeLabel : grave.hasBundlePointer ? 'S3 pointer' : 'missing');
    factRow('Commit', grave.commit.slice(0, 10));

    selectedTags.replaceChildren();
    (grave.tags.length ? grave.tags : ['archived']).forEach((value) => {
      const pill = document.createElement('span');
      pill.className = 'graveyard-pill';
      pill.textContent = value;
      selectedTags.append(pill);
    });

    selectedSalvage.replaceChildren();
    if (grave.salvagePaths.length === 0) {
      const item = document.createElement('li');
      item.textContent = 'No saved paths.';
      selectedSalvage.append(item);
      return;
    }

    grave.salvagePaths.forEach((path) => {
      const item = document.createElement('li');
      item.textContent = path;
      selectedSalvage.append(item);
    });
  }

  function updateList() {
    graveList.replaceChildren();
    visibleCount.textContent = `${filteredGraves.length} visible`;

    filteredGraves.forEach((grave) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'graveyard-plot-button';
      if (grave.repo === selectedRepo) {
        button.classList.add('is-active');
      }

      button.innerHTML = `
        <strong>${grave.repo}</strong>
        <span>${grave.plot.sectionCode.toUpperCase()} / ${grave.plot.plotCode.toUpperCase()} · ${grave.supersededBy}</span>
      `;
      button.addEventListener('click', () => focusGrave(grave.repo));
      graveList.append(button);
    });
  }

  function resetOverview() {
    overviewMode = true;
    selectedRepo = null;
    cameraFocus = worldCenter.clone();
    hoverReadout.textContent = 'Search or click a repo.';
    sectionReadout.textContent = `Visible repos · ${filteredGraves.length}`;
    fillOverview();
    updateList();
  }

  function focusGrave(repoName) {
    const grave = filteredGraves.find((entry) => entry.repo === repoName) || model.graves.find((entry) => entry.repo === repoName);
    if (!grave) {
      return;
    }

    overviewMode = false;
    selectedRepo = grave.repo;
    fillSelection(grave);
    hoverReadout.textContent = `${grave.repo} · ${grave.plot.sectionCode.toUpperCase()} / ${grave.plot.plotCode.toUpperCase()}`;
    sectionReadout.textContent = `Section ${grave.plot.sectionCode.toUpperCase()} · Plot ${grave.plot.plotCode.toUpperCase()}`;

    const group = gravesById.get(grave.repo);
    if (group) {
      cameraFocus = group.position.clone();
      cameraFocus.y = 1.4;
    }

    updateList();
  }

  function applyFilter(query) {
    const lowered = query.trim().toLowerCase();
    filteredGraves = lowered
      ? model.graves.filter((grave) => grave.searchText.toLowerCase().includes(lowered))
      : [...model.graves];

    const visibleRepos = new Set(filteredGraves.map((grave) => grave.repo));
    gravesById.forEach((group, repo) => {
      group.visible = filteredGraves.length === 0 ? false : visibleRepos.has(repo);
    });

    if (filteredGraves[0]) {
      if (lowered) {
        focusGrave(filteredGraves.find((grave) => grave.repo === selectedRepo)?.repo || filteredGraves[0].repo);
        return;
      }

      if (overviewMode || !selectedRepo || !filteredGraves.some((grave) => grave.repo === selectedRepo)) {
        resetOverview();
        return;
      }

      fillSelection(filteredGraves.find((grave) => grave.repo === selectedRepo) || filteredGraves[0]);
      sectionReadout.textContent = `Visible repos · ${filteredGraves.length}`;
      updateList();
      return;
    }

    overviewMode = true;
    selectedRepo = null;
    selectedTitle.textContent = 'No matches';
    selectedSummary.textContent = 'The archive search returned nothing for this phrase.';
    selectedFacts.replaceChildren();
    selectedEpitaph.textContent = '';
    selectedTags.replaceChildren();
    selectedSalvage.replaceChildren();
    sectionReadout.textContent = 'No matching repos';
    hoverReadout.textContent = 'No repos match this search.';
    updateList();
  }

  function resize() {
    const bounds = sceneCanvas.parentElement.getBoundingClientRect();
    renderer.setSize(bounds.width, bounds.height, false);
    camera.aspect = bounds.width / bounds.height;
    camera.updateProjectionMatrix();
  }

  function handlePointerMove(event) {
    const bounds = sceneCanvas.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  }

  function handleCanvasClick() {
    if (hoveredRepo) {
      focusGrave(hoveredRepo);
    }
  }

  function animate() {
    const elapsed = clock.getElapsedTime();
    animationFrame = requestAnimationFrame(animate);

    haze.rotation.y = elapsed * 0.01;
    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects(interactiveMeshes, false);
    hoveredRepo = null;

    gravesById.forEach((group) => {
      const active = group.userData.grave.repo === selectedRepo;
      group.userData.graveLight.intensity = group.visible ? (active ? 1.18 : 0.08) : 0;
      group.position.y = active ? Math.sin(elapsed * 1.2) * 0.04 : 0;
    });

    if (intersections[0]) {
      const hoveredGroup = gravesByMesh.get(intersections[0].object);
      if (hoveredGroup) {
        hoveredRepo = hoveredGroup.userData.grave.repo;
        hoveredGroup.userData.graveLight.intensity = Math.max(hoveredGroup.userData.graveLight.intensity, 0.58);
        hoverReadout.textContent = `${hoveredRepo} · click to open`;
      }
    } else if (filteredGraves.length) {
      hoverReadout.textContent = 'Search or click a repo.';
    }

    const desiredTarget = filteredGraves.length && !overviewMode ? cameraFocus : worldCenter;
    controls.target.lerp(desiredTarget, 0.07);

    if (filteredGraves.length && !overviewMode) {
      const offset = new THREE.Vector3(8.5, 7.2, 10.5);
      const orbit = new THREE.Vector3(Math.cos(elapsed * 0.08) * 1.2, 0, Math.sin(elapsed * 0.08) * 1.2);
      camera.position.lerp(desiredTarget.clone().add(offset).add(orbit), 0.03);
    } else {
      const survey = new THREE.Vector3(
        Math.cos(elapsed * 0.05) * worldRadius * 0.04,
        Math.sin(elapsed * 0.09) * 0.9,
        Math.sin(elapsed * 0.05) * worldRadius * 0.04,
      );
      camera.position.lerp(cameraHome.clone().add(survey), 0.025);
    }

    controls.update();
    renderer.render(scene, camera);
  }

  const resizeObserver = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => resize())
    : null;

  searchInput.addEventListener('input', (event) => applyFilter(event.target.value));
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('resize', resize);
  sceneCanvas.addEventListener('click', handleCanvasClick);

  if (resizeObserver) {
    resizeObserver.observe(sceneCanvas.parentElement);
  }

  resize();
  resetOverview();
  animate();

  return () => {
    cancelAnimationFrame(animationFrame);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('resize', resize);
    sceneCanvas.removeEventListener('click', handleCanvasClick);
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    controls.dispose();
    renderer.dispose();
  };
}
