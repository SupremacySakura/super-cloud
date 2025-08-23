/**
 * 文件大小格式化
 * @param size 文件大小
 */
export const formatSize = (size: number | undefined): string => {
    if (typeof size !== 'number') return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}
/**
 * 文件时间格式化
 * @param time 时间
 */
export const formatTime = (time?: string | Date): string => {
    if (!time) return '';

    const date = time instanceof Date ? time : new Date(time);
    if (isNaN(date.getTime())) return ''; // 防止无效日期

    return new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(date);
};
