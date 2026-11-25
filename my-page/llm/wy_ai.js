/**
 * 姓名：万超然 | 学号：24001011008 |
 * 时间：2026-11-23 | 大模型：GLM
 * 说明：AI 聊天/客服脚本 —— 前端维护完整 messages 多轮对话，POST /api/chat 按 provider 转发
 */
(function () {
  var wy_providerEl = document.getElementById('wy_provider');
  var wy_modeEl = document.getElementById('wy_mode');
  var wy_boxEl = document.getElementById('wy_chat_box');
  var wy_inputEl = document.getElementById('wy_input');
  var wy_sendBtn = document.getElementById('wy_btn_send');
  var wy_clearBtn = document.getElementById('wy_btn_clear');

  // 两种人设的 system 提示词（任务二：客服人设改造）
  var wy_systemPrompts = {
    chat: '你是一个有用的智能助手，回答准确、简洁。',
    service: '你是「中华美食街」的在线客服，只回答以下三类问题：1、营业时间（每天 10:00-22:00，节假日照常）；2、招牌菜（北京烤鸭、四川火锅、广式点心，人均 60-90 元）；3、配送范围（门店周边 5 公里，满 50 元免配送费）。其他任何问题请礼貌引导用户留言，由人工客服跟进。回复保持简短友好。'
  };

  // 多轮对话历史（含 system），模型不记事，每次发送全部历史
  var wy_messages = [];

  function wy_getSystem() {
    return wy_systemPrompts[wy_modeEl.value] || wy_systemPrompts.chat;
  }

  function wy_reset() {
    wy_messages = [];
    wy_boxEl.innerHTML = '<div class="wy_chat-tip">选择平台与人设，开始对话。切换平台后对话继续有效。</div>';
  }

  wy_clearBtn.addEventListener('click', wy_reset);

  function wy_escape(html) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(html)));
    return div.innerHTML;
  }

  function wy_addMsg(role, text, meta) {
    var tip = wy_boxEl.querySelector('.wy_chat-tip');
    if (tip) tip.remove();
    var div = document.createElement('div');
    div.className = 'wy_msg ' + (role === 'user' ? 'wy_user' : 'wy_ai');
    div.innerHTML = ''
      + '<div class="wy_msg-avatar">' + (role === 'user' ? '🙂' : '🤖') + '</div>'
      + '<div><div class="wy_msg-bubble">' + wy_escape(text) + '</div>'
      + (meta ? '<div class="wy_msg-meta">' + wy_escape(meta) + '</div>' : '')
      + '</div>';
    wy_boxEl.appendChild(div);
    wy_boxEl.scrollTop = wy_boxEl.scrollHeight;
    return div;
  }

  function wy_showThinking() {
    var div = document.createElement('div');
    div.className = 'wy_msg wy_ai';
    div.id = 'wy_thinking_msg';
    div.innerHTML = '<div class="wy_msg-avatar">🤖</div><div class="wy_msg-bubble"><span class="wy_thinking"><span class="wy_thinking-dot"></span><span class="wy_thinking-dot"></span><span class="wy_thinking-dot"></span>正在思考…</span></div>';
    wy_boxEl.appendChild(div);
    wy_boxEl.scrollTop = wy_boxEl.scrollHeight;
  }

  function wy_hideThinking() {
    var t = document.getElementById('wy_thinking_msg');
    if (t) t.remove();
  }

  function wy_send() {
    var text = wy_inputEl.value.trim();
    if (!text) return;
    var provider = wy_providerEl.value;
    var providerLabel = wy_providerEl.options[wy_providerEl.selectedIndex].text;
    var modeLabel = wy_modeEl.options[wy_modeEl.selectedIndex].text;

    // 维护多轮历史：system 永远在首位，之后依次是 user / assistant
    wy_messages = wy_messages.filter(function (m) { return m.role !== 'system'; });
    wy_messages.unshift({ role: 'system', content: wy_getSystem() });
    wy_messages.push({ role: 'user', content: text });

    wy_addMsg('user', text);
    wy_inputEl.value = '';
    wy_sendBtn.disabled = true;
    wy_showThinking();

    fetch('http://localhost:8008/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: provider, messages: wy_messages })
    })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        console.log('[ai] 接口返回：', json);
        wy_hideThinking();
        if (json.code === 0) {
          var reply = json.data && json.data.reply ? json.data.reply : '(空回复)';
          wy_messages.push({ role: 'assistant', content: reply });
          wy_addMsg('assistant', reply, providerLabel + ' · ' + (json.data.model || '') + ' · ' + modeLabel);
        } else {
          wy_addMsg('assistant', '出错了：' + json.msg, '请检查后端 .env 中该平台的 API Key 是否已配置');
          console.error('[ai] 接口返回异常：', json.msg);
        }
      })
      .catch(function (err) {
        console.error('[ai] 请求异常：', err);
        wy_hideThinking();
        wy_addMsg('assistant', '请求异常，请确认后端服务已启动（端口 8008）', err.message);
      })
      .finally(function () {
        wy_sendBtn.disabled = false;
        wy_inputEl.focus();
      });
  }

  wy_sendBtn.addEventListener('click', wy_send);
  wy_inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      wy_send();
    }
  });

  // 自动演示模式：URL 带 ?demo=1 时自动发送一条示例消息（用于展示与截图）
  if (location.search.indexOf('demo=1') !== -1) {
    setTimeout(function () {
      if (wy_messages.filter(function (m) { return m.role === 'user'; }).length === 0) {
        wy_inputEl.value = '你好，请用一句话介绍你自己';
        wy_send();
      }
    }, 700);
  }
})();
