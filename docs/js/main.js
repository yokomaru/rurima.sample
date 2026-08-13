const response = await fetch("data/methods.json");
const methodsData = await response.json();

const drawButton = document.querySelector("#draw-button");
const methodResult = document.querySelector("#method-result");
const methodName = document.querySelector("#method-name");
const rubyVersion = document.querySelector("#ruby-version");
const sourceLibrary = document.querySelector("#source-library");
const className = document.querySelector("#class-name");
const methodKind = document.querySelector("#method-kind");
const signatures = document.querySelector("#signatures");
const description = document.querySelector("#description");
const example = document.querySelector("#example");
const ruremaUrl = document.querySelector("#rurema-url");

drawButton.addEventListener("click", () => {
  const randomIndex = Math.floor(Math.random() * methodsData.methods.length);
  const selectedMethod = methodsData.methods[randomIndex];

  methodName.textContent = selectedMethod.method_name;
  rubyVersion.textContent = methodsData.ruby_version;
  sourceLibrary.textContent = methodsData.source_library;
  className.textContent = selectedMethod.class_name;
  methodKind.textContent = selectedMethod.method_kind;
  signatures.textContent = selectedMethod.signatures.join("\n");
  description.textContent = selectedMethod.description ?? "説明なし";
  example.textContent = selectedMethod.example ?? "使用例なし";
  ruremaUrl.href = selectedMethod.rurema_url;
  ruremaUrl.textContent = selectedMethod.rurema_url;
  methodResult.hidden = false;
});
