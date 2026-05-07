// generate-icons.js
const fs = require('fs');
const path = require('path');

// Create assets folder if not exists
if (!fs.existsSync('./assets')) {
  fs.mkdirSync('./assets');
  console.log('✅ Created assets folder');
}

// SVG for App Icon (1024x1024)
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" rx="200" fill="#2563EB"/>
  <circle cx="512" cy="400" r="120" fill="white"/>
  <rect x="300" y="500" width="424" height="300" rx="20" fill="white"/>
  <rect x="420" y="650" width="184" height="150" rx="10" fill="#2563EB"/>
  <circle cx="580" cy="720" r="15" fill="white"/>
  <rect x="350" y="530" width="80" height="80" rx="10" fill="#F59E0B"/>
  <rect x="594" y="530" width="80" height="80" rx="10" fill="#F59E0B"/>
  <text x="512" y="900" font-family="Arial" font-size="80" font-weight="bold" fill="white" text-anchor="middle">SR</text>
</svg>`;

// SVG for Splash Screen (1242x2436)
const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1242 2436" width="1242" height="2436">
  <rect width="1242" height="2436" fill="#2563EB"/>
  <circle cx="621" cy="900" r="180" fill="white"/>
  <rect x="350" y="1100" width="542" height="450" rx="30" fill="white"/>
  <rect x="500" y="1350" width="242" height="200" rx="15" fill="#2563EB"/>
  <circle cx="700" cy="1450" r="20" fill="white"/>
  <rect x="420" y="1150" width="100" height="100" rx="15" fill="#F59E0B"/>
  <rect x="722" y="1150" width="100" height="100" rx="15" fill="#F59E0B"/>
  <text x="621" y="1750" font-family="Arial" font-size="80" font-weight="bold" fill="white" text-anchor="middle">Smart</text>
  <text x="621" y="1850" font-family="Arial" font-size="80" font-weight="bold" fill="white" text-anchor="middle">Rental</text>
</svg>`;

// Save SVG files
fs.writeFileSync('./assets/icon.svg', iconSvg);
console.log('✅ icon.svg created');

fs.writeFileSync('./assets/splash.svg', splashSvg);
console.log('✅ splash.svg created');

// Create an HTML file to convert SVG to PNG
const converterHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Convert SVG to PNG</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 20px; background: #f0f0f0; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
        canvas { border: 1px solid #ddd; margin: 10px; background: white; }
        button { margin: 10px; padding: 10px 20px; background: #2563EB; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        button:hover { background: #1d4ed8; }
        .success { color: green; }
        .info { color: blue; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Smart Rental - Icon Generator</h1>
        <p>Click the buttons below to download your app icons</p>
        
        <div>
            <canvas id="iconCanvas" width="1024" height="1024" style="width: 256px; height: 256px;"></canvas>
            <br>
            <button onclick="downloadIcon()">📱 Download App Icon (icon.png)</button>
            <button onclick="downloadAdaptive()">🔄 Download Adaptive Icon</button>
        </div>
        
        <div>
            <canvas id="splashCanvas" width="1242" height="2436" style="width: 200px; height: 400px;"></canvas>
            <br>
            <button onclick="downloadSplash()">📲 Download Splash Screen (splash.png)</button>
        </div>
        
        <div id="message"></div>
        
        <hr>
        <h3>Instructions:</h3>
        <ol style="text-align: left;">
            <li>Click each button to download the PNG files</li>
            <li>Save them in the <code>assets</code> folder of your project</li>
            <li>Run <code>npx expo prebuild --clean</code></li>
            <li>Rebuild your app</li>
        </ol>
    </div>
    
    <script>
        // Load SVG and draw on canvas
        async function loadSVG(url, canvas) {
            const svgText = await fetch(url).then(res => res.text());
            const img = new Image();
            const svgBlob = new Blob([svgText], {type: 'image/svg+xml'});
            const svgUrl = URL.createObjectURL(svgBlob);
            
            return new Promise((resolve) => {
                img.onload = () => {
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    URL.revokeObjectURL(svgUrl);
                    resolve();
                };
                img.src = svgUrl;
            });
        }
        
        // Load icons
        const iconCanvas = document.getElementById('iconCanvas');
        const splashCanvas = document.getElementById('splashCanvas');
        
        loadSVG('icon.svg', iconCanvas).then(() => console.log('Icon loaded'));
        loadSVG('splash.svg', splashCanvas).then(() => console.log('Splash loaded'));
        
        function downloadIcon() {
            const link = document.createElement('a');
            link.download = 'icon.png';
            link.href = iconCanvas.toDataURL('image/png');
            link.click();
            showMessage('✅ icon.png downloaded! Save it to assets/ folder', 'success');
        }
        
        function downloadAdaptive() {
            // Create a 1024x1024 version for adaptive icon
            const adaptiveCanvas = document.createElement('canvas');
            adaptiveCanvas.width = 1024;
            adaptiveCanvas.height = 1024;
            const ctx = adaptiveCanvas.getContext('2d');
            ctx.drawImage(iconCanvas, 0, 0, 1024, 1024);
            const link = document.createElement('a');
            link.download = 'adaptive-icon.png';
            link.href = adaptiveCanvas.toDataURL('image/png');
            link.click();
            showMessage('✅ adaptive-icon.png downloaded! Save it to assets/ folder', 'success');
        }
        
        function downloadSplash() {
            const link = document.createElement('a');
            link.download = 'splash.png';
            link.href = splashCanvas.toDataURL('image/png');
            link.click();
            showMessage('✅ splash.png downloaded! Save it to assets/ folder', 'success');
        }
        
        function showMessage(msg, type) {
            const msgDiv = document.getElementById('message');
            msgDiv.innerHTML = \`<p class="\${type}">\${msg}</p>\`;
            setTimeout(() => { msgDiv.innerHTML = ''; }, 5000);
        }
    </script>
</body>
</html>`;

fs.writeFileSync('./assets/icon-generator.html', converterHtml);
console.log('✅ icon-generator.html created');

// Update app.json
try {
  const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
  
  appJson.expo.icon = './assets/icon.png';
  appJson.expo.splash = {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#2563EB'
  };
  
  if (!appJson.expo.android) appJson.expo.android = {};
  appJson.expo.android.adaptiveIcon = {
    foregroundImage: './assets/adaptive-icon.png',
    backgroundColor: '#2563EB'
  };
  
  if (!appJson.expo.ios) appJson.expo.ios = {};
  appJson.expo.ios.bundleIdentifier = 'com.smartrental.app';
  appJson.expo.android.package = 'com.smartrental.app';
  
  fs.writeFileSync('./app.json', JSON.stringify(appJson, null, 2));
  console.log('✅ app.json updated with icon paths');
} catch (error) {
  console.log('⚠️ Could not update app.json automatically');
  console.log('Please manually add these lines to app.json:');
  console.log('  "icon": "./assets/icon.png",');
  console.log('  "splash": { "image": "./assets/splash.png", "resizeMode": "contain", "backgroundColor": "#2563EB" }');
}

console.log('\n🎉 All files created successfully!');
console.log('\n📌 Next steps:');
console.log('1. Open assets/icon-generator.html in your browser');
console.log('2. Click each button to download the PNG files');
console.log('3. Save them in the assets folder');
console.log('4. Run: npx expo prebuild --clean');
console.log('5. Run: npx expo start --clear');
console.log('\n📍 File location:');
console.log('   C:\\Users\\Parfait\\OneDrive\\Desktop\\SmartRental\\assets\\icon-generator.html');