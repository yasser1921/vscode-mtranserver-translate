# mtranserver-translate

为 [Comment Translate](https://github.com/intellism/vscode-comment-translate) 提供 [MTranServer](https://github.com/xxnuo/MTranServer) 翻译源。

本扩展本身不提供独立的注释翻译 UI。安装后，在 Comment Translate 中把翻译源切换为 **MTranServer**，即可把注释、字符串、选区等翻译请求发到本地（或自建）的离线翻译服务。

## 背景

- [MTranServer](https://github.com/xxnuo/MTranServer) 是可私有部署的离线翻译服务，默认监听 `http://127.0.0.1:8989`，平均响应约 50ms，无需 GPU。
- [Comment Translate](https://github.com/intellism/vscode-comment-translate) 是 VS Code / Cursor 的注释翻译扩展，内置 Google、Bing 等在线源，并允许第三方扩展通过 `translates` 贡献点注册新翻译源。
- 官方开发教程见：[Translation Service](https://github.com/intellism/vscode-comment-translate/wiki/Translation-Service)。本仓库按该规范实现 `ITranslate`，并注册为 `mtranserver`。

官方另有 [MTranCode](https://github.com/xxnuo/MTranCode)，是 fork 整份 Comment Translate 后内置 MTranServer 的方案。本扩展走另一条路：**继续使用原版 Comment Translate，只增加一个可切换的本地翻译源**。

## 功能

- 调用 MTranServer 原生接口 `POST /translate`，返回 `{ "result": "..." }`。
- 可配置服务地址，例如 `http://127.0.0.1:8989`。
- 可配置 `MT_API_TOKEN`。服务端未设置 token 时留空即可；设置后通过 `Authorization: Bearer <token>` 认证。
- 将 Comment Translate 的语言码映射到 MTranServer（如 `zh-CN` → `zh-Hans`，`zh-TW` → `zh-Hant`）。源语言为 `auto` 时交给服务端检测。
- 首次请求某语言对时，服务端可能下载模型，因此默认超时较长。
- Hover 链接指向本机 MTranServer Web UI，便于核对服务是否可用。

## 前置条件

1. 安装 [Comment Translate](https://marketplace.visualstudio.com/items?itemName=intellsmi.comment-translate)（扩展 ID：`intellsmi.comment-translate`）。
2. 本机或局域网已运行 [MTranServer](https://github.com/xxnuo/MTranServer)。快速启动示例：

```bash
npx mtranserver@latest
```

或使用 Docker：

```yaml
services:
  mtranserver:
    image: xxnuo/mtranserver:latest
    ports:
      - "8989:8989"
    environment:
      - MT_HOST=0.0.0.0
      - MT_PORT=8989
      # - MT_API_TOKEN=your_secret_token_here
```

启动后可用浏览器打开 `http://127.0.0.1:8989/ui` 确认服务可用。首次翻译某个语言对时会下载模型，请保持网络畅通，或提前用 `--download en_zh zh_en` 预下载。

## 安装与使用

1. 安装本扩展（从 VSIX 安装，或在本仓库中按 [开发](#开发) 调试运行）。
2. 命令面板执行 Comment Translate 的 **Change translation source**（更改翻译源）。
3. 选择 **MTranServer**。
4. 在设置中填写服务地址；若服务端配置了 `MT_API_TOKEN`，同步填入 token。
5. 按 Comment Translate 原有交互使用：悬停注释、翻译选区、翻译替换等。

也可在 `settings.json` 中直接指定翻译源：

```json
{
  "commentTranslate.source": "mtranserver-translate.mtranserver",
  "commentTranslate.targetLanguage": "zh-CN",
  "mtranserverTranslate.baseUrl": "http://127.0.0.1:8989",
  "mtranserverTranslate.apiToken": ""
}
```

`commentTranslate.source` 的最终取值以安装后的扩展 ID 为准，格式为 `<publisher>.<name>.<translate-key>`。本仓库默认 publisher 尚未发布到市场，本地调试时以「更改翻译源」命令选中的项为准。

## 扩展设置

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `mtranserverTranslate.baseUrl` | string | `http://127.0.0.1:8989` | MTranServer 根地址，不要带 `/translate` 路径。支持 `http://127.0.0.1:8989`、局域网 IP、反向代理 HTTPS 地址。 |
| `mtranserverTranslate.apiToken` | string | `""` | 对应服务端环境变量 `MT_API_TOKEN`。为空则不发送认证头（服务端未设 token 时的默认行为）。 |
| `mtranserverTranslate.timeout` | number | `120000` | 请求超时，单位毫秒。首次翻译会下载并加载模型，建议不要设得过小。 |
| `mtranserverTranslate.html` | boolean | `false` | 是否把文本按 HTML 交给引擎（对应 API 的 `html` 字段）。注释翻译一般保持 `false`。 |
| `mtranserverTranslate.maxLen` | number | `5000` | 单次请求最大字符数，供 Comment Translate 在超长文本时拆分。 |
| `mtranserverTranslate.defaultFrom` | string | `auto` | Comment Translate 未给出源语言时的默认值。`auto` 由 MTranServer 自动检测。 |

Token 仅保存在 VS Code / Cursor 用户设置中，不会写入源码。请勿把真实 token 提交到 git。

## 对接约定

本扩展使用 MTranServer **原生翻译接口**，而不是 `/deepl`、`/google` 等兼容层。

**请求**

```http
POST {baseUrl}/translate
Content-Type: application/json
Authorization: Bearer <apiToken>   # 仅当 apiToken 非空时发送
```

```json
{
  "from": "en",
  "to": "zh-Hans",
  "text": "Hello, world!",
  "html": false
}
```

**响应**

```json
{
  "result": "你好，世界！"
}
```

**认证**（与服务端一致，token 为空则跳过校验）：

- Header：`Authorization: Bearer <token>`
- 兼容：`?token=`、`?api_token=`、`X-API-Token`

**语言码**

Comment Translate 沿用 VS Code / Google 风格代码（`zh-CN`、`zh-TW`、`en` 等）。MTranServer v3 起以 `zh-Hans` / `zh-Hant` 为准，并对 `zh`、`zh-CN` 等做了别名归一。插件仍会做一层显式映射，避免旧版服务或边界代码出错：

| 来源 | 发送给 MTranServer |
| --- | --- |
| `auto`、空 | `auto`（服务端检测） |
| `zh-CN`、`zh`、`zh-Hans` | `zh-Hans` |
| `zh-TW`、`zh-HK`、`zh-Hant` | `zh-Hant` |
| `en-US` 等带地区码 | 取主语言，如 `en` |
| 其他 | 原样传递，由服务端 `NormalizeLanguageCode` 处理 |

## 开发

```bash
npm install
npm run compile
```

按 `F5` 打开扩展开发宿主窗口。宿主中需已安装 Comment Translate，然后执行 **Change translation source**，选择 **MTranServer**，对着一段英文注释悬停验证。

实现要点：

1. `package.json` 的 `contributes.translates` 声明服务，`keywords` 包含 `translateSource`。
2. `extension.ts` 通过 `extendTranslate` 把实现类注册到 `comment-translate-manager`。
3. 实现 `ITranslate`：`translate`、`link`、`maxLen`。
4. 依赖 `intellsmi.comment-translate`，本扩展不会在未选择该翻译源时主动工作。

## 故障排查

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| 更改翻译源列表里没有 MTranServer | 本扩展未加载，或未安装 Comment Translate | 确认两个扩展都已启用 |
| `Unauthorized` / 401 | 服务端设置了 `MT_API_TOKEN`，插件未填或填错 | 两边 token 保持一致 |
| 连接失败 / ECONNREFUSED | 服务未启动，或 `baseUrl` 端口不对 | 打开 `{baseUrl}/health` 或 `/ui` |
| `Language pair is not supported` | 该语言对模型未下载，或离线模式缺模型 | 关闭 `MT_OFFLINE`，或预先 `--download` |
| 第一次翻译很慢或超时 | 正在下载模型 | 增大 `timeout`，先在 UI 里试译一次预热 |
| 中文译不出来或 400 | 语言码版本差异 | 目标语言用 `zh-CN`（插件会映射为 `zh-Hans`）；极旧的 2.x 服务可能只认 `zh` |

## 相关项目

- [xxnuo/MTranServer](https://github.com/xxnuo/MTranServer) — 离线翻译服务
- [intellism/vscode-comment-translate](https://github.com/intellism/vscode-comment-translate) — 注释翻译扩展
- [intellism/deepl-translate](https://github.com/intellism/deepl-translate) — 官方翻译源插件示例
- [Translation Service Wiki](https://github.com/intellism/vscode-comment-translate/wiki/Translation-Service)

## 许可

MIT
