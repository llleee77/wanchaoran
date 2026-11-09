# 任务二 · creative 仿写：第 7 个按钮「电影墙」

> **这份文档怎么用**：参数、源码结论、答辩答案是实测过的，可以直接用；「AI 回答」部分请换成你自己真实的对话截图。
>
> 对应文件：`js/main.js` 里的 `EFFECTS.creative`，页面第 7 个按钮。

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
    translate: ['-20%', 0, -380],   // 左移 20%（占自身宽度）+ 后退 380px
    rotate:    [0, 30, 0],          // 绕 Y 轴转 30°，卡片侧过去
    scale:     0.6,                 // 缩小到 60%
    opacity:   0.55,                // 压暗，让位给当前张
    shadow:    true,                // 自带投影，强化"立起来"的体积感
    origin:    'left center'        // 以左边缘为轴旋转，像一扇门开在墙上
  },
  next: {                           // 「还没进场的那张」的姿态
    translate: ['112%', 0, -120],   // 停在右侧画外，同时后退 120px
    rotate:    [0, -6, 0],          // 轻微反向角度，进场有"推镜"感
    scale:     1.18,                // 起始放大 18%，走到中间回到 1
    shadow:    true
  }
}
```

**两个参数的直观对照**

| 参数 | 小 → 大 会怎样 |
|---|---|
| `prev.scale` 0.6 → 0.9 | 上一张变小得少，几乎不"退场"，纵深感消失 |
| `prev.rotate` 30 → 60 | 卡片侧得更狠，像翻书而不是立墙 |
| `prev.translate[2]` -380 → -1200 | 退得更远，明显"缩进深处" |
| `next.translate[0]` 112% → 100% | 进场起点贴着边框，少一点"从画外来"的戏剧感 |
| `next.scale` 1.18 → 1.5 | 推镜更猛，但太快会糊 |
| `limitProgress` 3 → 1 | 只叠 1 层，后面的卡片直接消失 |

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

改 `prev.rotate` 的**第二个数**（Y 轴）：

```js
rotate: [0, 30, 0]   →   rotate: [0, 20, 0]
```

三个数依次是 X / Y / Z 轴，单位是度。改完卡片侧得没那么狠，肉眼上"立墙"变成了"微微侧身"。如果改成 `[0, 0, 20]`（Z 轴），卡片就是在平面内歪头，不是立起来了——**这两者的区别正好说明 Y 轴旋转才有纵深**。

---

## 六、和第 7 个按钮的关系

页面上第 7 个按钮不是"又一个内置特效"，而是**同一套 creativeEffect 参数的入口**：点它 = 销毁当前实例 → 用 `effect:'creative'` + 上面这段参数重建。

> 坑：Swiper 11 **没有** `changeEffect()` 这个方法（v6 时代有，后被移除）。想在运行时换特效，只能 `destroy()` 再 `new Swiper()`，并且要把当前 `realIndex` 通过 `initialSlide` 带过去，否则会跳回第一张。这一段在 `js/main.js` 的 `build()` 里。
