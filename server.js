const http=require('http'),fs=require('fs'),path=require('path');
const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.json':'application/json','.webp':'image/webp'};
http.createServer((req,res)=>{
  let urlPath=decodeURIComponent(req.url.split('?')[0]);
  if(urlPath==='/') urlPath='/index.html';
  let f=path.join('.',urlPath);
  try{
    if(fs.existsSync(f) && fs.statSync(f).isDirectory()){
      f=path.join(f,'index.html');
    }
  }catch(_){}
  fs.readFile(f,(e,d)=>{
    if(e){res.writeHead(404);res.end('Not found')}
    else{res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'text/plain','Cache-Control':'no-cache'});res.end(d)}
  });
}).listen(5500,()=>console.log('\n🚀 Server running at http://localhost:5500/\n📝 Blog at http://localhost:5500/blog/\n📧 Contact form ready to test!\n\nPress Ctrl+C to stop\n'));