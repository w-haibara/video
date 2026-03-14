# データフロー図 (DFD)

> ブラウザベースの動画エディタ - Video Editor
> 作成日: 2026-03-14

---

## コンテキストダイアグラム (Level 0)

システム全体と外部エンティティ間のデータフローを示す。

```mermaid
flowchart TB
    User["👤 ユーザー<br>(ブラウザ)"]
    System[["🎬 Video Editor<br>システム"]]
    FS[("💾 ファイル<br>システム")]
    FFmpeg["⚙️ FFmpeg<br>/ FFprobe"]

    User -- "プロジェクト CRUD 要求<br>アセットインポート (ファイル)<br>シーケンス編集データ<br>エクスポート要求<br>ジョブ照会" --> System
    System -- "プロジェクト一覧/詳細<br>ジョブ進捗/ステータス<br>メディアファイル配信<br>(プロキシ/サムネイル/エクスポート)" --> User

    System -- "project.json 読み書き<br>アセットファイル保存<br>プロキシ/サムネイル/エクスポート保存" --> FS
    FS -- "project.json<br>アセットファイル<br>プロキシ/サムネイル/エクスポート" --> System

    System -- "メディア解析要求 (ffprobe)<br>プロキシ生成要求<br>サムネイル生成要求<br>画像変換要求<br>エクスポート生成要求" --> FFmpeg
    FFmpeg -- "メディアメタデータ (JSON)<br>プロキシファイル (MP4)<br>サムネイル (JPEG)<br>変換画像 (JPEG)<br>エクスポートファイル (MP4)<br>進捗データ" --> System
```

---

## L1 DFD (Level 1)

システム内部の主要プロセスとデータストア間のフローを示す。

```mermaid
flowchart TB
    User["👤 ユーザー<br>(ブラウザ)"]
    FFmpeg["⚙️ FFmpeg / FFprobe"]

    subgraph System ["Video Editor システム"]
        P1["1.0<br>プロジェクト管理"]
        P2["2.0<br>アセット<br>インポート"]
        P3["3.0<br>メディア処理<br>パイプライン"]
        P4["4.0<br>ビデオ<br>エクスポート"]
        P5["5.0<br>ジョブ管理"]
        P6["6.0<br>メディア配信"]

        DS1[("D1: プロジェクト<br>ストレージ<br>(project.json)")]
        DS2[("D2: アセット<br>ファイル")]
        DS3[("D3: プロキシ/<br>サムネイル")]
        DS4[("D4: エクスポート<br>ファイル")]
        DS5[("D5: ジョブキュー<br>(インメモリ)")]
    end

    %% ユーザー ↔ プロジェクト管理
    User -- "作成/取得/更新/削除<br>要求" --> P1
    P1 -- "プロジェクト一覧<br>プロジェクト詳細" --> User

    %% ユーザー → アセットインポート
    User -- "ファイルアップロード<br>(projectId, filename, binary)" --> P2

    %% ユーザー → エクスポート
    User -- "エクスポート要求<br>(filename)" --> P4

    %% ユーザー ↔ ジョブ管理
    User -- "ジョブ照会<br>リトライ要求" --> P5
    P5 -- "ジョブ一覧<br>ジョブ進捗" --> User

    %% ユーザー ← メディア配信
    User -- "メディア取得要求" --> P6
    P6 -- "メディアファイル<br>(動画/画像/音声)" --> User

    %% プロジェクト管理 ↔ D1
    P1 -- "読み書き" --> DS1

    %% アセットインポート
    P2 -- "アセット登録" --> DS1
    P2 -- "ファイル保存" --> DS2
    P2 -- "パイプラインジョブ<br>登録" --> P5

    %% ジョブ管理 ↔ パイプライン
    P5 -- "ジョブ実行<br>(status: processing)" --> P3
    P3 -- "完了/失敗<br>通知" --> P5
    P5 -- "読み書き" --> DS5

    %% パイプライン
    P3 -- "アセット読込" --> DS2
    P3 -- "メタデータ更新" --> DS1
    P3 -- "プロキシ/サムネイル<br>保存" --> DS3
    P3 -- "ffprobe/ffmpeg<br>実行" --> FFmpeg
    FFmpeg -- "メタデータ<br>プロキシ/サムネイル" --> P3

    %% エクスポート
    P4 -- "プロジェクト読込" --> DS1
    P4 -- "アセット読込" --> DS2
    P4 -- "エクスポートジョブ<br>登録" --> P5
    P5 -- "ジョブ実行" --> P4
    P4 -- "ffmpeg 実行" --> FFmpeg
    FFmpeg -- "エクスポートファイル<br>進捗データ" --> P4
    P4 -- "エクスポート保存" --> DS4

    %% メディア配信
    P6 -- "ファイル読込" --> DS2
    P6 -- "ファイル読込" --> DS3
    P6 -- "ファイル読込" --> DS4

    %% インポート完了応答
    P2 -- "asset, jobId" --> User
    P4 -- "jobId" --> User
```

---

## L2 DFD - プロジェクト管理 (プロセス 1.0)

```mermaid
flowchart TB
    User["👤 ユーザー"]

    subgraph P1 ["1.0 プロジェクト管理"]
        P11["1.1<br>プロジェクト<br>作成"]
        P12["1.2<br>プロジェクト<br>一覧取得"]
        P13["1.3<br>プロジェクト<br>詳細取得"]
        P14["1.4<br>プロジェクト<br>更新"]
        P15["1.5<br>プロジェクト<br>削除"]
    end

    DS1[("D1: プロジェクト<br>ストレージ")]

    User -- "POST /api/projects<br>{name}" --> P11
    P11 -- "project.json 作成<br>ディレクトリ作成<br>(assets/, proxies/,<br>thumbnails/, exports/)" --> DS1
    P11 -- "Project オブジェクト" --> User

    User -- "GET /api/projects" --> P12
    DS1 -- "全 project.json<br>スキャン" --> P12
    P12 -- "{projects: Project[]}" --> User

    User -- "GET /api/projects/:id" --> P13
    DS1 -- "project.json<br>読込 + マイグレーション" --> P13
    P13 -- "Project オブジェクト" --> User

    User -- "PUT /api/projects/:id<br>{name?, sequence?,<br>settings?}" --> P14
    DS1 -- "project.json 読込" --> P14
    P14 -- "project.json 更新" --> DS1
    P14 -- "更新済み Project" --> User

    User -- "DELETE /api/projects/:id" --> P15
    P15 -- "プロジェクト<br>ディレクトリ<br>再帰削除" --> DS1
    P15 -- "204 No Content" --> User
```

---

## L2 DFD - アセットインポート & パイプライン (プロセス 2.0 + 3.0)

```mermaid
flowchart TB
    User["👤 ユーザー"]
    FFmpeg["⚙️ FFmpeg / FFprobe"]

    subgraph P2 ["2.0 アセットインポート"]
        P21["2.1<br>ファイル受信<br>& 保存"]
        P22["2.2<br>アセット種別<br>検出"]
        P23["2.3<br>アセット登録"]
    end

    subgraph P3 ["3.0 メディア処理パイプライン"]
        P31["3.1<br>プローブ<br>(メタデータ解析)"]
        P32["3.2<br>サムネイル<br>生成"]
        P33["3.3<br>プロキシ<br>生成"]
        P34["3.4<br>画像変換<br>(HEIC→JPEG)"]
    end

    DS1[("D1: プロジェクト<br>ストレージ")]
    DS2[("D2: アセット<br>ファイル")]
    DS3[("D3: プロキシ/<br>サムネイル")]
    DS5[("D5: ジョブキュー")]

    %% インポートフロー
    User -- "POST /api/assets/import<br>?projectId&filename<br>Body: binary stream" --> P21
    P21 -- "ファイル保存<br>assets/{filename}" --> DS2
    P21 -- "filename, extension" --> P22

    P22 -- "拡張子判定<br>video: .mp4,.mov,.avi,.mkv,.webm<br>audio: .mp3,.wav,.aac,.m4a,.ogg,.flac<br>image: .jpg,.png,.gif,.webp,.heic..." --> P22
    P22 -- "Asset {id, kind,<br>originalPath}" --> P23

    P23 -- "project.assets[] に追加<br>project.json 更新" --> DS1
    P23 -- "パイプラインジョブ<br>登録" --> DS5
    P23 -- "{asset, jobId}" --> User

    %% パイプラインフロー（ジョブキューから実行）
    DS5 -- "ジョブ実行" --> P31

    %% プローブ
    DS2 -- "アセットファイル" --> P31
    P31 -- "ffprobe -print_format json<br>-show_format -show_streams" --> FFmpeg
    FFmpeg -- "ProbeResult<br>{width, height, durationMs,<br>codec, rotation,<br>colorSpace, hasAudio}" --> P31
    P31 -- "Asset メタデータ更新" --> DS1

    %% サムネイル (video/image のみ)
    P31 -- "次ステップへ" --> P32
    DS2 -- "アセットファイル" --> P32
    P32 -- "ffmpeg -vframes 1<br>-vf scale=-2:360" --> FFmpeg
    FFmpeg -- "thumbnails/{assetId}.jpg" --> P32
    P32 -- "JPEG 保存<br>thumbnailPath 更新" --> DS3
    P32 -- "thumbnailPath 更新" --> DS1

    %% プロキシ (video のみ)
    P32 -- "video の場合" --> P33
    DS2 -- "動画ファイル" --> P33
    P33 -- "ffmpeg -vf scale:-2:720<br>-c:v libx264 -preset fast" --> FFmpeg
    FFmpeg -- "proxies/{assetId}.mp4<br>+ 進捗データ" --> P33
    P33 -- "MP4 保存<br>proxyPath 更新" --> DS3
    P33 -- "proxyPath 更新" --> DS1

    %% 画像変換 (HEIC/HEIF のみ)
    P32 -- "HEIC/HEIF の場合" --> P34
    DS2 -- "HEIC/HEIF ファイル" --> P34
    P34 -- "ffmpeg -q:v 2" --> FFmpeg
    FFmpeg -- "proxies/{assetId}.jpg" --> P34
    P34 -- "JPEG 保存<br>proxyPath 更新" --> DS3
    P34 -- "proxyPath 更新" --> DS1

    %% 完了通知
    P33 -- "完了/失敗" --> DS5
    P34 -- "完了/失敗" --> DS5
```

---

## L2 DFD - ビデオエクスポート (プロセス 4.0)

```mermaid
flowchart TB
    User["👤 ユーザー"]
    FFmpeg["⚙️ FFmpeg"]

    subgraph P4 ["4.0 ビデオエクスポート"]
        P41["4.1<br>プロジェクト<br>読込 & 検証"]
        P42["4.2<br>映像フィルタ<br>構築"]
        P43["4.3<br>テキスト<br>オーバーレイ構築"]
        P44["4.4<br>オーディオ<br>ミックス構築"]
        P45["4.5<br>FFmpeg コマンド<br>組立"]
        P46["4.6<br>FFmpeg 実行<br>& 進捗監視"]
    end

    DS1[("D1: プロジェクト<br>ストレージ")]
    DS2[("D2: アセット<br>ファイル")]
    DS4[("D4: エクスポート<br>ファイル")]
    DS5[("D5: ジョブキュー")]

    User -- "POST /api/projects/:id/export<br>{filename?}" --> P41

    %% プロジェクト読込
    DS1 -- "project.json" --> P41
    P41 -- "検証: video/image<br>クリップ存在確認" --> P41
    P41 -- "Project,<br>totalDurationMs" --> P42
    P41 -- "ジョブ登録" --> DS5
    P41 -- "{jobId}" --> User

    %% 映像フィルタ構築
    P42 -- "video クリップごとに:<br>-i {assetPath}<br>trim=start:end,<br>crop, pad, scale,<br>transform フィルタ" --> P42
    P42 -- "image クリップごとに:<br>-loop 1 -t {duration}<br>-i {assetPath}<br>crop, pad, scale" --> P42
    DS2 -- "アセットパス参照" --> P42
    P42 -- "inputArgs[]<br>filterParts[]<br>clipInputIndices" --> P45

    %% テキストオーバーレイ
    P42 -- "title クリップ一覧" --> P43
    P43 -- "drawtext=text='{escaped}':<br>fontsize={size}:<br>fontcolor={color}:<br>box=1:boxcolor={bg}:<br>enable='between(t,start,end)'" --> P43
    P43 -- "overlayFilters[]" --> P45

    %% オーディオミックス
    P42 -- "audio クリップ +<br>video の hasAudio" --> P44
    P44 -- "映像音声: atrim → adelay<br>BGM: atrim → adelay → volume<br>amix (マルチトラック合成)" --> P44
    P44 -- "audioFilters[]<br>audioOutLabel" --> P45

    %% コマンド組立
    P45 -- "黒キャンバスベース:<br>color=black:s={W}x{H}:d={dur}<br>+ overlay 合成チェーン<br>+ filter_complex 全体<br>+ -c:v libx264 -c:a aac" --> P45
    P45 -- "完成した FFmpeg 引数配列" --> P46

    %% FFmpeg 実行
    P46 -- "ffmpeg [args]" --> FFmpeg
    FFmpeg -- "stdout: out_time_us=XXXXXX<br>(進捗パース)" --> P46
    FFmpeg -- "exports/{filename}.mp4" --> P46
    P46 -- "MP4 保存" --> DS4
    P46 -- "progress 更新<br>status 更新" --> DS5
```

---

## L2 DFD - ジョブ管理 (プロセス 5.0)

```mermaid
flowchart TB
    User["👤 ユーザー"]

    subgraph P5 ["5.0 ジョブ管理"]
        P51["5.1<br>ジョブ登録<br>(enqueue)"]
        P52["5.2<br>ジョブ実行<br>(drain)"]
        P53["5.3<br>ジョブ照会"]
        P54["5.4<br>ジョブリトライ"]
    end

    DS5[("D5: ジョブキュー<br>(インメモリ)<br>jobs: Map&lt;id, Job&gt;<br>tasks: Map&lt;id, Task&gt;<br>queue: string[]")]

    ExtProcess["処理プロセス<br>(パイプライン /<br>エクスポート)"]

    %% 登録
    ExtProcess -- "projectId, assetId,<br>task 関数" --> P51
    P51 -- "Job {id, status: pending,<br>progress: 0}<br>+ Task 保存<br>+ キュー追加" --> DS5
    P51 -- "jobId" --> ExtProcess
    P51 -- "drain() 呼出" --> P52

    %% 実行
    DS5 -- "キューから<br>次のジョブ取得" --> P52
    P52 -- "status: processing" --> DS5
    P52 -- "task() 実行" --> ExtProcess
    ExtProcess -- "完了" --> P52
    P52 -- "status: completed<br>progress: 1.0" --> DS5
    ExtProcess -- "エラー" --> P52
    P52 -- "status: failed<br>error メッセージ" --> DS5

    %% 照会
    User -- "GET /api/jobs/:id<br>GET /api/jobs/by-project/:projectId" --> P53
    DS5 -- "Job オブジェクト" --> P53
    P53 -- "Job / Job[]" --> User

    %% リトライ
    User -- "POST /api/jobs/:id/retry" --> P54
    DS5 -- "failed Job 取得" --> P54
    P54 -- "status: pending<br>error: クリア<br>キュー再追加" --> DS5
    P54 -- "更新済み Job" --> User
```

---

## L2 DFD - メディア配信 (プロセス 6.0)

```mermaid
flowchart TB
    User["👤 ユーザー"]

    subgraph P6 ["6.0 メディア配信"]
        P61["6.1<br>パス解決<br>& MIME 判定"]
        P62["6.2<br>ファイル<br>ストリーミング"]
    end

    DS2[("D2: アセットファイル<br>assets/")]
    DS3[("D3: プロキシ/サムネイル<br>proxies/ thumbnails/")]
    DS4[("D4: エクスポートファイル<br>exports/")]

    User -- "GET /media/projects/:projectId<br>/:type/:filename<br>type = assets | proxies |<br>thumbnails | exports" --> P61

    P61 -- "type=assets" --> DS2
    P61 -- "type=proxies<br>type=thumbnails" --> DS3
    P61 -- "type=exports" --> DS4

    DS2 -- "ファイル" --> P62
    DS3 -- "ファイル" --> P62
    DS4 -- "ファイル" --> P62

    P62 -- "Content-Type 付き<br>ファイルレスポンス<br>(video/mp4, image/jpeg, ...)" --> User
```

---

## データストア一覧

| ID | 名称 | 種別 | 物理パス | 内容 |
|----|------|------|---------|------|
| D1 | プロジェクトストレージ | ファイル | `workspace/projects/{projectId}/project.json` | プロジェクト設定、アセットメタデータ、シーケンス（トラック/クリップ）、設定 |
| D2 | アセットファイル | ファイル | `workspace/projects/{projectId}/assets/` | オリジナルのメディアファイル（動画/画像/音声） |
| D3 | プロキシ/サムネイル | ファイル | `workspace/projects/{projectId}/proxies/`<br>`workspace/projects/{projectId}/thumbnails/` | プレビュー用プロキシ (MP4/JPEG)、サムネイル (JPEG) |
| D4 | エクスポートファイル | ファイル | `workspace/projects/{projectId}/exports/` | エクスポート済み動画ファイル (MP4) |
| D5 | ジョブキュー | インメモリ | - | `Map<jobId, Job>`, `Map<jobId, Task>`, `queue: string[]` |

## 外部エンティティ一覧

| 名称 | 説明 | やり取りするデータ |
|------|------|-------------------|
| ユーザー (ブラウザ) | React SPA を操作する利用者 | HTTP リクエスト/レスポンス (JSON + バイナリ) |
| FFmpeg | メディア変換・エクスポート用外部プロセス | コマンドライン引数 → ファイル出力 + 進捗データ |
| FFprobe | メディア解析用外部プロセス | コマンドライン引数 → JSON メタデータ |
