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


## 本次新增：付款 / Checkout 页面

已新增 checkout.html：
- Cart 页面增加 Proceed to Checkout
- Checkout 页面包含联系信息、收货地址、支付方式、订单汇总
- Place Order 可点击并生成订单参考号
- 当前为静态展示/订单收集页面，不会真实扣款
- 如需真实收款，需要接入 Stripe / PayPal / Shopify / OpenCart 支付插件


## 本次新增：主页高级视觉优化

- 重新设计首页 Hero 区域，加入左右布局和产品视觉卡片
- 增加三张促销/入口卡片，提高页面层次
- Shop by Category 改为更高级的彩色卡片布局
- 增加深色品牌横幅区，整体更接近美国大品牌购物网站
- 保留 Checkout、Cart、Wishlist、Compare 等功能
