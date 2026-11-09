# 光影展 LUMEN · 轮播实验室

### ▶ 在线演示：<https://llleee77.github.io/swiper-lumen/>

**提示词记录（作业入口）**：<https://llleee77.github.io/swiper-lumen/prompts.html>

课堂任务 06 · **万超然 / 24001011008**

> 一个 Swiper 11 的轮播作品：6 件展品、6 种内置特效 + 1 种手写 `creative` 变换，键盘 / 滚轮 / 拖拽三通道控制，参数可现场调、结论可现场验。

## 一、入口

| 我要看什么 | 去哪里 |
|---|---|
| **提示词记录**（三轮迭代 + AI 原始回答 + 验证结论 + 答辩答案） | [`prompts.html`](prompts.html) |
| 能运行的轮播页面 | [`index.html`](index.html) |
| 任务一的提交文档 | [`提交材料/任务一-提示词工程.md`](提交材料/任务一-提示词工程.md) |
| 任务二的提交文档 | [`提交材料/任务二-creative仿写.md`](提交材料/任务二-creative仿写.md) |
| 任务三的提交文档 + 答辩 | [`提交材料/任务三-综合创作与答辩.md`](提交材料/任务三-综合创作与答辩.md) |
| 在线演示（GitHub Pages） | <https://llleee77.github.io/swiper-lumen/> |
| A/B 对照实验（答辩道具，两套配置并排跑） | [`debug/index.html`](debug/index.html) |
| 复现：只引核心包会怎样 | [`debug/core-only.html`](debug/core-only.html) |
| **Creative 调参台**（拖滑杆实时看轮播） | [`debug/tuner.html`](debug/tuner.html) |

## 二、三条任务分别落在哪

| 要求 | 实现在哪 |
|---|---|
| `new Swiper('#mySwi4', {…})` 四条硬性要求（① 无缝循环 ② 3.2s 自动翻页且手动后不停 ③ 圆点可点击 ④ 初始 cube） | `js/main.js` → `BASE` + `EFFECTS.cube`；页面「需求对照表」逐条标注 |
| 第 7 个按钮「creative 电影墙」 | `js/main.js` → `EFFECTS.creative` |
| 第六件展品 爱达·魔都号（AI 生成横版 16:9） | `index.html` 第 6 张 slide + `img/exhibit-06-adora.png` |
| **课堂没讲过的能力：浏览器历史（官方 demo 340）** | `js/main.js` → `bindHistory()`：`pushState` 写 `#展品名`、`popstate` 切回对应张；地址栏会跟着变，按浏览器后退能回上一张 |
| 附加：parallax 视差 | `parallax: true` + 三层 `data-swiper-parallax`（-320 / -170 / -90），第四个开关可现场关掉对比 |
| 附加：keyboard / mousewheel（课上讲过，不计分） | 页面开关可现场开合 |
| 现场改 `delay` 并解释预期 | 页面右下「现场调参」，拖滑块自动回一段预期说明 |

## 三、目录

```
├─ index.html                 轮播主页（6 件展品 + 7 个特效按钮 + 参数面板）
├─ prompts.html               提示词记录（作业要用它当“访问入口”）
├─ css/style.css              两个页面共用
├─ js/main.js                 Swiper 初始化 / 特效切换 / 键盘滚轮 / 现场调参
├─ vendor/                    swiper-bundle 11.1.14（本地引入，断网可用）
├─ img/                       展品图 + 4 张实拍记录（shot-01 ~ shot-04）
├─ debug/                     对照实验页 / 核心包复现页（不参与作品主流程）
└─ 提交材料/                   三份 Markdown 提交件 + AI 生成原图 + 整页截图
```

## 四、本地运行

双击 `index.html` 即可，**不需要服务器、不需要联网**。

> 改完 `css/style.css` 或 `js/main.js` 之后，记得把 `index.html` / `prompts.html` 里引用处的
> `?v=20261109b` 改成新日期——GitHub Pages 的缓存是 10 分钟（`Cache-Control: max-age=600`），
> 不改版本号的话，别人刷新看到的还是旧文件。

## 五、答辩偷懒入口

地址栏加参数可以直接到状态，省得现场手点：

```
index.html?fx=creative          直接进 creative 电影墙
index.html?fx=cube&slide=6      指定特效 + 直接停在第 6 张（邮轮）
index.html?delay=800            用 800ms 的间隔打开（演示“追尾”）
```

控制台里还有 `window.mySwiper`，可以直接 `mySwiper.params.autoplay.delay = 1200`。

## 六、一眼验收

1. 打开首页，看它自己翻页 → 拖一下，还在翻（任务一 ②）
2. 点第 5 个圆点，直接跳过去（③）
3. 按 →，翻页（任务三 keyboard）
4. 点第 7 个按钮 ★，卡片侧着退场（任务二）
5. 把 delay 拖到 800，看它“卡带”（任务三答辩 Q4）
