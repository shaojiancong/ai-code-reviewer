"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitLab = void 0;
const axios_1 = __importDefault(require("axios"));
const parseLastDiff = (gitDiff) => {
    var _a;
    const diffList = gitDiff.split('\n').reverse();
    const lastLineFirstChar = (_a = diffList === null || diffList === void 0 ? void 0 : diffList[1]) === null || _a === void 0 ? void 0 : _a[0];
    const lastDiff = diffList.find((item) => {
        return /^@@ \-\d+,\d+ \+\d+,\d+ @@/g.test(item);
    }) || '';
    const [lastOldLineCount, lastNewLineCount] = lastDiff
        .replace(/@@ \-(\d+),(\d+) \+(\d+),(\d+) @@.*/g, ($0, $1, $2, $3, $4) => {
        return `${+$1 + +$2},${+$3 + +$4}`;
    })
        .split(',');
    if (!/^\d+$/.test(lastOldLineCount) || !/^\d+$/.test(lastNewLineCount)) {
        return {
            old_line: -1,
            new_line: -1,
        };
    }
    const old_line = lastLineFirstChar === '+' ? -1 : (parseInt(lastOldLineCount) || 0) - 1;
    const new_line = lastLineFirstChar === '-' ? -1 : (parseInt(lastNewLineCount) || 0) - 1;
    return {
        old_line,
        new_line,
    };
};
class GitLab {
    constructor({ gitlabApiUrl, gitlabAccessToken, projectId, mergeRequestId }) {
        this.projectId = projectId;
        this.mrId = mergeRequestId;
        this.diffRefs = {};
        this.apiClient = axios_1.default.create({
            baseURL: gitlabApiUrl,
            headers: {
                'Private-Token': gitlabAccessToken,
            },
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getMergeRequestInfo();
        });
    }
    getMergeRequestInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.apiClient.get(`/projects/${this.projectId}/merge_requests/${this.mrId}`);
            this.mergeRequestInfo = response === null || response === void 0 ? void 0 : response.data;
        });
    }
    getMergeRequestChanges() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.apiClient.get(`/projects/${this.projectId}/merge_requests/${this.mrId}/diffs`);
            const changes = (_a = response.data) === null || _a === void 0 ? void 0 : _a.map((item) => {
                const { old_line, new_line } = parseLastDiff(item.diff);
                return Object.assign(Object.assign({}, item), { old_line, new_line });
            });
            return changes;
        });
    }
    getFileContent(filePath) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.apiClient.get(`/projects/${this.projectId}/repository/files/${encodeURIComponent(filePath)}/raw?ref=${(_a = this.mergeRequestInfo) === null || _a === void 0 ? void 0 : _a.source_branch}`);
            return (response === null || response === void 0 ? void 0 : response.data) || '';
        });
    }
    addReviewComment(lineObj, change, suggestion) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.apiClient.post(`/projects/${this.projectId}/merge_requests/${this.mrId}/discussions`, {
                body: suggestion,
                position: Object.assign(Object.assign(Object.assign({ position_type: 'text' }, lineObj), { new_path: change.new_path, old_path: change.old_path }), (_a = this.mergeRequestInfo) === null || _a === void 0 ? void 0 : _a.diff_refs),
            });
            return response.data;
        });
    }
}
exports.GitLab = GitLab;
//# sourceMappingURL=gitlab.js.map