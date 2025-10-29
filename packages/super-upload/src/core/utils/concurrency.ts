/**
 * 并发控制工具模块
 * 
 * 提供并发任务执行的功能，支持限制并发数、进度回调和暂停功能
 */

/**
 * 并发执行任务数组
 * 
 * 使用指定数量的工作线程并发执行一组异步任务，支持进度回调和暂停功能
 * 
 * @param tasks - 待执行的异步任务函数数组，每个函数返回一个Promise
 * @param limit - 最大并发数，控制同时执行的任务数量
 * @param onProgress - 可选的进度回调函数，接收完成百分比（0-100）作为参数
 * @param pauseFlag - 可选的暂停控制对象，当paused属性为true时暂停新任务的执行
 * @returns Promise<{data: any[], success: number, failed: number}> - 包含执行结果的数据对象
 * @returns.data - 所有任务的执行结果数组
 * @returns.success - 成功执行的任务数量
 * @returns.failed - 执行失败的任务数量
 */
export async function runWithConcurrency(
    tasks: (() => Promise<any>)[],
    limit: number,
    onProgress?: (p: number) => void,
    pauseFlag?: { paused: boolean }
): Promise<{ data: any[], success: number, failed: number }> {
    // 已完成任务计数
    let completed = 0
    // 总任务数
    const total = tasks.length
    // 创建任务队列的副本，避免修改原数组
    const queue = [...tasks]
    // 成功任务计数
    let success = 0
    // 失败任务计数
    let failed = 0
    
    // 创建指定数量的工作线程
    const workers = new Array(limit).fill(0).map(async () => {
        // 当队列中还有任务且未暂停时继续处理
        while (queue.length && !pauseFlag?.paused) {
            // 从队列头部取出一个任务
            const task = queue.shift()
            if (task) {
                try {
                    // 执行任务
                    await task()
                    // 更新完成计数
                    completed++
                    success++
                    // 计算并回调进度（保留两位小数）
                    onProgress?.(Number(((completed / total) * 100).toFixed(2)))
                } catch (error) {
                    // 更新失败计数
                    failed++
                }
            }
        }
    })

    // 等待所有工作线程完成
    return {
        data: await Promise.all(workers),
        success,
        failed
    }
}
