# 深圳房地产交易报表系统 (SZ_House)

## 项目概述

深圳房地产交易报表系统，用于获取和展示深圳市新房及二手房的交易数据。

## 功能特性

- 自动获取深圳市各区新房和二手房的每日交易数据
- 数据按区域分类存储
- 定时自动更新数据

## 数据结构

数据存储在 `data/` 目录下：
- `data/new_homes/` - 新房每日交易数据
- `data/second_hand_homes/` - 二手房每日交易数据
- `data/new_homes_month/` - 新房每月交易数据
- `data/second_hand_homes_month/` - 二手房每月交易数据

每日数据文件名格式为 `YYYY-MM-DD.json`，每月数据文件名格式为 `YYYY-MM.json`，内容包含：
- 交易面积 (dataMj)
- 交易套数 (dataTs)

## 定时任务

本项目使用 GitHub Actions 每天自动运行数据获取脚本，并将最新数据提交到仓库。

- 运行时间：每天北京时间上午9点 (UTC时间1点)
- 自动检测数据是否更新，如有变化则提交

## 手动运行

如需手动运行数据获取，请执行：

```bash
node index.js
```

## API来源

数据来自深圳市住房和建设局官方API：
- 二手房数据接口: `/api/marketInfoShow/getEsfCjxxGsDataNew`
- 新房数据接口: `/api/marketInfoShow/getYsfCjxxGsDataNew`