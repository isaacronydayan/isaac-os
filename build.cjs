// Build do Isaac OS: compila src/app.jsx (JSX → JS) e injeta em api/index.js.
// Uso: node build.cjs   (requer @babel/core e @babel/preset-react instalados)
let babel;try{babel=require('@babel/core')}catch{babel=require('/tmp/node_modules/@babel/core')}
const fs = require('fs');

const jsx = fs.readFileSync('src/app.jsx', 'utf8');
const out = babel.transformSync(jsx, {
  presets: [['@babel/preset-react', { runtime: 'classic', development: false }]],
  filename: 'app.jsx',
  compact: true,
}).code;

// Regras do template literal: nada de backtick ou ${ dentro do HTML
if (out.includes('`')) throw new Error('compilado contém backtick!');
if (out.includes('${')) throw new Error('compilado contém ${ !');

let idx = fs.readFileSync('api/index.js', 'utf8');
// substitui o bloco text/babel (fonte) pelo compilado plain <script>
const re = /<script type="text\/babel">\n[\s\S]*?<\/script>\n<\/body>/;
if (!re.test(idx)) {
  // já está compilado? substitui o bloco marcado
  const re2 = /<script>\/\*APP_COMPILADO[\s\S]*?<\/script>\n<\/body>/;
  if (!re2.test(idx)) throw new Error('bloco do app não encontrado em api/index.js');
  idx = idx.replace(re2, '<script>/*APP_COMPILADO — gerado por build.cjs a partir de src/app.jsx — NÃO EDITAR À MÃO*/\n' + out + '\n</script>\n</body>');
} else {
  idx = idx.replace(re, '<script>/*APP_COMPILADO — gerado por build.cjs a partir de src/app.jsx — NÃO EDITAR À MÃO*/\n' + out + '\n</script>\n</body>');
}
fs.writeFileSync('api/index.js', idx);
console.log('✅ build ok — compilado:', out.length, 'bytes');
