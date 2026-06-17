
# BRAND SHOP 静态网站

这是一个可以部署到 Cloudflare Pages / GitHub Pages 的产品版权展示站。

## 你现在拿到的功能

- 首页
- 产品列表页
- 产品详情页
- 分类筛选
- 搜索
- 版权声明页
- 品牌权属页
- 联系页面
- 图片禁止右键保存
- 图片禁止拖拽保存
- CSV / Google Sheets 表格后台
- 无需数据库
- 适合做亚马逊北美站盗图投诉的辅助证据链接

## 怎么改网站名称

打开这些文件替换文字：

- index.html
- brand-rights.html
- copyright.html
- contact.html
- assets/app.js 里的 siteName

## 怎么上传产品

### 方法一：直接改本地 CSV

编辑：

data/products.csv

字段说明：

id = 产品编号  
slug = 产品链接名称，只能英文、数字、横线  
title = 产品标题  
brand = 品牌  
category = 分类  
sku = SKU  
asin = ASIN  
first_release_time = 首次发布时间  
copyright_owner = 版权人 / 公司  
main_image = 主图路径  
gallery_images = 多图路径，用 | 分隔  
description = 产品描述  
status = published 才会显示  

### 方法二：用 Google Sheets 当后台

1. 新建 Google Sheets
2. 第一行复制 data/products.csv 的字段
3. File / Share / Publish to web
4. 发布为 CSV
5. 复制 CSV 链接
6. 打开 assets/app.js
7. 把链接填到：

googleSheetCsvUrl: ""

示例：

googleSheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/xxxx/pub?output=csv"

## 怎么上传图片

把图片放到 images 文件夹，比如：

images/pc-001/main.jpg
images/pc-001/1.jpg
images/pc-001/2.jpg

然后在 CSV 里填写：

main_image = /images/pc-001/main.jpg
gallery_images = /images/pc-001/main.jpg|/images/pc-001/1.jpg|/images/pc-001/2.jpg

## 部署到 Cloudflare Pages

1. 把整个文件夹上传到 GitHub 仓库
2. Cloudflare Pages 选择 Connect to Git
3. 选择仓库
4. Framework preset 选 None
5. Build command 留空
6. Output directory 填 /
7. Deploy
8. 在 Custom domains 绑定你的域名

## 建议产品大类

Health & Household  
Home & Kitchen  
Beauty & Personal Care  
Office & Stationery  
Toys & Kids  
Electronics & Accessories  
Patio, Lawn & Garden  
Printer Supplies  

## 投诉用建议

亚马逊北美站盗图投诉时，建议同时提交：

- 你的官网产品详情页链接
- 产品首次发布时间截图
- 原始图片文件
- 拍摄原图 / PSD / AI / 设计源文件
- 对方盗图 ASIN 链接
- 对方盗图截图
- 公司/品牌资料
- 版权声明页链接

注意：这个网站是辅助证据，不代表单靠网站一定投诉成功。


## 本版本已替换为 ANGFAN 品牌信息

Wordmark: ANGFAN
Serial Number: 88915347
Registration Number: 6215606
Status: LIVE / REGISTERED
Class: IC 008
Copyright Owner: LUWANJUN


截图里的商标页面信息已整理到 brand-rights.html。


## 每个页面版权归属信息

本版本已在所有页面增加统一版权归属栏：

Copyright Ownership: All product images, listing content, packaging visuals, and website materials belong to LUWANJUN. Contact: ANGFANBRAND163@163.COM

同时产品详情页的版权说明也增加了联系邮箱：ANGFANBRAND163@163.COM


## 本次修改

- 网站页面不再展示公司名称、公司地址、公司实体类型等公司信息。
- 所有页面的版权归属统一改为：LUWANJUN
- 联系邮箱保留为：ANGFANBRAND163@163.COM


## 扁平上传版说明

这个版本专门适合 GitHub 网页直接上传。所有文件都在最外层，不需要 assets/data/images 文件夹。

GitHub 仓库首页最外层应该看到：
index.html
products.html
product.html
brand-rights.html
copyright.html
contact.html
style.css
app.js
products.csv
main.svg
1.svg
2.svg
3.svg

Cloudflare Pages 部署设置：
Framework preset: None
Build command: 留空
Build output directory: /


## 本次修改：去掉品牌页面

- 已删除 brand-rights.html
- 已从所有页面顶部导航栏删除 Brand Rights 入口
- 网站只保留 Home / Products / Copyright Notice / Contact


## 本次修改：店铺名称

- 网站顶部店铺名称已从 ANGFAN Rights Center 改为 BRAND SHOP
- 页面标题和页脚中的网站名称也已同步改为 BRAND SHOP
- Brand Rights 品牌页仍保持删除状态


## 本次修改：店铺名称大写

- 网站店铺名称已统一改为：BRAND SHOP
