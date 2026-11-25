/**
 * 姓名：万超然 | 学号：24001011008 |
 * 时间：2026-11-23 | 大模型：GLM
 * 说明：图像识别脚本 —— 图片转 base64 dataURL，POST /api/vision 调视觉模型
 */
(function () {
  var wy_area = document.getElementById('wy_img_area');
  var wy_input = document.getElementById('wy_img_input');
  var wy_preview = document.getElementById('wy_img_preview');
  var wy_placeholder = document.getElementById('wy_img_placeholder');
  var wy_question = document.getElementById('wy_vision_question');
  var wy_btn = document.getElementById('wy_vision_btn');
  var wy_result = document.getElementById('wy_vision_result');
  var wy_imageData = null; // base64 dataURL

  function wy_escape(html) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(html)));
    return div.innerHTML;
  }

  function wy_loadFile(file) {
    if (!file || !/^image\//.test(file.type)) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      wy_imageData = e.target.result;
      wy_preview.src = wy_imageData;
      wy_preview.hidden = false;
      wy_placeholder.hidden = true;
      console.log('[vision] 图片已读取:', file.name, (file.size / 1024).toFixed(1) + 'KB');
    };
    reader.readAsDataURL(file);
  }

  wy_area.addEventListener('click', function () { wy_input.click(); });
  wy_input.addEventListener('change', function () { wy_loadFile(wy_input.files[0]); });
  wy_area.addEventListener('dragover', function (e) { e.preventDefault(); wy_area.classList.add('wy_drag'); });
  wy_area.addEventListener('dragleave', function () { wy_area.classList.remove('wy_drag'); });
  wy_area.addEventListener('drop', function (e) {
    e.preventDefault();
    wy_area.classList.remove('wy_drag');
    wy_loadFile(e.dataTransfer.files[0]);
  });

  wy_btn.addEventListener('click', function () {
    if (!wy_imageData) {
      wy_result.innerHTML = '<div class="wy_chat-tip">请先上传一张图片</div>';
      return;
    }
    wy_btn.disabled = true;
    wy_result.innerHTML = '<div class="wy_chat-tip">正在识别…</div>';

    fetch('http://localhost:8008/api/vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'siliconflow', image: wy_imageData, question: wy_question.value.trim() || '请描述这张图片的内容' })
    })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        console.log('[vision] 接口返回：', json);
        if (json.code === 0) {
          wy_result.textContent = json.data.reply || '(空回复)';
          var model = document.createElement('div');
          model.className = 'wy_vision-model';
          model.textContent = '模型：' + (json.data.model || '');
          wy_result.appendChild(model);
        } else {
          wy_result.innerHTML = '<div class="wy_err">❌ ' + wy_escape(json.msg) + '</div>';
          console.error('[vision] 识别失败：', json.msg);
        }
      })
      .catch(function (err) {
        console.error('[vision] 请求异常：', err);
        wy_result.innerHTML = '<div class="wy_err">❌ 请求异常：' + wy_escape(err.message) + '</div>';
      })
      .finally(function () { wy_btn.disabled = false; });
  });
})();
