# DESIGN.md

## rurima.sample

Rubyリファレンスマニュアル（通称るりま）から、ランダムに1つのRubyメソッドを表示する。

Rubyの `sample` メソッドのように、**`rurima.sample` を実行するたびに1つのメソッドと出会える**体験をコンセプトとする。

画面はブラウザのコンソール / ターミナルをモチーフとし、ページ遷移は行わない。

`実行する` を押すたびに、同じTerminal領域の出力結果だけが新しいメソッドへ入れ替わる。

```text
> rurima.sample
=> Array#sample

> rurima.sample
=> Hash#clear

> rurima.sample
=> Method#name
```

「ガチャを引く」ゲーム的な表現ではなく、**Rubyのコードを実行してランダムな結果を得る感覚**をUI全体の軸とする。

---

## 1. Design Concept

### Keywords

* Dark
* Terminal
* Ruby
* Neon
* Minimal
* Playful

Rubyの技術ドキュメントを読むだけではなく、**知らないRubyメソッドに偶然出会うことを楽しめるUI**を目指す。

ゲームらしさは強く出さず、Ruby開発者が見ても違和感のない、Terminal / Console / IRBを連想するデザインにする。

特に、

**「るりまを `sample` する」**

というコンセプトが、サービス名・操作・画面表現で一貫して伝わることを重視する。

---

## 2. Layout

PCをメインとした横長レイアウト。

```text
                  rurima.sample
                    Ruby 4.0 💎
                 [ ▶ 実行する ]

┌──────────────────────────────┐  ┌─────────────┐
│ ● ● ●  rurima terminal      │  │ history     │
│                              │  │ 01 ...      │
│ > rurima.sample              │  │ 02 ...      │
│ => Array#sample              │  │ 03 ...      │
│                              │  └─────────────┘
│ 説明 / サンプルコード         │  ┌─────────────┐
│                              │  │ サービス説明 │
└──────────────────────────────┘  └─────────────┘
```

### 構成

* 上部：タイトル / Rubyバージョン / 実行ボタン
* 下部左：Terminal / Console
* 下部右：History / サービス説明
* Mobileでは縦並び

Terminalを画面の主役にし、Historyとサービス説明は補助情報として扱う。

Heroには説明文を詰め込みすぎず、結果表示領域を広く保つ。

---

## 3. Color Palette

### Background

```text
Main Background   #080D17
Panel Background  #0D1320
Panel Secondary   #101827
```

### Text

```text
Primary    #F4F7FB
Secondary  #A5B0C3
Muted      #657086
```

### Accent

```text
Ruby Pink  #FF3F78
Cyan       #42E8F5
Purple     #C879FF
```

`.sample` など一部では、Purple → Cyan のグラデーションを使用する。

背景には、ごく薄い同心円や小さな光点を配置してよい。

使用する色は cyan / pink / purple / yellow 程度に抑え、装飾は目立たせすぎない。

**ネオン表現よりも可読性を優先する。**

---

## 4. Typography

### 通常UI

`system-ui` を基本とし、外部フォントには依存しない。

### Terminal / Code

`ui-monospace` を優先し、OS標準の等幅フォントへフォールバックする。

タイトルは大きく太いサンセリフとし、画面上で最も強い視覚要素にする。

Terminal内は等幅フォントを基本とし、ブラウザコンソールやIRBを連想できる見た目にする。

---

## 5. Hero

画面上部中央に配置する。

### Title

```text
rurima.sample
```

* `rurima.`：Primary
* `.sample`：Purple → Cyan gradient

### Subtitle

```text
Ruby 4.0 💎
```

Rubyのバージョンは対象バージョンに合わせて表示する。

Heroはタイトルと実行操作を中心に、シンプルに保つ。

サービスの対象や出典に関する説明は、右カラムの補足パネルで表示する。

---

## 6. Execute Button

Heroの下に主要CTAとして配置する。

```text
▶ 実行する
```

Rubyのコードを実行する感覚を持たせるため、「引く」「抽選する」ではなく**実行する**という表現を使用する。

### Visual

* Ruby Pinkを基調としたアウトライン
* Hero内で十分目立つサイズ
* 角丸は控えめ
* hover時のみ弱いGlow
* Mobileでも押しやすいクリック領域を確保する

このボタンを押すたびに、新しいメソッドを1つ取得してTerminalを更新する。

「もう一度実行する」など、同じ役割のボタンは追加しない。

---

## 7. Terminal / Console

このUIの中心となるコンポーネント。

ブラウザDevTools、Terminal、IRBを組み合わせたような見た目にする。

結果ごとにカードを追加するのではなく、**常に同じTerminalを使い、その中身だけを置き換える。**

### Header

```text
● ● ●  rurima terminal
```

ウィンドウ / Terminalを連想できる程度の控えめなヘッダーを付ける。

---

### Idle

まだ実行していない状態。

```text
> rurima.sample

# 実行するボタンを押すと、ここに結果が表示されます

> _
```

* `>`：Ruby Pink
* `rurima.sample`：Cyan
* コメント：Muted

---

### Result

```text
> rurima.sample
=> Array#sample
```

その下に、メソッドの説明とサンプルコードを表示する。

```text
配列からランダムに要素を取得します。

irb(main):001> %w[a b c d].sample
=> "b"
```

class / kind / signatureなどの詳細情報は画面上に並べすぎない。

詳細は「るりまで詳しく見る」から確認できるため、Terminalでは**メソッドとの最初の出会いに必要な情報だけ**を表示する。

メソッド名はAccentカラーを使い、結果の中で最も目立たせる。

---

## 8. Sample Code

サンプルコードは同じTerminal内に表示する。

```text
irb(main):001> %w[a b c d].sample
=> "b"

irb(main):002> [1, 2, 3, 4, 5].sample(3)
=> [3, 5, 4]

irb(main):003> [].sample
=> nil
```

コードブロックはTerminal全体と馴染む見た目にする。

* IRBプロンプトはRuby Pink
* コード部分はCyan系
* 結果はPrimaryまたはSecondary
* 細かな構文ハイライトは行わない

サンプルコードは**読むための表示**とし、ブラウザ上でコードを実行する機能は持たせない。

---

## 9. Result Action

Terminal下部のアクションは最小限にする。

```text
↗ るりまで詳しく見る
```

対象メソッドのるりまページを新しいタブで開く。

リンクはPurple / Cyan系のAccentを使い、通常の本文リンクより少し目立たせる。

新しいメソッドを表示したい場合は、Heroの `実行する` を再度使用する。

---

## 10. Execute Interaction

`実行する` を押してもページ遷移は行わない。

同じTerminalの出力だけを更新する。

```text
> rurima.sample
=> Array#sample
```

↓

```text
> rurima.sample
=> Hash#clear
```

↓

```text
> rurima.sample
=> String#delete
```

過去の結果をTerminal下部に蓄積していくUIにはしない。

切り替え時には、ごく短いフェードや `sampling...` 表示など、Terminalらしい控えめな演出を入れてよい。

スロットやカプセルトイのような強いガチャ演出は使用しない。

---

## 11. History

Terminal右側に配置する補助パネル。

```text
history

01  Array#sample   >
02  Hash#clear     >
03  Method#name    >
```

直近の結果を少数表示する。

新しい結果ほど上に表示し、履歴はブラウザのlocalStorageに保存する。

### Visual

* 番号：Muted
* メソッド名：Primary
* 矢印などの補助要素：Cyan

履歴のメソッド名をクリックすると、ページ遷移せず、その結果を同じTerminal領域に再表示する。

HistoryはTerminalより目立たせない。

---

## 12. Service Information

Historyの下に、サービスについての簡単な説明を表示する。

例：

```text
about

Rubyリファレンスマニュアルから、
Ruby本体に組み込まれたメソッドを
ランダムに1つ表示します。
```

説明量は少なくし、Terminalの存在感を邪魔しない。

---

## 13. Panel Style

Terminal / History / Service Informationは、共通したDark系Panelとして扱う。

### Visual

* Dark Navy系の背景
* Blue Gray系の細いborder
* 控えめな角丸
* Shadow / Glowは非常に弱くする
* Accentカラーは見出しや重要な情報に限定する

Terminalを最も大きく、補助Panelはコンパクトにする。

---

## 14. Content Overflow

メソッド名・説明・サンプルコードが長い場合でも、Panelの横幅を広げてレイアウトを崩さない。

### Text

* メソッド名は必要に応じて折り返す
* 説明文もPanel内で自然に折り返す
* 長い文字列が来ても右カラムを押し出さない

### Code

コードは可読性を優先し、必要に応じて横スクロール可能にする。

無理にコードを細かく折り返して読みにくくしない。

### History

長いメソッド名は1行に収め、必要に応じて省略表示する。

```text
01 SomeVeryLongClass#very_long_met...
```

**長いコンテンツが来ても、レイアウトではなくコンテンツ側が適応することを基本ルールとする。**

---

## 15. Responsive

### Desktop

```text
Hero

Terminal + ┌─────────────┐
           │ history     │
           └─────────────┘
           ┌─────────────┐
           │ about       │
           └─────────────┘
```

### Mobile

```text
Hero

Terminal

History

About
```

画面幅が狭くなった場合は、Terminalと右カラムを縦並びにする。

モバイルでもTerminalを最初に見せ、History / Aboutはその後に配置する。

---

## 16. Design Priorities

実装時は以下を優先する。

1. **1画面内で完結する**
2. **`rurima.sample` を実行する感覚をUI全体で表現する**
3. **実行するたびにTerminalの中身だけが入れ替わる**
4. **「実行する」を唯一の主要CTAにする**
5. **Terminal / Consoleらしさを画面の中心にする**
6. **結果から「るりまで詳しく見る」へ自然につなげる**
7. **History / Aboutは補助情報として扱う**
8. **長いコンテンツでもレイアウトを崩さない**
9. **ネオン装飾より可読性を優先する**

このUIの中心コンセプトは、

**「るりまを `sample` する」**

こと。

Rubyで配列からランダムに1つ取り出すように、

```ruby
rurima.sample
#=> Array#sample
```

を実行するたび、知らなかったRubyメソッドが1つ返ってくる。

サービス名・操作・Console UIを、この考え方で一貫させる。
