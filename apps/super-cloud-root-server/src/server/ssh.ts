import { NodeSSH } from 'node-ssh';

type ConnectMode = 'password' | 'privateKey';

interface ConnectOptions {
    host: string;
    username: string;
    password?: string;
    privateKey?: string; // 私钥字符串
    passphrase?: string;
}

/**
 * 创建一个 SSH 客户端
 * @param options 连接选项
 * @returns 已连接的 NodeSSH 实例
 */
export async function createSSHClient(options: ConnectOptions, mode: ConnectMode): Promise<NodeSSH> {
    const ssh = new NodeSSH();
    const config: any = {
        host: options.host,
        username: options.username,
    };

    if (mode === 'password') {
        if (!options.password) {
            throw new Error('密码模式需要提供 password');
        }
        config.password = options.password;
    } else if (mode === 'privateKey') {
        if (!options.privateKey) {
            throw new Error('私钥模式需要提供 privateKey');
        }
        config.privateKey = options.privateKey;
        if (options.passphrase) config.passphrase = options.passphrase;
    } else {
        throw new Error('未知的连接模式');
    }

    await ssh.connect(config);
    console.log(`✅ 已连接到 ${options.host} (${mode} 模式)`);
    return ssh;
}

// =======================
// 使用示例
// =======================
// (async () => {
//     // 使用密码模式
//     const ssh1 = await createSSHClient({
//         host: '192.168.1.10',
//         username: 'root',
//         mode: 'password',
//         password: '123456',
//     });

//     const result1 = await ssh1.execCommand('hostname');
//     console.log('📌 服务器1 hostname:', result1.stdout);

//     // 使用私钥模式
//     const ssh2 = await createSSHClient({
//         host: '192.168.1.11',
//         username: 'ubuntu',
//         mode: 'privateKey',
//         privateKey: `-----BEGIN OPENSSH PRIVATE KEY-----
//     ...
//     -----END OPENSSH PRIVATE KEY-----`,
//     });

//     const result2 = await ssh2.execCommand('uptime');
//     console.log('📌 服务器2 uptime:', result2.stdout);

//     ssh1.dispose();
//     ssh2.dispose();
// })();
