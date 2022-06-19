<h1 align="center">
  <img src="./src-tauri/icons/app-icon.png" width="128px">
  <br/>
  <span>SubRename</span>
</h1>
<h3 align="center">字幕匹配视频文件重命名小工具</h3>

# 功能

此工具的功能就一个，就是一键更改外挂字幕文件名来匹配视频文件，或者更改视频文件名，仅此而已。目的就是方便播放器播放视频时自动加载字幕文件。

> 如果需要批量重命名，可以使用微软 [PowerToys](https://docs.microsoft.com/zh-cn/windows/powertoys/) 的 [PowerRename](https://docs.microsoft.com/zh-cn/windows/powertoys/powerrename) 功能。

- 支持视频文件格式：`.3g2`, `.3gp`, `.3gp2`, `.3gpp`, `.amv`, `.asf`, `.avi`, `.dav`, `.divx`, `.dv`, `.evo`, `.f4v`, `.flv`, `.hdmov`, `.m1v`, `.m2p`, `.m2t`, `.m2ts`, `.m2v`, `.m4v`, `.mkv`, `.mod`, `.mov`, `.mp2v`, `.mp4`, `.mp4v`, `.mpe`, `.mpeg`, `.mpg`, `.mpv2`, `.mpv4`, `.mts`, `.mxf`, `.ogm`, `.ogv`, `.pva`, `.rm`, `.rmvb`, `.tp`, `.tpr`, `.ts`, `.vob`, `.webm`, `.wmv`
- 支持字幕文件格式：`.aqt`, `.ass`, `.cvd`, `.dks`, `.idx`, `.jss`, `.mpl`, `.pjs`, `.psb`, `.rt`, `.smi`, `.srt`, `.ssa`, `.ssf`, `.sub`, `.svcd`, `.ttxt`, `.txt`, `.usf`

# 使用方法

**推荐**：先把字幕复制跟视频同一个文件夹之后，再开始进行重命名操作。不同文件夹也是可以的，但是重命名记录只会储存在视频的文件夹里。

## 基本使用

1. 点击第一个 `打开` 按钮，选择视频文件夹，记载视频和字幕文件。
   - 如果字幕文件不在同一个文件夹，可以点击第二个 `打开` 按钮，选择字幕文件夹。
2. 选中需要匹配的视频文件和字幕文件
   - 点击 `重命名字幕` ，字幕文件会更改成与视频文件同名。
   - 点击 `重命名视频` ，视频文件会更改成与字幕文件同名。

## 其他操作

### 过滤

视频文件与字幕文件列表都有一个文字输入框，可以过滤一些文件，方便重命名。

> 如一些外挂字幕合集包里，一些字幕文件名包含 `sc`（简中）或 `tc`（繁中）。输入 `sc` 的话可以过滤出简中字幕。

### 添加(可选)尾缀

左下部分有个尾缀输入框，输入的文字会添加到添加到新的文件名后面。一些播放器可以基于尾缀读取多个字幕文件。

> <文件名><尾缀>.<扩展名>

### 预览

鼠标指针移动到重命名按钮可以预览文件的新名字。

### 撤销

撤销功能会读取视频文件夹的重命名记录，进行单个撤销，或者全部撤销。如果需要此操作，请不要删除视频文件夹里生成的 `subrename_log.json` 文件。

### ⚠️ 删除重命名记录

进行重命名后，视频文件夹会生成一个 `subrename_log.json` 记录文件。方便还原文件原名，既撤回操作。此文件如果不删除，就算重开软件也可以还原文件名。删除后降不能进行撤回操作。

# 反馈

如果你有提议，发现 bug，问题。可以到 [issues](https://github.com/let-lc/SubRename/issues) 提交。

# 开发

本项目使用 [Tauri (应用框架)](https://tauri.studio/)， [SvelteKit（前端框架）](https://kit.svelte.dev/) ， [TailwindCSS（CSS 框架）](https://tailwindcss.com/) 开发，主要语言是 TypeScript。

## 环境需求

- [Node.js](https://nodejs.org/zh-cn/) (推荐 v16+)
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/)
- [Cargo](https://crates.io/)

_**推荐跟着 [Tauri 官方文档](https://tauri.app/v1/guides/) 搭建环境。**_

## 项目运行

```shell
# 安装依赖
pnpm install

# 运行项目
pnpm dev

# 项目打包
pnpm build
```

> PS：本项目使用 pnpm，但 `npm`, `yarn`, `pnpm` 都可以，请选择你喜欢包管理工具。

## 测试

`/test/sample_files` 文件夹里有些用来测试的空白视频/字幕文件。推荐复制整个文件夹使用，原文件备用。

---

欢迎提交任何 bugfix 或者优化 PR。
