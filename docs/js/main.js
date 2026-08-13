const response = await fetch("data/methods.json");
const methodsData = await response.json();

const HISTORY_STORAGE_KEY = "rurima-gacha-history";
const HISTORY_LIMIT = 3;

const drawButton = document.querySelector("#draw-button");
const drawAgainButton = document.querySelector("#draw-again-button");
const topScreen = document.querySelector("#top-screen");
const resultScreen = document.querySelector("#result-screen");
const methodName = document.querySelector("#method-name");
const description = document.querySelector("#description");
const example = document.querySelector("#example");
const ruremaUrl = document.querySelector("#rurema-url");
const historyList = document.querySelector("#history-list");

let history = loadHistory();

function methodLabel(method) {
  const separator = method.method_kind === "instance_method" ? "#" : ".";

  return `${method.class_name}${separator}${method.method_name}`;
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
    button.addEventListener("click", () => showResult(method));
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
  ruremaUrl.href = method.rurema_url;
  topScreen.hidden = true;
  resultScreen.hidden = false;
}

function drawMethod() {
  const randomIndex = Math.floor(Math.random() * methodsData.methods.length);
  const selectedMethod = methodsData.methods[randomIndex];

  saveToHistory(selectedMethod);
  showResult(selectedMethod);
}

renderHistory();
drawButton.addEventListener("click", drawMethod);
drawAgainButton.addEventListener("click", drawMethod);
