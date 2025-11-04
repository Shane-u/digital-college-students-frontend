<template>
  <div class="live2d-widget-wrapper">
    <!-- Live2D Widget 将自动添加到这里 -->
  </div>
</template>

<!-- <script>
// live2d_path 参数建议使用绝对路径
const live2d_path = "https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/";
//const live2d_path = "/live2d-widget/";

// 封装异步加载资源的方法
function loadExternalResource(url, type) {
  return new Promise((resolve, reject) => {
    let tag;

    if (type === "css") {
      tag = document.createElement("link");
      tag.rel = "stylesheet";
      tag.href = url;
    } else if (type === "js") {
      tag = document.createElement("script");
      tag.src = url;
    }
    if (tag) {
      tag.onload = () => resolve(url);
      tag.onerror = () => reject(url);
      document.head.appendChild(tag);
    }
  });
}

// 加载 waifu.css live2d.min.js waifu-tips.js
if (screen.width >= 768) {
  Promise.all([
    loadExternalResource(live2d_path + "waifu.css", "css"),
    loadExternalResource(live2d_path + "live2d.min.js", "js"),
    loadExternalResource(live2d_path + "waifu-tips.js", "js"),
  ]).then(() => {
    // 配置选项的具体用法见 README.md
    window.initWidget({
      drag: true,
      waifuPath: live2d_path + "waifu-tips.json",
      apiPath: "https://live2d.fghrsh.net/api/",
      cdnPath: "https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/",
      tools: ["hitokoto", "switch-model", "switch-texture", "quit"],
    });

    const tips = document.querySelector("#waifu-tips");
    if (tips instanceof HTMLElement) tips.style.display = "none";
    const span = document.querySelector("#waifu-toggle span");
    if (span instanceof HTMLElement) span.innerHTML = "打开/关闭";
  });
}
localStorage.setItem("modelId", "2");
</script> -->

<style>
.live2d-widget-wrapper {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 999999;
  pointer-events: none;
}
</style>

<style>
/* 全局样式 - 确保 Live2D Widget 在最上层 */
#waifu {
  z-index: 2147483647 !important;
  pointer-events: auto !important;
  position: fixed !important;
}

#waifu-toggle {
  z-index: 2147483646 !important;
  pointer-events: auto !important;
  position: fixed !important;
}

#waifu-tips {
  z-index: 2147483645 !important;
  pointer-events: auto !important;
}

.waifu-tool {
  z-index: 2147483645 !important;
  pointer-events: auto !important;
}
</style>
