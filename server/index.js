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
`<html maaa=a >
  <head>
    <style>
      body {
        background-color: #ff5000;
      }
      body div #myid {
        width: 30px;
        background-color: #ff1111;
      }
    </style>
  </head>
  <body>
    <div>
      <img id="myid"/>
      <img/>
    </div>
  </body>
</html>`);
  });
}).listen(8088);

console.log('服务器已启动，监听端口8088！');
