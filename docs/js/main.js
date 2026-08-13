const methodsData = {
  ruby_version: "4.0",
  source_library: "_builtin",
  methods: [
    {
      method_name: "sample",
      class_name: "Array",
      method_kind: "instance_method",
      signatures: ["sample -> object | nil", "sample(n) -> Array"],
      description: "配列から要素をランダムに選んで返します。",
      example: "[1, 2, 3].sample",
      rurema_url: "https://docs.ruby-lang.org/ja/4.0/method/Array/i/sample.html"
    },
    {
      method_name: "map",
      class_name: "Array",
      method_kind: "instance_method",
      signatures: ["map { |item| ... } -> Array", "map -> Enumerator"],
      description: "各要素にブロックを評価した結果の配列を返します。",
      example: "[1, 2, 3].map { |number| number * 2 }",
      rurema_url: "https://docs.ruby-lang.org/ja/4.0/method/Array/i/map.html"
    },
    {
      method_name: "upcase",
      class_name: "String",
      method_kind: "instance_method",
      signatures: ["upcase([options]) -> String"],
      description: "小文字を大文字に変換した文字列を返します。",
      example: null,
      rurema_url: "https://docs.ruby-lang.org/ja/4.0/method/String/i/upcase.html"
    }
  ]
};

const selectedMethod = methodsData.methods[0];

console.log(selectedMethod);
