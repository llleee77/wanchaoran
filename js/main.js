/* ===== 导航栏滚动阴影 ===== */
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
});

/* ===== 移动端菜单 ===== */
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("open");
    navMenu.classList.toggle("open");
});
navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        navToggle.classList.remove("open");
        navMenu.classList.remove("open");
    });
});

/* ===== 入场动画（IntersectionObserver）===== */
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ===== 技能进度条动画 ===== */
const progressObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                bar.style.width = bar.dataset.width + "%";
                progressObserver.unobserve(bar);
            }
        });
    },
    { threshold: 0.4 }
);
document.querySelectorAll(".progress-bar").forEach((bar) => progressObserver.observe(bar));

/* ===== 数字滚动动画 ===== */
const countObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const duration = 1200;
            const start = performance.now();
            const tick = (now) => {
                const p = Math.min((now - start) / duration, 1);
                el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            countObserver.unobserve(el);
        });
    },
    { threshold: 0.6 }
);
document.querySelectorAll(".stat-num").forEach((el) => countObserver.observe(el));
