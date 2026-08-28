const fs = require('fs');
let content = fs.readFileSync('src/components/hero/HeroScene.tsx', 'latin1');
const truncIdx = content.lastIndexOf("pointerEvents: 'no");
if (truncIdx > 0) {
  const good = content.substring(0, truncIdx);
  const ending = "style={{ background: 'transparent', pointerEvents: 'none' }}\r\n      >\r\n        <Scene mouse={reducedMotion ? { current: { x: 0, y: 0 } } : mouse} />\r\n      </Canvas>\r\n    </div>\r\n  )\r\n}\r\n";
  content = good + ending;
  fs.writeFileSync('src/components/hero/HeroScene.tsx', content, 'utf8');
  console.log('Fixed');
} else {
  console.log('Not found');
}
