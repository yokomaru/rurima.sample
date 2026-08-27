const response = await fetch("data/methods.json");
const methodsData = await response.json();
const updateStatus = await fetch("data/update-status.json")
  .then((statusResponse) => statusResponse.ok ? statusResponse.json() : null)
  .catch(() => null);

const HISTORY_STORAGE_KEY = "rurima-gacha-history";
const CLASS_SELECTION_STORAGE_KEY = "rurima-gacha-class-selection";
const FAVORITES_STORAGE_KEY = "rurima-gacha-favorites";
const HISTORY_LIMIT = 3;
const FAVORITES_LIMIT = 5;
const DEFAULT_SELECTED_CLASS_NAMES = ["Array", "Hash", "String", "Integer", "Float", "Symbol", "Range"];
const CLASS_DISPLAY_ORDER = [
  "Array", "Hash", "String", "Integer", "Float", "Symbol", "Range",
  "Enumerable", "Regexp", "Time", "File", "Dir", "IO", "ENV", "Math", "Random", "Set",
  "Object", "Kernel", "NilClass", "TrueClass", "FalseClass", "Numeric", "Comparable",
  "Enumerator", "Struct", "Data", "Class", "Module", "Proc", "Method", "UnboundMethod", "Binding"
];

const drawButton = document.querySelector("#draw-button");
const terminalIdle = document.querySelector("#terminal-idle");
const terminalLoading = document.querySelector("#terminal-loading");
const terminalResult = document.querySelector("#terminal-result");
const methodName = document.querySelector("#method-name");
const description = document.querySelector("#description");
const example = document.querySelector("#example");
const exampleContainer = document.querySelector(".example-container");
const toggleExample = document.querySelector("#toggle-example");
const ruremaUrl = document.querySelector("#rurema-url");
const historyList = document.querySelector("#history-list");
const favoriteButton = document.querySelector("#favorite-button");
const favoritesList = document.querySelector("#favorites-list");
const classChipList = document.querySelector(".class-chip-list");
const selectedClassCount = document.querySelector("#selected-class-count");
const selectedClassSummary = document.querySelector("#selected-class-summary");
const classSelectorDialog = document.querySelector("#class-selector-dialog");
const openClassSelectorButton = document.querySelector("#open-class-selector");
const closeClassSelectorButton = document.querySelector("#close-class-selector");
const selectAllClassesButton = document.querySelector("#select-all-classes");
const clearClassSelectionButton = document.querySelector("#clear-class-selection");
const resetClassSelectionButton = document.querySelector("#reset-class-selection");
const lastUpdated = document.querySelector("#last-updated");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SAMPLING_DELAY = prefersReducedMotion ? 0 : 700;
const RESULT_REVEAL_DELAY = prefersReducedMotion ? 0 : 300;
const selectableClassNames = classNamesForDisplay(methodsData.methods);
const methodsByKey = new Map(methodsData.methods.map((method) => [methodKey(method), method]));

let history = loadHistory();
let favoriteKeys = loadFavorites();
let isSampling = false;
let selectedClassNames = loadClassSelection();
let currentMethod = null;

function renderUpdateStatus() {
  const updatedAt = updateStatus?.updated_at;
  if (typeof updatedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(updatedAt)) return;

  lastUpdated.dateTime = updatedAt;
  lastUpdated.textContent = updatedAt.replaceAll("-", ".");
}

function methodLabel(method) {
  const separator = method.method_kind === "instance_method" ? "#" : ".";
  return `${method.class_name}${separator}${method.method_name}`;
}

function methodKey(method) {
  return [method.class_name, method.method_kind, method.method_name].join("\u0000");
}

function classNamesForDisplay(methods) {
  const priority = new Map(CLASS_DISPLAY_ORDER.map((name, index) => [name, index]));

  return [...new Set(methods.map((method) => method.class_name))].sort((left, right) => {
    const leftPriority = priority.get(left);
    const rightPriority = priority.get(right);

    if (leftPriority !== undefined && rightPriority !== undefined) return leftPriority - rightPriority;
    if (leftPriority !== undefined) return -1;
    if (rightPriority !== undefined) return 1;

    return left.localeCompare(right);
  });
}

function renderClassSelection() {
  const chips = selectableClassNames.map((className) => {
    const chip = document.createElement("button");
    const isSelected = selectedClassNames.has(className);

    chip.type = "button";
    chip.className = "class-chip";
    chip.dataset.className = className;
    chip.textContent = className;
    chip.classList.toggle("is-selected", isSelected);
    chip.setAttribute("aria-pressed", String(isSelected));
    chip.addEventListener("click", () => toggleClassSelection(className));
    return chip;
  });

  classChipList.replaceChildren(...chips);
  renderClassSelectionSummary();
  drawButton.disabled = selectedClassNames.size === 0 || isSampling;
}

function renderClassSelectionSummary() {
  const selectedClassNamesForDisplay = selectableClassNames.filter((className) => selectedClassNames.has(className));

  selectedClassCount.textContent = `${selectedClassNamesForDisplay.length}件選択中`;
  selectedClassSummary.textContent = selectedClassNamesForDisplay.length > 0
    ? selectedClassNamesForDisplay.join(" / ")
    : "対象を選択してください";
}

function toggleClassSelection(className) {
  if (selectedClassNames.has(className)) {
    selectedClassNames.delete(className);
  } else {
    selectedClassNames.add(className);
  }

  saveClassSelection();
  renderClassSelection();
}

function selectAllClasses() {
  selectedClassNames = new Set(selectableClassNames);
  saveClassSelection();
  renderClassSelection();
}

function clearClassSelection() {
  selectedClassNames = new Set();
  saveClassSelection();
  renderClassSelection();
}

function resetClassSelection() {
  selectedClassNames = new Set(DEFAULT_SELECTED_CLASS_NAMES);
  saveClassSelection();
  renderClassSelection();
}

function loadClassSelection() {
  const savedSelection = localStorage.getItem(CLASS_SELECTION_STORAGE_KEY);
  if (!savedSelection) return new Set(DEFAULT_SELECTED_CLASS_NAMES);

  try {
    const parsedSelection = JSON.parse(savedSelection);
    if (!Array.isArray(parsedSelection)) return new Set(DEFAULT_SELECTED_CLASS_NAMES);

    return new Set(parsedSelection.filter((className) => selectableClassNames.includes(className)));
  } catch {
    return new Set(DEFAULT_SELECTED_CLASS_NAMES);
  }
}

function saveClassSelection() {
  localStorage.setItem(CLASS_SELECTION_STORAGE_KEY, JSON.stringify([...selectedClassNames]));
}

function loadHistory() {
  const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
  if (!savedHistory) return [];

  try {
    const parsedHistory = JSON.parse(savedHistory);
    return Array.isArray(parsedHistory) ? parsedHistory.slice(0, HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
}

function renderHistory() {
  const historyItems = history.map((method) => {
    const item = document.createElement("li");
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = methodLabel(method);
    button.addEventListener("click", () => {
      if (!isSampling) showResult(method);
    });
    item.append(button);
    return item;
  });

  historyList.replaceChildren(...historyItems);
}

function saveToHistory(method) {
  history = [method, ...history].slice(0, HISTORY_LIMIT);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  renderHistory();
}

function loadFavorites() {
  const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
  if (!savedFavorites) return [];

  try {
    const parsedFavorites = JSON.parse(savedFavorites);
    if (!Array.isArray(parsedFavorites)) return [];

    return [...new Set(parsedFavorites)]
      .filter((key) => typeof key === "string" && methodsByKey.has(key))
      .slice(0, FAVORITES_LIMIT);
  } catch {
    return [];
  }
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteKeys));
}

function renderFavoriteButton(method) {
  const isFavorite = favoriteKeys.includes(methodKey(method));

  favoriteButton.textContent = isFavorite ? "★" : "☆";
  favoriteButton.setAttribute("aria-pressed", String(isFavorite));
  favoriteButton.setAttribute("aria-label", isFavorite ? "お気に入りから削除" : "お気に入りに追加");
}

function renderFavorites() {
  const favoriteItems = favoriteKeys.map((key) => methodsByKey.get(key)).filter(Boolean).map((method) => {
    const item = document.createElement("li");
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = methodLabel(method);
    button.addEventListener("click", () => {
      if (!isSampling) showResult(method);
    });
    item.append(button);
    return item;
  });

  favoritesList.replaceChildren(...favoriteItems);
}

function toggleFavorite() {
  if (!currentMethod) return;

  const currentKey = methodKey(currentMethod);
  if (favoriteKeys.includes(currentKey)) {
    favoriteKeys = favoriteKeys.filter((key) => key !== currentKey);
  } else {
    favoriteKeys = [currentKey, ...favoriteKeys].slice(0, FAVORITES_LIMIT);
  }

  saveFavorites();
  renderFavoriteButton(currentMethod);
  renderFavorites();
}

function showResult(method) {
  currentMethod = method;
  methodName.textContent = methodLabel(method);
  renderFavoriteButton(method);
  description.textContent = method.description ?? "説明なし";
  example.textContent = method.example ?? "使用例なし";
  example.classList.remove("is-expanded");
  exampleContainer.classList.remove("is-collapsed");
  toggleExample.hidden = true;
  toggleExample.textContent = "… 続きを表示 ▼";
  toggleExample.setAttribute("aria-expanded", "false");
  ruremaUrl.href = method.rurema_url;
  terminalIdle.hidden = true;
  terminalLoading.hidden = true;
  terminalResult.hidden = false;
  terminalResult.classList.remove("is-revealing");

  requestAnimationFrame(() => {
    terminalResult.classList.add("is-revealing");
    const isLongExample = example.scrollHeight > example.clientHeight;
    exampleContainer.classList.toggle("is-collapsed", isLongExample);
    toggleExample.hidden = !isLongExample;
  });
}

function toggleExampleVisibility() {
  const isExpanded = example.classList.toggle("is-expanded");
  exampleContainer.classList.toggle("is-collapsed", !isExpanded);
  toggleExample.textContent = isExpanded ? "▲ 折りたたむ" : "… 続きを表示 ▼";
  toggleExample.setAttribute("aria-expanded", String(isExpanded));
}

function executeSample() {
  if (isSampling) return;

  const eligibleMethods = methodsData.methods.filter((method) => selectedClassNames.has(method.class_name));
  if (eligibleMethods.length === 0) return;

  const randomIndex = Math.floor(Math.random() * eligibleMethods.length);
  const selectedMethod = eligibleMethods[randomIndex];

  isSampling = true;
  drawButton.disabled = true;
  terminalIdle.hidden = true;
  terminalResult.hidden = true;
  terminalLoading.hidden = false;

  window.setTimeout(() => {
    saveToHistory(selectedMethod);
    showResult(selectedMethod);

    window.setTimeout(() => {
      isSampling = false;
      renderClassSelection();
    }, RESULT_REVEAL_DELAY);
  }, SAMPLING_DELAY);
}

renderClassSelection();
renderHistory();
renderFavorites();
renderUpdateStatus();
drawButton.addEventListener("click", executeSample);
toggleExample.addEventListener("click", toggleExampleVisibility);
favoriteButton.addEventListener("click", toggleFavorite);
openClassSelectorButton.addEventListener("click", () => classSelectorDialog.showModal());
closeClassSelectorButton.addEventListener("click", () => classSelectorDialog.close());
classSelectorDialog.addEventListener("click", (event) => {
  if (event.target === classSelectorDialog) classSelectorDialog.close();
});
selectAllClassesButton.addEventListener("click", selectAllClasses);
clearClassSelectionButton.addEventListener("click", clearClassSelection);
resetClassSelectionButton.addEventListener("click", resetClassSelection);
