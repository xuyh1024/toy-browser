// 简单实现一个http服务
import { createServer } from 'http';
createServer((req, res) => {
  console.log('接收到请求！');
  let body = [];
  req.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {  // 读取请求体
    body.push(chunk);
  }).on('end', () => {  // 请求体读取完毕 
    body = Buffer.concat(body).toString();
    console.log('body:', body);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Foo', 'bar');
    res.writeHead(200, { 'Content-Type': 'text/plain' }); 
    // 提供一个默认的html
    res.end(
      `<html>
        <head>
          <style>
            #container {
              width: 500px;
              height: 300px;
              display: flex;
              background-color: rgb(255,255,255);
            }
            #container #myid {
              width: 200px;
              height: 100px;
              background-color: rgb(255,0,0);
            }
            #container .c1 {
              flex: 1;
              background-color: rgb(0,255,0);
            }
          </style>
        </head>
        <body>
          <div id="container">
            
            <div id="myid"></div>
            <div class="c1"></div>
          </div>
        </body>
      </html>`);
  });
}).listen(8088);

console.log('服务器已启动，监听端口8088！');
