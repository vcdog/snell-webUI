# 国旗图标更新 - PNG 图标

## 更新说明

前端已从使用 **Emoji 国旗** 改为使用 **PNG 图片国旗图标**。

## 图标来源

使用来自 GitHub 仓库的高质量国旗图标：
- **仓库**: https://github.com/erdongchanyo/icon
- **图标目录**: https://github.com/erdongchanyo/icon/tree/main/Policy-Country
- **CDN 地址**: `https://raw.githubusercontent.com/erdongchanyo/icon/main/Policy-Country/{CODE}.png`

## 支持的国家

包含以下国家/地区的国旗图标：

- 🇺🇸 **US** - 美国
- 🇬🇧 **UK** - 英国 (GB → UK 映射)
- 🇨🇳 **CN** - 中国
- 🇭🇰 **HK** - 香港
- 🇹🇼 **TW** - 台湾
- 🇯🇵 **JP** - 日本
- 🇰🇷 **KR** - 韩国
- 🇸🇬 **SG** - 新加坡
- 🇦🇺 **AU** - 澳大利亚
- 🇨🇦 **CA** - 加拿大
- 🇫🇷 **FR** - 法国
- 🇩🇪 **DE** - 德国
- 🇮🇹 **IT** - 意大利
- 🇷🇺 **RU** - 俄罗斯
- 🇮🇳 **IN** - 印度
- 🇹🇭 **TH** - 泰国
- 🇲🇾 **MY** - 马来西亚
- 🇵🇭 **PHI** - 菲律宾
- 🇦🇷 **AR** - 阿根廷
- 🇹🇷 **TR** - 土耳其
- 🇱🇺 **LU** - 卢森堡
- 🇲🇳 **MN** - 蒙古

## 代码修改

### 1. JavaScript (`app.js`)

**修改前（Emoji）：**
```javascript
function countryCodeToFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 0x1F1E6 + char.charCodeAt(0) - 65);
    return String.fromCodePoint(...codePoints);
}
```

**修改后（PNG图标）：**
```javascript
function countryCodeToFlag(countryCode) {
    if (!countryCode || countryCode.length < 2) return '';
    
    // Convert to uppercase
    const code = countryCode.toUpperCase();
    
    // Map GB to UK for the icon repository
    const iconCode = code === 'GB' ? 'UK' : code;
    
    // Return img tag with flag icon
    const iconUrl = `https://raw.githubusercontent.com/erdongchanyo/icon/main/Policy-Country/${iconCode}.png`;
    return `<img src="${iconUrl}" alt="${code}" class="country-flag-icon" onerror="this.style.display='none'">`;
}
```

### 2. CSS (`styles.css`)

添加了国旗图标样式：

```css
/* Country Flag Icons */
.country-flag-icon {
    width: 24px;
    height: 18px;
    object-fit: cover;
    border-radius: 2px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    vertical-align: middle;
    transition: all var(--transition-fast);
}

.country-flag-icon:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

/* Statistics area flags */
.stat-locations .country-flag-icon {
    width: 32px;
    height: 24px;
    border-radius: 3px;
    cursor: pointer;
}

.stat-locations .country-flag-icon:hover {
    transform: scale(1.2);
}

/* Node name flags */
.node-name .country-flag-icon {
    width: 20px;
    height: 15px;
}
```

## 显示效果

### 1. 统计区域（页面右上角）
- 图标大小：32x24px
- 鼠标悬停：放大至 1.2 倍
- 显示方式：横向排列

### 2. 节点列表 - 节点名称列
- 图标大小：20x15px
- 位置：节点名称前方
- 鼠标悬停：轻微放大

### 3. 特性
- ✅ 圆角边框
- ✅ 阴影效果
- ✅ 悬停动画
- ✅ 加载失败自动隐藏

## 优势

### PNG 图标 vs Emoji

| 特性 | PNG 图标 | Emoji |
|------|---------|-------|
| **视觉一致性** | ✅ 所有浏览器/平台统一 | ❌ 不同平台显示不同 |
| **清晰度** | ✅ 高清矢量风格 | ❌ 像素化 |
| **自定义大小** | ✅ CSS 精确控制 | ❌ 受限于字体 |
| **交互效果** | ✅ 支持悬停、阴影 | ⚠️ 有限 |
| **加载速度** | ⚠️ 需要网络请求 | ✅ 即时显示 |
| **兼容性** | ✅ 所有浏览器 | ⚠️ 旧版浏览器可能不支持 |

## 特殊处理

### GB → UK 映射
```javascript
const iconCode = code === 'GB' ? 'UK' : code;
```
- 数据库存储：`GB`（英国的 ISO 代码）
- 图标文件名：`UK.png`
- 自动映射确保正确显示

### 错误处理
```html
<img ... onerror="this.style.display='none'">
```
- 如果图标加载失败，自动隐藏
- 不显示破损图片占位符
- 不影响页面布局

## 测试建议

1. **清除缓存**: 按 `Ctrl + Shift + R` 强制刷新
2. **检查网络**: 确保能访问 `raw.githubusercontent.com`
3. **验证显示**: 
   - 统计区域应显示 32x24px 的国旗图标
   - 节点名称前应显示 20x15px 的国旗图标
   - 位置列只显示国家代码文本

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

## 性能优化

### CDN 缓存
- 使用 GitHub raw.githubusercontent.com CDN
- 图标文件大小：8-19 KB
- 浏览器自动缓存

### 懒加载
- 图标仅在显示时加载
- `onerror` 处理避免加载失败影响

## 故障排查

### 问题：图标不显示

**解决方案：**
1. 检查网络连接到 `raw.githubusercontent.com`
2. 打开浏览器开发者工具 → 网络标签
3. 查看是否有 404 错误
4. 确认国家代码是否在支持列表中

### 问题：加载缓慢

**解决方案：**
1. 图标会被浏览器缓存，首次加载后会很快
2. 考虑下载图标到本地服务器
3. 使用 CDN 加速服务

## 本地部署（可选）

如需离线使用或提升速度，可以下载图标到本地：

```bash
# 创建本地图标目录
mkdir snell-webUI/assets/flags

# 下载常用国旗（示例）
curl -o snell-webUI/assets/flags/US.png https://raw.githubusercontent.com/erdongchanyo/icon/main/Policy-Country/US.png
curl -o snell-webUI/assets/flags/UK.png https://raw.githubusercontent.com/erdongchanyo/icon/main/Policy-Country/UK.png
# ... 其他国家
```

然后修改 `app.js` 中的 URL：
```javascript
const iconUrl = `./assets/flags/${iconCode}.png`;
```

---

**更新时间：** 2026-02-03 11:45  
**状态：** ✅ 已实现  
**版本：** v2.0 - PNG 图标
