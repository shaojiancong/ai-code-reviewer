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
exports.Deepseek = void 0;
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("./utils");
class Deepseek {
    constructor(apiUrl, accessToken, orgId) {
        this.apiUrl = apiUrl;
        this.accessToken = accessToken;
        this.orgId = orgId;
        this.accessTokenIndex = 0;
        this.accessTokens = accessToken.split(',');
        const headers = {};
        if (orgId) {
            headers['Deepseek-Organization'] = orgId;
        }
        this.apiClient = axios_1.default.create({
            baseURL: apiUrl,
            headers: Object.assign({}, headers),
        });
    }
    reviewCodeChange(change) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const newIndex = this.accessTokenIndex = (this.accessTokenIndex >= this.accessTokens.length - 1 ? 0 : this.accessTokenIndex + 1);
            const data = Object.assign({}, utils_1.DeepseekCompletionsConfig);
            data.messages = [
                utils_1.systemContent,
                utils_1.suggestContent,
                {
                    role: 'user',
                    content: change
                }
            ];
            data.model = "deepseek-chat";
            const response = yield this.apiClient.post('/v1/chat/completions', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessTokens[newIndex]}`
                }
            });
            return (_c = (_b = (_a = response.data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
        });
    }
}
exports.Deepseek = Deepseek;
//# sourceMappingURL=deepseek.js.map