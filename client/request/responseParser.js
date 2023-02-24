import TrunkedBodyParser from './trunkedBodyParser.js'
// ResponseParser 类
export default class ResponseParser {
    constructor() {
        this.WAITING_STATUS_LINE = 0 // 等待状态行
        this.WAITING_STATUS_LINE_END = 1 // 等待状态行结束
        this.WAITING_HEADER_NAME = 2 // 等待头部字段名
        this.WAITING_HEADER_SPACE = 3 // 等待头部字段名后的空格
        this.WAITING_HEADER_VALUE = 4 // 等待头部字段值
        this.WAITING_HEADER_LINE_END = 5 // 等待头部字段行结束
        this.WAITING_HEADER_BLOCK_END = 6 // 等待头部字段块结束
        this.WAITING_BODY = 7 // 等待请求体

        this.current = this.WAITING_STATUS_LINE // 当前状态
        this.statusLine = '' // 状态行
        this.headers = {} // 头部字段
        this.headerName = '' // 头部字段名
        this.headerValue = '' // 头部字段值
        this.bodyParser = null // 请求体解析器

    }
    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished
    }
    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }
    receive(string) {
        for (let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i))
        }
    }
    receiveChar(char) {
        if (this.current === this.WAITING_STATUS_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_STATUS_LINE_END
            } else {
                this.statusLine += char
            }
        } else if (this.current === this.WAITING_STATUS_LINE_END) {
            if (char === '\n' ) {
                this.current = this.WAITING_HEADER_NAME
            }
        } else if (this.current === this.WAITING_HEADER_NAME) {
            if (char === ':') {
                this.current = this.WAITING_HEADER_SPACE
            } else if (char === '\r') {
                this.current = this.WAITING_HEADER_BLOCK_END
                if (this.headers['Transfer-Encoding'] === 'chunked') {
                    this.bodyParser = new TrunkedBodyParser()
                }
            } else {
                this.headerName += char
            }
        } else if (this.current === this.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                this.current = this.WAITING_HEADER_VALUE
            }
        } else if (this.current === this.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.current = this.WAITING_HEADER_LINE_END
                this.headers[this.headerName] = this.headerValue
                this.headerName = ''
                this.headerValue = ''
            } else {
                this.headerValue += char
            }
        } else if (this.current === this.WAITING_HEADER_LINE_END) {
            if (char === '\n'){
                this.current = this.WAITING_HEADER_NAME
            }
        } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
            if (char === '\n') {
                this.current = this.WAITING_BODY
            }
        } else if (this.current === this.WAITING_BODY) {
            this.bodyParser.receiveChar(char)
        }
    }
}