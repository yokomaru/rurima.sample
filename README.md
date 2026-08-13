# るりまガチャ
Rubyのメソッドと偶然出会うための小さなWebサービスです。

Rubyリファレンスマニュアル（るりま）から、Ruby本体に組み込まれたクラス・モジュールのメソッドをランダムに紹介します。

## 機能
- ランダムに1件のメソッドを表示
- 説明、使用例、るりまへのリンクを表示
- 直近3件のガチャ履歴をブラウザのlocalStorageに保存
- GitHub Pagesで静的配信

## データの出典とライセンス
このサイトのメソッドデータは、[Rubyリファレンスマニュアル（るりま）](https://docs.ruby-lang.org/ja/4.0/) および [rurema/doctree](https://github.com/rurema/doctree) をもとにしています。

ライセンスは [Creative Commons Attribution 3.0 Unported (CC BY 3.0)](https://creativecommons.org/licenses/by/3.0/) です。
_builtin のpublic methodを抽出し、JSON形式およびプレーンテキストに加工して掲載しています。
