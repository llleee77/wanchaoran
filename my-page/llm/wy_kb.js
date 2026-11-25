/**
 * 姓名：万超然 | 学号：24001011008 |
 * 时间：2026-11-23 | 大模型：GLM
 * 说明：知识库脚本 —— 文档上传/列表/删除 + 向量检索问答，结果输出到控制台
 */
(function () {
  var wy_uploadArea = document.getElementById('wy_upload_area');
  var wy_fileInput = document.getElementById('wy_file_input');
  var wy_uploadStatus = document.getElementById('wy_upload_status');
  var wy_docList = document.getElementById('wy_doc_list');
  var wy_boxEl = document.getElementById('wy_kb_box');
  var wy_questionEl = document.getElementById('wy_kb_question');
  var wy_askBtn = document.getElementById('wy_kb_btn');

  function wy_escape(html) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(html)));
    return div.innerHTML;
  }

  // ===== 文档列表 =====
  function wy_loadDocs() {
    fetch('http://localhost:8008/api/kb/list')
      .then(function (r) { return r.json(); })
      .then(function (json) {
        console.log('[kb] 文档列表：', json);
        if (json.code !== 0) { wy_docList.innerHTML = '<li class="wy_loading-sm">加载失败</li>'; return; }
        var list = (json.data && json.data.list) || [];
        if (!list.length) { wy_docList.innerHTML = '<li class="wy_loading-sm">暂无文档，先上传一个吧</li>'; return; }
        wy_docList.innerHTML = '';
        list.forEach(function (d) {
          var li = document.createElement('li');
          li.className = 'wy_doc-item';
          li.innerHTML = '<span class="wy_doc-name">📄 ' + wy_escape(d.filename) + '</span>'
            + '<span class="wy_doc-meta">' + d.chunk_count + '块</span>'
            + '<button class="wy_doc-del" type="button">删除</button>';
          li.querySelector('.wy_doc-del').addEventListener('click', function () {
            if (!confirm('确定删除文档「' + d.filename + '」及其全部知识块？')) return;
            fetch('http://localhost:8008/api/kb/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: d.id })
            })
              .then(function (r) { return r.json(); })
              .then(function (json2) {
                console.log('[kb] 删除结果：', json2);
                wy_loadDocs();
              });
          });
          wy_docList.appendChild(li);
        });
      })
      .catch(function (err) {
        console.error('[kb] 列表请求异常：', err);
        wy_docList.innerHTML = '<li class="wy_loading-sm">请求异常，请确认后端已启动</li>';
      });
  }

  // ===== 上传 =====
  function wy_uploadFile(file) {
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name)) {
      wy_uploadStatus.textContent = '仅支持 .txt / .md 文件';
      wy_uploadStatus.className = 'wy_upload-status wy_err';
      return;
    }
    wy_uploadStatus.textContent = '上传并向量化中：' + file.name + ' …';
    wy_uploadStatus.className = 'wy_upload-status';

    var fd = new FormData();
    fd.append('wy_file', file);
    fetch('http://localhost:8008/api/kb/upload', { method: 'POST', body: fd })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        console.log('[kb] 上传返回：', json);
        if (json.code === 0) {
          wy_uploadStatus.textContent = '✅ 入库成功：切成 ' + json.data.chunks + ' 块';
          wy_uploadStatus.className = 'wy_upload-status wy_ok';
          wy_loadDocs();
        } else {
          wy_uploadStatus.textContent = '❌ ' + json.msg;
          wy_uploadStatus.className = 'wy_upload-status wy_err';
          console.error('[kb] 上传失败：', json.msg);
        }
      })
      .catch(function (err) {
        console.error('[kb] 上传请求异常：', err);
        wy_uploadStatus.textContent = '❌ 请求异常：' + err.message;
        wy_uploadStatus.className = 'wy_upload-status wy_err';
      });
  }

  wy_uploadArea.addEventListener('click', function () { wy_fileInput.click(); });
  wy_fileInput.addEventListener('change', function () { wy_uploadFile(wy_fileInput.files[0]); });
  wy_uploadArea.addEventListener('dragover', function (e) { e.preventDefault(); wy_uploadArea.classList.add('wy_drag'); });
  wy_uploadArea.addEventListener('dragleave', function () { wy_uploadArea.classList.remove('wy_drag'); });
  wy_uploadArea.addEventListener('drop', function (e) {
    e.preventDefault();
    wy_uploadArea.classList.remove('wy_drag');
    wy_uploadFile(e.dataTransfer.files[0]);
  });

  // ===== 问答 =====
  function wy_ask() {
    var q = wy_questionEl.value.trim();
    if (!q) return;
    wy_askBtn.disabled = true;
    var tip = wy_boxEl.querySelector('.wy_chat-tip');
    if (tip) tip.remove();

    var qDiv = document.createElement('div');
    qDiv.className = 'wy_kb-q';
    qDiv.textContent = q;
    wy_boxEl.appendChild(qDiv);

    var aDiv = document.createElement('div');
    aDiv.className = 'wy_kb-a';
    aDiv.textContent = '正在检索知识库并思考…';
    wy_boxEl.appendChild(aDiv);
    wy_boxEl.scrollTop = wy_boxEl.scrollHeight;

    fetch('http://localhost:8008/api/kb/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'siliconflow', question: q, top_k: 3 })
    })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        console.log('[kb] 问答返回：', json);
        if (json.code === 0) {
          aDiv.textContent = json.data.reply || '(空回复)';
          var src = document.createElement('details');
          src.className = 'wy_kb-src';
          var sources = (json.data.sources || []).map(function (s) {
            return '资料' + s.index + '（相似度 ' + s.score + '）\n' + s.content.slice(0, 120) + (s.content.length > 120 ? '…' : '');
          }).join('\n\n');
          src.innerHTML = '<summary>命中 ' + (json.data.sources || []).length + ' 条知识块（点击展开）</summary>' + wy_escape(sources);
          wy_boxEl.appendChild(src);
        } else {
          aDiv.textContent = '❌ ' + json.msg;
          aDiv.classList.add('wy_err');
          console.error('[kb] 问答失败：', json.msg);
        }
      })
      .catch(function (err) {
        console.error('[kb] 问答请求异常：', err);
        aDiv.textContent = '❌ 请求异常：' + err.message;
        aDiv.classList.add('wy_err');
      })
      .finally(function () {
        wy_askBtn.disabled = false;
        wy_boxEl.scrollTop = wy_boxEl.scrollHeight;
        wy_questionEl.focus();
      });
  }

  wy_askBtn.addEventListener('click', wy_ask);
  wy_questionEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') wy_ask(); });

  wy_loadDocs();
})();
