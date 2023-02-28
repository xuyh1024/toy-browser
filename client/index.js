import Request from './request/index.js'
import images  from 'images';
import {parseHTML} from './dom/parser.js'
import {render} from './render/index.js'
// 发送请求
const request = new Request({
    method: "POST",
    host: "127.0.0.1",
    port: "8088",
    path: "/",
    headers: {  // 请求头
        ["X-Foo2"]: "customed" // 自定义请求头
    },
    body: {  // 请求体
        name: "xuyihao"
    }
})
// 解析dom
let response = await request.send()
let dom = parseHTML(response.body)
let viewport = images(800, 600)
render(viewport, dom)
viewport.save("viewport.jpg")