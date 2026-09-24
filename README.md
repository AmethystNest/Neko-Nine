# Neko Nine

猫には九つの命がある。ギミックだらけの初見殺しアクション（全10ステージ＋エンディング）。
スマートフォン横画面向けブラウザゲーム。

## 遊び方
- ◀ ▶ で移動、JUMP でジャンプ（長押しで高く跳ぶ）
- PC: ← → / A D で移動、Space / ↑ / W / Z でジャンプ
- 命は9つ。使い切ると GAME OVER → RETRY で「到達したステージの最初から」命9つで再開
  （Stage1 に戻す旧ルールにしたい場合は `js/main.js` の `RESTART_FROM_STAGE1` を `true`）
- 進行状況は端末に自動保存され、タイトルの「つづきから」で再開できる

## ステージ
1 はじまりの廊下 / 2 雨の路地 / 3 錆びた工場 / 4 地下水路 / 5 白い研究所 /
6 雨の屋上 / 7 終電の駅 / 8 時計塔 / 9 暗闇 / 10 ただいま

## 構成
- `index.html` 画面・UI
- `js/assets.js` スプライトと効果音（v188 の素材をそのまま抽出）
- `js/engine.js` 物理・当たり判定・罠のロジック（DOM非依存）
- `js/stages.js` ストーリー文と全ステージの配置データ
- `js/render.js` 描画（ステージ背景・罠・演出・エンディング）
- `js/main.js` 進行・入力・音・ゲームオーバー・エンディング
- `tests/` ヘッドレス検証（各ステージが「初見の動きでは死に、正解の動きならクリアできる」ことを確認）

```
node tests/stages.test.js
```

デバッグ用: `index.html?stage=7` で指定ステージから、`index.html?ending=30` でエンディングを表示。

## GitHub Pages
リポジトリ直下をそのまま公開すれば `index.html` が起動ページです。

## 対応
- Android Chrome / iPhone Safari / PC Chrome・Edge
- 本番は横画面前提。PWA manifest / Service Worker 対応
- iPhone Safari はブラウザ仕様上、画面向き固定やフルスクリーン動作が Android と同一にならない場合があります
