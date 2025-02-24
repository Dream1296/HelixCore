import pinyin from "pinyin";





export function chinese_English(str: string) {
    let strNew = "";
    for (let a of str) {
        if (isChineseCharacter(a)) {
            strNew += pinyin(a)[0][0];
        }
    }

    return replaceNonAlphaWithRandom(strNew);

}

function isChineseCharacter(char: string): boolean {
    const chineseRegex = /^[\u4e00-\u9fa5]$/;
    return chineseRegex.test(char);
}

function replaceNonAlphaWithRandom(str: string): string {
    // 判断字符是否为字母
    const isAlpha = (char: string): boolean => /^[a-zA-Z]$/.test(char);

    // 生成随机小写字母
    const getRandomLetter = (): string => {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        return letters[Math.floor(Math.random() * letters.length)];
    };

    // 遍历字符串，检查每个字符
    let result = '';
    for (let i = 0; i < str.length; i++) {
        if (isAlpha(str[i])) {
            result += str[i].toLowerCase(); // 如果是字母，直接添加并转为小写
        } else {
            result += getRandomLetter(); // 否则添加随机小写字母
        }
    }

    return result;
}


