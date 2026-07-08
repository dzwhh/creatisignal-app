# 行内引用采用 textarea + 高亮叠层，而非 contentEditable 富文本

创意生成输入框需要在提示词中渲染 `[Image #1]` / `[Video #1]` 引用胶囊。我们选择保留原生 `<textarea>`，引用作为真实纯文本存在，在其背后叠加一层同步滚动的高亮层来渲染彩色胶囊；而不是改用 contentEditable 富文本编辑器。原因：目标用户以中文输入为主，contentEditable 的 IME 组合输入、光标管理和粘贴行为的 bug 面积远大于其视觉收益；纯文本 token 还让提示词天然可复制、可持久化、可直接提交给生成后端。代价是高亮层必须与 textarea 的字体、换行、滚动严格同步。

## Considered Options

- contentEditable 富文本 chip —— 视觉上限最高，因 IME 风险被否
- 纯文本 token 无高亮 —— 零风险但缺一层"所见即引用"的反馈
