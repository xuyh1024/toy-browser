// TrunkedBodyParser 类
export default class TrunkedBodyParser {
    constructor() {
        this.WAITING_LENGTH = 0 // 等待长度
        this.WAITING_LENGTH_LINE_END = 1 // 等待长度行结束
        this.READING_TRUNK = 2 // 读取块
        this.WAITING_NEW_LINE = 3 // 等待新行
        this.WAITING_NEW_LINE_END = 4 // 等待新行结束
        this.length = 0 // 长度
        this.content = [] // 内容 
        this.isFinished = false // 是否结束
        this.current = this.WAITING_LENGTH // 当前状态
    }
    receiveChar(char) {
        if (this.current === this.WAITING_LENGTH) {
            if (char === '\r') {
                if (this.length === 0) {
                    this.isFinished = true
                }
                this.current = this.WAITING_LENGTH_LINE_END
            } else {
                this.length *= 16
                this.length += parseInt(char, 16)
            }
        } else if (this.current === this.WAITING_LENGTH_LINE_END) {
            if (char === '\n') {
                this.current = this.READING_TRUNK
            }
        } else if (this.current === this.READING_TRUNK) {
            this.content.push(char)
            this.length--
            if (this.length === 0) {
                this.current = this.WAITING_NEW_LINE
            }
        } else if (this.current === this.WAITING_NEW_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_NEW_LINE_END
            }
        } else if (this.current === this.WAITING_NEW_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_LENGTH
            }
        }
    }
}