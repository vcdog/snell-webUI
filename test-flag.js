// 简单的 Node.js 测试脚本
function countryCodeToFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 0x1F1E6 + char.charCodeAt(0) - 65);
    return String.fromCodePoint(...codePoints);
}

// 测试
console.log('=== 国旗转换测试 ===');
console.log('US ->', countryCodeToFlag('US'));
console.log('GB ->', countryCodeToFlag('GB'));
console.log('KR ->', countryCodeToFlag('KR'));
console.log('CN ->', countryCodeToFlag('CN'));
console.log('JP ->', countryCodeToFlag('JP'));
console.log('===================');

// 模拟统计区域
const countries = ['US', 'GB', 'KR'];
const html = countries.map(code =>
    `<span class="country-flag" title="${code}">${countryCodeToFlag(code)}</span>`
).join('');

console.log('\n统计区域 HTML:');
console.log(html);
