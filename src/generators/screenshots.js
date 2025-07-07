const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');

async function getScreenshots(projectRoot) {
  const screenshots = [];
  
  try {
    // Check for screenshots directory
    const screenshotDirs = ['screenshots', 'images', 'assets/images', 'public/images'];
    
    for (const dir of screenshotDirs) {
      const screenshotPath = path.join(projectRoot, dir);
      
      if (await fs.pathExists(screenshotPath)) {
        const files = await glob('**/*.{png,jpg,jpeg,gif,webp}', {
          cwd: screenshotPath,
          nodir: true
        });
        
        files.forEach(file => {
          screenshots.push({
            name: path.basename(file, path.extname(file)),
            path: path.join(dir, file),
            filename: file
          });
        });
      }
    }
    
    return screenshots;
  } catch (error) {
    console.error('Error getting screenshots:', error.message);
    return [];
  }
}

module.exports = {
  getScreenshots
};