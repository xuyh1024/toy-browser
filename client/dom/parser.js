import {computeCSS,addCSSRules} from '../css/index.js'
// 用来存储当前的token
let currentToken = null
// 用来存储当前的属性
let currentAttribute = null
// 用来存储当前的文本节点
let currentTextNode = null
// 用symbol来表示EOF
const EOF = Symbol("EOF") // EOF: End Of File

let stack = [{ type: "document", children: [] }] // 栈




// 解析html
function parseHTML(html) {
    let state = data
    for (let c of html) {
        state = state(c)
    }
    state = state(EOF)
    return stack[0]
}

// 数据
function data(c) {
    if (c == "<") {
        return tagOpen
    } else if (c == EOF) {
        emit({
            type: "EOF"
        })
        return
    } else {
        emit({
            type: "text",
            content: c
        })
        return data
    }
}
// 标签开始
function tagOpen(c) {
    if (c == "/") {
        return endTagOpen
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "startTag",
            tagName: ""
        }
        return tagName(c)
    } else {
        return
    }
}
// 结束标签
function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "endTag",
            tagName: ""
        }
        return tagName(c)
    } else if (c == ">") {

    } else if (c == EOF) {

    } else {

    }
}
// 标签名
function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    } else if (c == "/") {
        return selfClosingStartTag
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c
        return tagName
    } else if (c == ">") {
        emit(currentToken)
        return data
    } else {
        currentToken.tagName += c
        return tagName
    }
}
// 前面的属性
function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    } else if (c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c)
    } else if (c == "=") {

    } else {
        currentAttribute = {
            name: "",
            value: ""
        }
        return attributeName(c)
    }
}
// 属性值
function selfClosingStartTag(c) {
    if (c == ">") {
        currentToken.isSelfClosing = true
        emit(currentToken)
        return data
    } else if (c == "EOF") {

    } else {


    }
}
// 双引号属性值
function afterAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName
    } else if (c == "/") {
        return selfClosingStartTag
    } else if (c == "=") {
        return beforeAttributeName
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if (c == EOF) {

    } else {
        currentToken[currentAttribute.name] = currentAttribute.value
        currentAttribute = {
            name: "",
            value: ""
        }
        return attributeName(c)
    }
}
// 单引号属性值
function attributeName(c) {
    if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c)
    } else if (c == "=") {
        return beforeAttributeValue
    } else if (c == "\u0000") {

    } else if (c == "\"" || c == "'" || c == "<") {

    } else {
        currentAttribute.name += c
        return attributeName
    }
}
// 无引号属性值
function beforeAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return beforeAttributeValue
    } else if (c == "\"") {
        return doubleQuotedAttributeValue
    } else if (c == "\'") {
        return singleQuotedAttributeValue
    } else if (c == ">") {

    } else {
        return UnquotedAttributeValue(c)
    }
}
// 双引号属性值
function doubleQuotedAttributeValue(c) {
    if (c == "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    } else if (c == "\u0000") {

    } else if (c == EOF) {


    } else {
        currentAttribute.value += c
        return doubleQuotedAttributeValue
    }
}
// 单引号属性值
function singleQuotedAttributeValue(c) {
    if (c == "\'") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    } else if (c == "\u0000") {

    } else if (c == EOF) {

    } else {
        currentAttribute.value += c
        return singleQuotedAttributeValue
    }
}
// 属性值结束
function afterQuotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    } else if (c == "/") {
        return selfClosingStartTag
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if (c == EOF) {

    } else {
        currentAttribute.value += c
        return doubleQuotedAttributeValue
    }
}
// 无引号属性值
function UnquotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value
        return beforeAttributeName
    } else if (c == "/") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return selfClosingStartTag
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if (c == "\u0000") {

    } else if (c == "\"" || c == "'" || c == "<" || c == "=" || c == "`") {

    } else if (c == EOF) {

    } else {
        currentAttribute.value += c
        return UnquotedAttributeValue
    }
}

// 用栈来处理标签嵌套的问题
function emit(token) {
    let top = stack[stack.length - 1]
    if (token.type === "startTag") {
        let element = {
            type: "element",
            children: [],
            attributes: []
        }

        element.tagName = token.tagName

        for (let p in token) {
            if (p != "type" && p != "tagName") {
                element.attributes.push({
                    name: p,
                    value: token[p]
                })
            }
        }
        // 计算css

        element.computedStyle = computeCSS(element,stack)
        top.children.push(element)
        element.parent = top

        if (!token.isSelfClosing) {
            stack.push(element)
        }

        currentTextNode = null
    } else if (token.type == "endTag") {
        if (top.tagName != token.tagName) {
            throw new Error("Tag start end doesn't match!")
        } else {
            // 遇到style标签时，执行添加css规则的操作
            if (top.tagName == "style") {
                addCSSRules(top.children[0].content)
            }
            stack.pop()
        }
        currentTextNode = null
    } else if (token.type == "text") {
        if (currentTextNode == null) {
            currentTextNode = {
                type: "text",
                content: ""
            }
            top.children.push(currentTextNode)
        }
        currentTextNode.content += token.content
    }
}


export {
    parseHTML
}