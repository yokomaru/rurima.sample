const response = await fetch("data/methods.json");
const methodsData = await response.json();

const HISTORY_STORAGE_KEY = "rurima-gacha-history";
const HISTORY_LIMIT = 3;
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
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SAMPLING_DELAY = prefersReducedMotion ? 0 : 700;
const RESULT_REVEAL_DELAY = prefersReducedMotion ? 0 : 300;
const selectableClassNames = classNamesForDisplay(methodsData.methods);

let history = loadHistory();
let isSampling = false;

function methodLabel(method) {
  const separator = method.method_kind === "instance_method" ? "#" : ".";
  return `${method.class_name}${separator}${method.method_name}`;
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

function showResult(method) {
  methodName.textContent = methodLabel(method);
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

  const randomIndex = Math.floor(Math.random() * methodsData.methods.length);
  const selectedMethod = methodsData.methods[randomIndex];

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
      drawButton.disabled = false;
    }, RESULT_REVEAL_DELAY);
  }, SAMPLING_DELAY);
}

renderHistory();
drawButton.addEventListener("click", executeSample);
toggleExample.addEventListener("click", toggleExampleVisibility);
