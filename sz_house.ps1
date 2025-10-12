# 深圳房产

# 二手房上日成交
Invoke-RestMethod -Uri "https://zjj.sz.gov.cn:8004/api/marketInfoShow/getEsfCjxxGsDataNew" -Method Post | ConvertTo-Json -Depth 10

# 二手房上月成交
Invoke-RestMethod -Uri "https://zjj.sz.gov.cn:8004/api/marketInfoShow/getEsfCjxxGsMonthDataNew" -Method Post | ConvertTo-Json -Depth 10

# 新房上日成交
Invoke-RestMethod -Uri "https://zjj.sz.gov.cn:8004/api/marketInfoShow/getYsfCjxxGsDataNew" -Method Post | ConvertTo-Json -Depth 10

# 新手房上月成交
Invoke-RestMethod -Uri "https://zjj.sz.gov.cn:8004/api/marketInfoShow/getYsfCjxxGsMonthDataNew" -Method Post | ConvertTo-Json -Depth 10


# 历史成交数据
Invoke-RestMethod -Uri "https://zjj.sz.gov.cn:8004/api/marketInfoShow/getFjzsInfoData" `
    -Method Post `
    -Body '{"startDate":"2025-09-01","endDate":"2025-09-30","dateType":""}' `
    -ContentType "application/json" | ConvertTo-Json -Depth 10
