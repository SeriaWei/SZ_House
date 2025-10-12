## 深圳房产交易数据 - REST API 参考

本文档整理自原始接口示例，面向开发者，给出每个 REST 接口的说明、调用示例、响应字段说明与示例响应。

主机（示例）：
```
https://zjj.sz.gov.cn:8004
```
所有接口均使用 POST 方法，返回 JSON 格式。示例中的日期/数值来自抓取样本。

注意：本文档仅整理公开接口的请求/响应格式，不包含认证信息。生产环境请遵循平台的访问与安全规范。

---

### 通用响应结构

所有示例接口返回如下公共包裹结构：
``` json
{
  "status": number,   // 1 表示成功，其他为失败
  "msg": string,     // 返回信息
  "data": object     // 与接口相关的具体数据
}
```
---

## 接口：二手房 — 上日成交（按区）

描述：返回上日二手房成交面积与成交套数，按行政区汇总。

请求：
```
POST /api/marketInfoShow/getEsfCjxxGsDataNew
```

示例（PowerShell）：

``` powershell
Invoke-RestMethod -Uri "https://zjj.sz.gov.cn:8004/api/marketInfoShow/getEsfCjxxGsDataNew" -Method Post | ConvertTo-Json -Depth 10
```

响应 data 字段说明：

- xmlDateMonth: 报表所属年月（中文）
- xmlDateDay: 报表日期（中文）
- dataMj: 区域成交面积数组，元素 { name: 区名, value: 面积（平方米） }
- dataTs: 区域成交套数数组，元素 { name: 区名, value: 套数 }

示例响应（节选）：
``` json
{
  "status": 1,
  "msg": "成功",
  "data": {
    "xmlDateMonth": "2025年09月",
    "xmlDateDay": "2025年10月11日",
    "dataMj": [ { "name": "南山", "value": 5560.65 }, ... ],
    "dataTs": [ { "name": "南山", "value": 41 }, ... ]
  }
}
```
示例解析：dataMj 与 dataTs 的 name 顺序通常对应，表示同一区域的面积/套数数据。

---

## 接口：二手房 — 上月成交（按区）

描述：返回本月（或上月）二手房累计成交面积与套数，按行政区汇总。

请求：
```
POST /api/marketInfoShow/getEsfCjxxGsMonthDataNew
```

示例（PowerShell）：

``` powershell
Invoke-RestMethod -Uri "https://zjj.sz.gov.cn:8004/api/marketInfoShow/getEsfCjxxGsMonthDataNew" -Method Post | ConvertTo-Json -Depth 10
```

响应 data 字段说明：同上（包含 xmlDateMonth、xmlDateDay、dataMj、dataTs）。

示例响应（节选）：
``` json
{
  "status": 1,
  "msg": "成功",
  "data": {
    "xmlDateMonth": "2025年9月",
    "xmlDateDay": "2025年10月11日",
    "dataMj": [ { "name": "南山", "value": 90167.72 }, ... ],
    "dataTs": [ { "name": "南山", "value": 850 }, ... ]
  }
}
```
---

## 接口：新房 — 上日成交（按区）

描述：返回上日新房成交面积与成交套数，按行政区汇总。

请求：
```
POST /api/marketInfoShow/getYsfCjxxGsDataNew
```
示例（PowerShell）：
``` powershell
Invoke-RestMethod -Uri "https://zjj.sz.gov.cn:8004/api/marketInfoShow/getYsfCjxxGsDataNew" -Method Post | ConvertTo-Json -Depth 10
```
响应 data 字段说明：同上（xmlDateMonth、xmlDateDay、dataMj、dataTs）。

示例响应（节选）：
``` json
{
  "status": 1,
  "msg": "成功",
  "data": {
    "xmlDateMonth": "2025年09月",
    "xmlDateDay": "2025年10月11日",
    "dataMj": [ { "name": "南山", "value": 633.76 }, ... ],
    "dataTs": [ { "name": "南山", "value": 5 }, ... ]
  }
}
```
---

## 接口：新房 — 上月成交（按区）

描述：返回本月（或上月）新房累计成交面积与套数，按行政区汇总。

请求：
```
POST /api/marketInfoShow/getYsfCjxxGsMonthDataNew
```
示例（PowerShell）：
``` powershell
Invoke-RestMethod -Uri "https://zjj.sz.gov.cn:8004/api/marketInfoShow/getYsfCjxxGsMonthDataNew" -Method Post | ConvertTo-Json -Depth 10
```
响应 data 字段说明：同上。

示例响应（节选）：
``` json
{
  "status": 1,
  "msg": "成功",
  "data": {
    "xmlDateMonth": "2025年9月",
    "xmlDateDay": "2025年10月11日",
    "dataMj": [ { "name": "南山", "value": 11173.3 }, ... ],
    "dataTs": [ { "name": "南山", "value": 78 }, ... ]
  }
}
```
---

## 接口：历史成交数据（时间序列）

描述：返回指定时间范围内的新房/二手房日度成交统计（曲线/报表用）。

请求：
```
POST /api/marketInfoShow/getFjzsInfoData
```
请求体（JSON）：
``` json
{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "dateType": ""    // 可选，示例中为空字符串
}
```
示例（PowerShell）：
``` powershell
Invoke-RestMethod -Uri "https://zjj.sz.gov.cn:8004/api/marketInfoShow/getFjzsInfoData" `
    -Method Post `
    -Body '{"startDate":"2025-09-01","endDate":"2025-09-05","dateType":""}' `
    -ContentType "application/json" | ConvertTo-Json -Depth 10
```
响应 data 字段说明：

- date: 日期数组，格式 YYYY-MM-DD
- result: 状态字符串（示例为 "success"）
- ysfDealArea: 数组，对应日期的新房成交面积（平方米）
- ysfTotalTs: 数组，对应日期的新房成交套数
- esfDealArea: 数组，对应日期的二手房成交面积（平方米）
- esfTotalTs: 数组，对应日期的二手房成交套数
- bigEventCont: 数组，对应日期的大事件描述（如果没有则为 null）

示例响应：
``` json
{
  "status": 1,
  "msg": "成功",
  "data": {
    "date": ["2025-09-01","2025-09-02","2025-09-03","2025-09-04","2025-09-05"],
    "result": "success",
    "ysfDealArea": [4964.37, 5342.09, 4501.38, 5311.72, 5636.32],
    "ysfTotalTs": [51, 52, 47, 53, 53],
    "esfDealArea": [13861.16, 20673.11, 20265.65, 17449.21, 16467.37],
    "esfTotalTs": [142, 190, 200, 187, 163],
    "bigEventCont": [null, null, null, null, null]
  }
}
```