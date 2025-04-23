"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLineObj = exports.getDiffBlocks = exports.delay = exports.DeepseekCompletionsConfig = exports.suggestContent = exports.systemContent = exports.fullContent = void 0;
exports.fullContent = {
    "role": "user",
    "content": "First step, the following is the revised full text of this file. Please carefully understand the code content in this file."
};
exports.systemContent = {
    "role": "system",
    "content": "You are a code reviewer,Your role is to identify bugs, performance issues, and areas for optimization in the submitted  code. You are also responsible for providing constructive feedback and suggesting best practices to improve the overall quality of the code. "
};
exports.suggestContent = {
    "role": "user",
    "content": `Next, I will send you each step of the merge request in standard git diff format, your task is:
      - Review the code changes (diffs) in the patch and provide feedback.
      - Examine it carefully to see if it really has bugs or needs room for optimization, highlight them. 
      - Do not highlight minor issues and nitpicks.
      - Use bullet points if you have multiple comments.
      - You don't have to explain what the code does
      - please use chinese to give feedback.
      - If you think there is no need to optimize or modify, please reply with 666.
      Here are the changes that were committed this time`
};
exports.DeepseekCompletionsConfig = {
    "temperature": 0,
    "model": "gpt-3.5-turbo",
    "stream": false,
};
const delay = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
};
exports.delay = delay;
const getDiffBlocks = (diff) => {
    const regex = /(?=@@\s-\d+(?:,\d+)?\s\+\d+(?:,\d+)?\s@@)/g;
    const diffBlocks = diff.split(regex);
    return diffBlocks;
};
exports.getDiffBlocks = getDiffBlocks;
const getLineObj = (matches, item) => {
    var _a, _b, _c;
    const lineObj = {};
    const lastLine = (_c = (_b = (_a = item.split(/\r?\n/)) === null || _a === void 0 ? void 0 : _a.reverse()) === null || _b === void 0 ? void 0 : _b[1]) === null || _c === void 0 ? void 0 : _c.trim();
    const oldLineStart = +matches[1];
    const oldLineEnd = +matches[2] || 0;
    const newLineStart = +matches[3];
    const newLineEnd = +matches[4] || 0;
    if ((lastLine === null || lastLine === void 0 ? void 0 : lastLine[0]) === '+') {
        lineObj.new_line = newLineStart + newLineEnd - 1;
    }
    else if ((lastLine === null || lastLine === void 0 ? void 0 : lastLine[0]) === '-') {
        lineObj.old_line = oldLineStart + oldLineEnd - 1;
    }
    else {
        lineObj.new_line = newLineStart + newLineEnd - 1;
        lineObj.old_line = oldLineStart + oldLineEnd - 1;
    }
    return lineObj;
};
exports.getLineObj = getLineObj;
//# sourceMappingURL=utils.js.map