import axios, {AxiosInstance} from 'axios';
import {DeepseekCompletionsConfig, suggestContent, systemContent} from "./utils";

interface ICompletion {
    messages?: { role: string, content: string }[];
    temperature: number;
    model: string;
}

export class Deepseek {
    private apiClient: AxiosInstance;
    private accessTokens: string[];
    private accessTokenIndex = 0;

    constructor(private apiUrl: string, private accessToken: string, private orgId?: string) {
        this.accessTokens = accessToken.split(',');
        const headers: { 'Deepseek-Organization'?: string } = {};
        if (orgId) {
            headers['Deepseek-Organization'] = orgId;
        }
        this.apiClient = axios.create({
            baseURL: apiUrl,
            headers: {
                ...headers,
            },
        });
    }

    async reviewCodeChange(change: string): Promise<string> {
        const newIndex = this.accessTokenIndex = (this.accessTokenIndex >= this.accessTokens.length - 1 ? 0 : this.accessTokenIndex + 1);
        const data: ICompletion = {...DeepseekCompletionsConfig};
        data.messages = [
            systemContent,
            suggestContent,
            {
                role: 'user',
                content: change
            }
        ];
        data.model = "deepseek-chat"
        const response = await this.apiClient.post('/v1/chat/completions', data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessTokens[newIndex]}`
            }
        });
        return response.data.choices?.[0]?.message?.content;
    }
}
