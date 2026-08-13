const response = await fetch("data/methods.json");
const methodsData = await response.json();

const drawButton = document.querySelector("#draw-button");
const drawAgainButton = document.querySelector("#draw-again-button");
const topScreen = document.querySelector("#top-screen");
const resultScreen = document.querySelector("#result-screen");
const methodName = document.querySelector("#method-name");
const description = document.querySelector("#description");
const example = document.querySelector("#example");
const ruremaUrl = document.querySelector("#rurema-url");

function drawMethod() {
  const randomIndex = Math.floor(Math.random() * methodsData.methods.length);
  const selectedMethod = methodsData.methods[randomIndex];
  const separator = selectedMethod.method_kind === "instance_method" ? "#" : ".";

  methodName.textContent = `${selectedMethod.class_name}${separator}${selectedMethod.method_name}`;
  description.textContent = selectedMethod.description ?? "説明なし";
  example.textContent = selectedMethod.example ?? "使用例なし";
  ruremaUrl.href = selectedMethod.rurema_url;
  topScreen.hidden = true;
  resultScreen.hidden = false;
}

drawButton.addEventListener("click", drawMethod);
drawAgainButton.addEventListener("click", drawMethod);
