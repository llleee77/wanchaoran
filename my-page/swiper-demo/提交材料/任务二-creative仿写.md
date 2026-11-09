# 任务二 · creative 仿写：第 7 个按钮「电影墙」

> **这份文档怎么用**：参数、源码结论、答辩答案是实测过的，可以直接用；「AI 回答」部分请换成你自己真实的对话截图。
>
> 对应文件：`js/main.js` 里的 `EFFECTS.creative`，页面第 7 个按钮。
>
> **想现场调参数？** 打开 `debug/tuner.html`（[在线](https://llleee77.github.io/wanchaoran/my-page/swiper-demo/debug/tuner.html)）：7 个滑杆对应 X 位移 / Z 纵深 / 倾斜角 / 缩放 / 透明度，拖一下轮播立刻按新参数重播，下方代码实时生成，可直接复制回 `js/main.js`。

---

## 一、看懂官方示例：creative 到底在动什么

打开 `swiper/demo/257-effect-creative.html`，切到 Elements 面板，随便点一张非当前 slide，看它的内联 `style`：

```html
style="transform: translate3d(-100%, 0px, -1000px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1); opacity: 0; z-index: 1;"
```

**关键结论**：官方示例没有写任何动画关键帧，它只是在**每一帧改 style.transform**。而 `translate3d / rotate / scale / opacity` 这四个值的来源，就是 `creativeEffect.prev` 和 `creativeEffect.next` 这两个对象。

---

## 二、我用的提示词

**第 1 问（让它读懂）**

> 我在看 Swiper 11 官方示例 `257-effect-creative.html`。请解释：`effect: 'creative'` 配合 `creativeEffect: { prev: {...}, next: {...} }` 时，Swiper 内部是怎么把这两个配置换算成每张 slide 的 `transform` 的？progress 是什么？`limitProgress` 起什么作用？

**第 2 问（让它动手）**

> 在这个基础上，帮我写一段 `creativeEffect`，效果要像"电影选片墙"：
> 1. 上一张离场时**缩小 + 向左移 + 绕 Y 轴带角度**，并压暗；
> 2. 下一张**从右侧画外放大着推进来**；
> 3. 往后叠 3 层，形成纵深。
> 请只给 `creativeEffect` 这一段，并逐行注释每个数字对应的视觉效果。

---

## 三、落地参数（就是页面里跑的这一套）

```js
effect: 'creative',
creativeEffect: {
  limitProgress: 3,                 // 往后叠 3 层；第 4 张及以后都压在同一位置
  prev: {                           // 「已经过去的那张」的姿态
    shadow:    true,                // 投影，倾斜时才立得起来
    translate: ['60%', 0, 190],     // 往右让 60% 宽度，同时推到眼前 190px（Z 正 = 更近）
    rotate:    [0, 0, 45]           // 绕 Z 轴平面内倾斜 45°（不是绕 Y 轴侧身）
  },
  next: {                           // 「还没进场的那张」的姿态
    translate: ['100%', 0, 120],    // 从右侧画外推进来
    scale:     0.86,                // 起始 86%，走到中间回到 1
    opacity:   0                    // 起手全透明，边走边显影
  }
}
```

**两个参数的直观对照**

> 这组数是从「Creative 调参台」的滑杆上拖出来的，三个滑杆分别对应 X 位移 / Z 纵深 / 倾斜角。

| 滑杆 | 小 → 大 | 观感 |
|---|---|---|
| prev X 位移 60% | 60% → 20% | 上一张躲到主卡后面，露出的边更少，几乎看不见 |
| prev Z 纵深 190 | 190 → 600 | 更快"冲到眼前"，倾斜后的边角更夸张，甚至遮住主卡 |
| prev 倾斜角 45° | 45° → 10° | 从"歪着甩在桌上"变回"几乎正着"，照片墙的味道没了 |
| next X 位移 100% | 100% → 60% | 进场起点更靠内，戏剧性变弱 |
| next 缩放 0.86 | 0.86 → 1.2 | 从"小个推进来"变成"大个压过来" |
| next 透明度 0 | 0 → 1 | 不再隐现，全程可见，翻页会显得更吵 |
| `limitProgress` 3 → 1 | 3 → 1 | 只叠 1 层，后面的卡片直接消失 |

---

## 四、追问与我的复述（老师要看的就是这段）

**追问**：`prev` 和 `next` 里的 `transform`，各自到底控制什么？

**我自己的话**：

> `prev` / `next` 描述的都是**"不是当前这张"时候的姿态**，不是动画本身。
>
> - `next` 是**还没进场**的下一张（progress < 0）——它此刻该待在哪儿、多大、多少透明度；
> - `prev` 是**已经过去**的上一张（progress > 0）——它退到哪儿、缩多小、侧多少度。
>
> Swiper 每一帧算一个 `progress`（当前张是 0，往右待场是负数，往左退场是正数），然后拿 `progress` 做**插值系数**，把这套姿态慢慢插值回 `scale: 1 / opacity: 1 / translate: 0` 的"正中"状态。所以：**配的是一端，另一端永远是"正中"，中间过程自动算**。`limitProgress` 只是把 progress 卡在一个上限，超出的卡片就叠在同一个位置不动了。

**源码佐证**（若被追问"你怎么知道的"）：Swiper 11.1.14 里 creative 特效用的是

```js
m[t] = `calc(${基础位移}px + (${配置值} * ${Math.abs(progress * progressMultiplier)}))`
scale = 1 - (1 - g.scale) * progress
```

即：配置值 × 进度 = 当前偏移。progress 到 0 时，所有偏移归零，就是正中。

---

## 五、答辩两问

**Q1：`transform` 里的百分比是相对谁的？**

**相对 slide 元素自己的宽高**，不是相对容器，也不是相对视口。

依据：Swiper 把 `'-20%'` 原样塞进 `calc(基础位移px + (-20% * 进度))`，再交给 `translate3d()`。而 CSS 规范里 `translate` 的百分比，基准就是**元素自身的 border-box**（x 轴对宽度、y 轴对高度）。所以 `-20%` = 往左走"自己宽度的 20%"，换成 1440 宽的展台就是大约 288px 起步——这也是为什么同一套参数换到手机上，位移手感会自动等比缩小，不用改代码。

> 顺带一句能加分的：`translate` 的第三个数（Z 轴）**不能用百分比**，只能 px，因为元素没有"厚度"可以参照。

**Q2：改一个数值让卡片转 20 度试试？**

改 `prev.rotate` 的**第三个数**（Z 轴，平面内倾斜）：

```js
rotate: [0, 0, 45]   →   rotate: [0, 0, 20]
```

三个数依次是 X / Y / Z 轴，单位是度。改完倾斜角从 45° 收到 20°，卡片没那么"歪"了。

**顺带把最容易混的一点说清楚**：`[0, 0, 45]` 是卡片在屏幕平面里歪头（照片甩在桌上的感觉，现在用的就是这个）；
`[0, 45, 0]` 才是绕 Y 轴侧身、有 3D 纵深。Z 轴和 Y 轴完全是两回事。

---

## 六、和第 7 个按钮的关系

页面上第 7 个按钮不是"又一个内置特效"，而是**同一套 creativeEffect 参数的入口**：点它 = 销毁当前实例 → 用 `effect:'creative'` + 上面这段参数重建。

> 坑：Swiper 11 **没有** `changeEffect()` 这个方法（v6 时代有，后被移除）。想在运行时换特效，只能 `destroy()` 再 `new Swiper()`，并且要把当前 `realIndex` 通过 `initialSlide` 带过去，否则会跳回第一张。这一段在 `js/main.js` 的 `build()` 里。
