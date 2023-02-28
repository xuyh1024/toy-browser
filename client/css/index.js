
import css from "css"
// 用来存储css规则
let rules = [] // css规则
// 添加css规则
function addCSSRules(text) {
    let ast = css.parse(text)
    rules.push(...ast.stylesheet.rules)
}

//计算css
function computeCSS(element,stack) {
    let elements = stack.slice().reverse()
    if (!element.computedStyle) {
        element.computedStyle = {}
    }
    //遍历css规则
    for (let rule of rules) {
        let selectorParts = rule.selectors[0].split(" ").reverse()
        if (!match(element, selectorParts[0])) {
            continue
        }
        let matched = false
        let j = 1
        for (let i = 0; i < elements.length; i++) {
            if (match(elements[i], selectorParts[j])) {
                j++
            }
        }
        if (j >= selectorParts.length) {
            matched = true
        }
        if (matched) {
            // 如果匹配到，就加入
            let sp = specificity(rule.selectors[0])
            for (let declaration of rule.declarations) {
                if (!element.computedStyle[declaration.property]) {
                    element.computedStyle[declaration.property] = {}
                }
                if (!element.computedStyle[declaration.property].specificity) {
                    element.computedStyle[declaration.property].value = declaration.value
                    element.computedStyle[declaration.property].specificity = sp
                } else if (compare(element.computedStyle[declaration.property].specificity, sp) < 0) {
                    element.computedStyle[declaration.property].value = declaration.value
                    element.computedStyle[declaration.property].specificity = sp
                }
            }
        }
    }
    return element.computedStyle
}
// 计算优先级
function specificity(selector) {
    let p = [0, 0, 0, 0]
    let selectorParts = selector.split(" ")
    for (let part of selectorParts) {
        if (part.charAt(0) == "#") {
            p[1] += 1
        } else if (part.charAt(0) == ".") {
            p[2] += 1
        } else {
            p[3] += 1
        }
    }
    return p
}
// 比较优先级
function compare(sp1, sp2) {
    if (sp1[0] - sp2[0]) {
        return sp1[0] - sp2[0]
    }
    if (sp1[1] - sp2[1]) {
        return sp1[1] - sp2[1]
    }
    if (sp1[2] - sp2[2]) {
        return sp1[2] - sp2[2]
    }
    return sp1[3] - sp2[3]
}
// 匹配选择器
function match(element, selector) {
    if (!selector || !element.attributes) {
        return false
    }
    if (selector.charAt(0) == "#") {
        let attr = element.attributes.filter(attr => attr.name === "id")[0]
        if (attr && attr.value === selector.replace("#", "")) {
            return true
        }
    } else if (selector.charAt(0) == ".") {
        let attr = element.attributes.filter(attr => attr.name === "class")[0]

        if (attr && attr.value === selector.replace(".", "")) {
            return true
        }
    } else {
        if (element.tagName === selector) {

            return true
        }
    }
    return false
}

export {
    addCSSRules,
    computeCSS
}