const response = await fetch("data/methods.json");
const methodsData = await response.json();

const drawButton = document.querySelector("#draw-button");
const methodName = document.querySelector("#method-name");

drawButton.addEventListener("click", () => {
  const randomIndex = Math.floor(Math.random() * methodsData.methods.length);
  const selectedMethod = methodsData.methods[randomIndex];

  methodName.textContent = selectedMethod.method_name;
});
