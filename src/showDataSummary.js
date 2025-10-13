const fs = require('fs');
const path = require('path');

/**
 * Display summary of all data files with their total statistics
 */
function showDataSummary() {
  const dataDir = path.join(__dirname, '..', 'data');
  const subdirs = ['new_homes', 'new_homes_month', 'second_hand_homes', 'second_hand_homes_month'];
  
  console.log('📊 数据文件总计统计摘要\n');
  console.log('='.repeat(80));

  subdirs.forEach(subdir => {
    const subdirPath = path.join(dataDir, subdir);
    
    if (!fs.existsSync(subdirPath)) {
      console.log(`📁 ${subdir}: 目录不存在`);
      return;
    }

    console.log(`\n📁 ${subdir}:`);
    console.log('-'.repeat(50));

    const files = fs.readdirSync(subdirPath).filter(file => file.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('   无数据文件');
      return;
    }

    files.sort().forEach(file => {
      const filePath = path.join(subdirPath, file);
      
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        if (data.data && data.data.dataTotalMj !== undefined && data.data.dataTotalTs !== undefined) {
          const date = file.replace('.json', '');
          const totalMj = Number(data.data.dataTotalMj).toLocaleString('zh-CN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          });
          const totalTs = data.data.dataTotalTs.toLocaleString('zh-CN');
          
          console.log(`   ${date}: 总面积 ${totalMj} 平方米, 总套数 ${totalTs} 套`);
        } else {
          console.log(`   ${file}: ❌ 缺少总计统计数据`);
        }
        
      } catch (error) {
        console.log(`   ${file}: ❌ 读取错误 - ${error.message}`);
      }
    });
  });

  console.log('\n' + '='.repeat(80));
  console.log('✅ 摘要完成');
}

// Run the summary if this file is executed directly
if (require.main === module) {
  showDataSummary();
}

module.exports = { showDataSummary };