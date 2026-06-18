ANGFAN Brand Shop 最终整合包

本包已整合以下修改：
1. 所有产品价格统一为：$199.99
2. 所有产品 First Release Time 统一为：October 08, 2021（对应 2021/10/08）
3. 首页重复类目已删除，只保留一个 Shop by Category 区域
4. 页面视觉已按美国大品牌购物网站风格优化：
   - 更干净的留白
   - 更高级的浅色渐变 Banner
   - 更细的卡片阴影和圆角
   - 字体改为接近美国主流网站的系统字体
   - 店铺名统一为 ANGFAN Brand Shop，ANGFAN 保持品牌大写，Brand Shop 用 Title Case
5. 产品列表为静态直出，不依赖 JS 才显示，避免 Loading 不出来
6. 产品详情页保持参考 OpenCart 风格：
   - 左侧大图 + 缩略图
   - 右侧 Brand / First Release Time / Copyright Information
   - Qty / Add To Cart / Wishlist / Compare
   - Available Options
7. Add To Cart / Wishlist / Compare 按钮可点击跳转
8. 图片加载失败时自动回退到本地 main.svg 占位图

上传方法：
- 解压本 ZIP
- GitHub 仓库 Add file → Upload files
- 上传全部文件覆盖旧文件
- Commit changes
- 等 Cloudflare 自动部署
- 浏览器按 Ctrl + F5 强制刷新
