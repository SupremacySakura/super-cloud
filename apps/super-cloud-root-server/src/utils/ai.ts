import OpenAI from "openai";
// 通义千问 - qwen-plus
const openai_tongyi_qwen_plus = new OpenAI(
    {
        // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
        apiKey: process.env.TONGYI_API_KEY,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);
const chatWithTongYi = (model: string) => {
    return async (messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) => {
        const completion = await openai_tongyi_qwen_plus.chat.completions.create({
            model,  //可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
            messages,
        });
        return completion.choices[0].message.content
    }
}
// 模型枚举
enum Model {
    qwen_plus = 'qwen-plus',
    qwen_turbo = 'qwen-turbo',
    qwen_plus_latest = 'qwen-plus-latest',
    qwen_turbo_latest = 'qwen-turbo-latest',
}
// 方法映射
const modelMap = {
    [Model.qwen_plus]: chatWithTongYi(Model.qwen_plus),
    [Model.qwen_turbo]: chatWithTongYi(Model.qwen_turbo),
    [Model.qwen_plus_latest]: chatWithTongYi(Model.qwen_plus_latest),
    [Model.qwen_turbo_latest]: chatWithTongYi(Model.qwen_turbo_latest),
}
// 模型列表
const models = [
    { value: Model.qwen_plus, label: 'qwen_plus' },
    { value: Model.qwen_turbo, label: 'qwen_turbo' },
    { value: Model.qwen_plus_latest, label: 'qwen_plus_latest' },
    { value: Model.qwen_turbo_latest, label: 'qwen_turbo_latest' },
];
export { modelMap,models }
export { Model }