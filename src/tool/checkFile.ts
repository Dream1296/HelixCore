export function checkFileType(ext: string): 'video' | 'img' | null {
    // 统一转为小写，并确保扩展名以 '.' 开头（如果传入的是 '.jpg' 或 'jpg' 都能处理）
    const normalizedExt = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;

    const imgExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.tiff', '.dng'];
    const videoExtensions = ['.mp4', '.avi', '.mov', '.webm', '.mkv', '.flv'];

    if (imgExtensions.includes(normalizedExt)) {
        return 'img';
    }
    if (videoExtensions.includes(normalizedExt)) {
        return 'video';
    }
    return null;
}