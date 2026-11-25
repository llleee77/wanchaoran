/**
 * 姓名：万超然 | 学号：24001011008 |
 * 时间：2026-11-23 | 大模型：GLM
 * 说明：语音识别脚本 —— MediaRecorder 录音上传 / 音频文件上传，POST /api/asr
 */
(function () {
  var wy_micBtn = document.getElementById('wy_mic_btn');
  var wy_micIcon = document.getElementById('wy_mic_icon');
  var wy_micText = document.getElementById('wy_mic_text');
  var wy_status = document.getElementById('wy_voice_status');
  var wy_result = document.getElementById('wy_voice_result');
  var wy_fileInput = document.getElementById('wy_audio_file');
  var wy_fileBtn = document.getElementById('wy_file_btn');

  var wy_mediaRecorder = null;
  var wy_chunks = [];
  var wy_recording = false;

  function wy_escape(html) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(html)));
    return div.innerHTML;
  }

  function wy_recognize(blob, filename) {
    wy_status.textContent = '识别中…';
    wy_status.className = 'wy_voice-status';
    var fd = new FormData();
    fd.append('wy_file', blob, filename);
    fetch('http://localhost:8008/api/asr', { method: 'POST', body: fd })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        console.log('[asr] 接口返回：', json);
        if (json.code === 0) {
          wy_result.textContent = json.data.text || '(未识别到内容)';
          wy_status.textContent = '✅ 识别完成';
        } else {
          wy_result.innerHTML = '<span class="wy_err">❌ ' + wy_escape(json.msg) + '</span>';
          wy_status.textContent = '';
          wy_status.className = 'wy_voice-status wy_err';
          console.error('[asr] 识别失败：', json.msg);
        }
      })
      .catch(function (err) {
        console.error('[asr] 请求异常：', err);
        wy_result.innerHTML = '<span class="wy_err">❌ 请求异常：' + wy_escape(err.message) + '</span>';
        wy_status.textContent = '';
        wy_status.className = 'wy_voice-status wy_err';
      });
  }

  // 录音（浏览器 MediaRecorder，输出 webm 音频）
  wy_micBtn.addEventListener('click', function () {
    if (!wy_recording) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        wy_status.textContent = '当前浏览器不支持录音（请用 Chrome / Edge，且允许麦克风权限）';
        wy_status.className = 'wy_voice-status wy_err';
        return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
          wy_mediaRecorder = new MediaRecorder(stream);
          wy_chunks = [];
          wy_mediaRecorder.ondataavailable = function (e) { wy_chunks.push(e.data); };
          wy_mediaRecorder.onstop = function () {
            var blob = new Blob(wy_chunks, { type: 'audio/webm' });
            console.log('[asr] 录音完成:', (blob.size / 1024).toFixed(1) + 'KB');
            wy_recognize(blob, 'recording.webm');
            stream.getTracks().forEach(function (t) { t.stop(); });
          };
          wy_mediaRecorder.start();
          wy_recording = true;
          wy_micBtn.classList.add('wy_recording');
          wy_micIcon.textContent = '⏹';
          wy_micText.textContent = '录音中…点击结束';
          wy_status.textContent = '对着麦克风说几句话，然后点击结束';
        })
        .catch(function (err) {
          console.error('[asr] 获取麦克风失败：', err);
          wy_status.textContent = '无法访问麦克风：' + err.message + '（请检查浏览器权限）';
          wy_status.className = 'wy_voice-status wy_err';
        });
    } else {
      wy_mediaRecorder.stop();
      wy_recording = false;
      wy_micBtn.classList.remove('wy_recording');
      wy_micIcon.textContent = '🎙️';
      wy_micText.textContent = '点击开始录音';
    }
  });

  // 文件上传
  wy_fileBtn.addEventListener('click', function () { wy_fileInput.click(); });
  wy_fileInput.addEventListener('change', function () {
    var f = wy_fileInput.files[0];
    if (f) wy_recognize(f, f.name);
  });
})();
