# Rurema.sample

Rubyリファレンスマニュアル（るりま）から、Ruby本体に組み込まれたクラス・モジュールのメソッドをランダムに表示するWebサービスです。

`Rurema.sample` を実行するたびに、説明・使用例・るりまへのリンクを表示します。直近3件の履歴はブラウザのlocalStorageに保存されます。

※ 主な目的はCodexを使ったAgent AIでの実装の学習です

## ローカルで起動する

Rubyを用意したうえで、リポジトリのルートで次を実行します。

```bash
ruby -run -e httpd docs -p 8000
```

ブラウザで [http://localhost:8000](http://localhost:8000) を開きます。`methods.json` は `fetch` で読むため、HTMLファイルを直接開かず、HTTPサーバー経由で確認してください。

## methods.jsonを再生成する

データ生成にはRuby、Bundler、Gitが必要です。はじめに依存gemをインストールします。

```bash
bundle install
```

次に、BitClust公式のユーザー向けセットアップでRuby 4.0.0のDBを生成します。

```bash
bundle exec bitclust setup --versions=4.0.0
```

このコマンドはdoctreeの取得とBitClust DBの生成を行い、生成物を `$HOME/.bitclust` に保存します。リポジトリ配下には作成しません。

最後に、生成済みDBから `docs/data/methods.json` を更新します。

```bash
bundle exec ruby scripts/generate_methods.rb
```

対象はRuby 4.0の `_builtin` にあるpublic methodです。使用例がないメソッドも含め、`example` は `null` になります。

## データを自動更新する

GitHub Actionsの`Update methods data`ワークフローが、毎週日曜日の12:00（日本時間）に`methods.json`を更新します。更新があった場合のみ、`methods.json`と更新日時を記録する`update-status.json`を自動コミットします。

すぐに更新したい場合は、GitHubリポジトリの **Actions** から`Update methods data`を選び、**Run workflow**を実行してください。

## テストを実行する

BitClust DBなしで実行できる単体テストです。

```bash
bundle exec ruby -Itest test/generate_methods_test.rb
```

BitClust DBを使う統合テストです。`$HOME/.bitclust/db-4.0.0` がない場合はskipされ、`docs/data/methods.json` は上書きしません。

```bash
bundle exec ruby -Itest test/generate_methods_integration_test.rb
```

## データの出典とライセンス

メソッドデータは、[Rubyリファレンスマニュアル（るりま）](https://docs.ruby-lang.org/ja/4.0/) および [rurema/doctree](https://github.com/rurema/doctree) をもとにしています。

ライセンスは [Creative Commons Attribution 3.0 Unported (CC BY 3.0)](https://creativecommons.org/licenses/by/3.0/) です。`_builtin` のpublic methodを抽出し、JSON形式およびプレーンテキストへ加工して掲載しています。
