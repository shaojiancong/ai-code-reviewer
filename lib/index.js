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
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const gitlab_1 = require("./gitlab");
const deepseek_1 = require("./deepseek");
const utils_1 = require("./utils");
const program = new commander_1.Command();
program
    .option('-g, --gitlab-api-url <string>', 'GitLab API URL', 'https://jihulab.com/api/v4')
    .option('-t, --gitlab-access-token <string>', 'GitLab Access Token')
    .option('-o, --Deepseek-api-url <string>', 'Deepseek API URL', 'https://api.deepseek.com')
    .option('-a, --Deepseek-access-token <string>', 'Deepseek Access Token')
    .option('-p, --project-id <number>', 'GitLab Project ID')
    .option('-m, --merge-request-id <string>', 'GitLab Merge Request ID')
    .option('-org, --organization-id <number>', 'organization ID')
    .parse(process.argv);
function run() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const { gitlabApiUrl, gitlabAccessToken, DeepseekApiUrl, DeepseekAccessToken, projectId, mergeRequestId, organizationId } = program.opts();
        console.log('ai code review is underway...');
        const gitlab = new gitlab_1.GitLab({ gitlabApiUrl, gitlabAccessToken, projectId, mergeRequestId });
        const deepseek = new deepseek_1.Deepseek(DeepseekApiUrl, DeepseekAccessToken, organizationId);
        yield gitlab.init().catch(() => {
            console.log('gitlab init error');
        });
        const changes = yield gitlab.getMergeRequestChanges().catch(() => {
            console.log('get merge request changes error');
        });
        for (const change of changes) {
            if (change.renamed_file || change.deleted_file || !((_a = change === null || change === void 0 ? void 0 : change.diff) === null || _a === void 0 ? void 0 : _a.startsWith('@@'))) {
                continue;
            }
            const diffBlocks = (0, utils_1.getDiffBlocks)(change === null || change === void 0 ? void 0 : change.diff);
            while (!!diffBlocks.length) {
                const item = diffBlocks.shift();
                const lineRegex = /@@\s-(\d+)(?:,(\d+))?\s\+(\d+)(?:,(\d+))?\s@@/;
                const matches = lineRegex.exec(item);
                if (matches) {
                    const lineObj = (0, utils_1.getLineObj)(matches, item);
                    if (((lineObj === null || lineObj === void 0 ? void 0 : lineObj.new_line) && (lineObj === null || lineObj === void 0 ? void 0 : lineObj.new_line) > 0) || (lineObj.old_line && lineObj.old_line > 0)) {
                        try {
                            const suggestion = yield deepseek.reviewCodeChange(item);
                            if (!suggestion.includes('666')) {
                                yield gitlab.addReviewComment(lineObj, change, suggestion);
                            }
                        }
                        catch (e) {
                            if (((_b = e === null || e === void 0 ? void 0 : e.response) === null || _b === void 0 ? void 0 : _b.status) === 429) {
                                console.log('Too Many Requests, try again');
                                yield (0, utils_1.delay)(60 * 1000);
                                diffBlocks.push(item);
                            }
                        }
                    }
                }
            }
        }
        console.log('done');
    });
}
module.exports = run;
//# sourceMappingURL=index.js.map