// 引入自定义指令
var directives = require('./directives')

var toArray = require('./utils').toArray
var replace = require('./utils').replace

// 匹配{{}}里面不是{}的部分
var regTag = /{{([^{}]+)}}/g

exports.compileRoot = function compileRoot(el, options) {
	return function rootLinkFn(vm, el) {
		// TODO
	}
}

exports.compile = function compile(el, options) {
	// el是根dom节点

	// 处理节点
	// 返回是一个nodeLinkFn的函数 目的是完成_bindDir指令的初始化
	var nodeLinkFn = compileNode(el, options)

	// 对子节点进行处理 hasChildNodes方法返回一个布尔值,表明当前节点是否包含有子节点.
	var childLinkFn = el.hasChildNodes() ? compileNodeList(el.childNodes, options) : null
	return function compositeLinkFn(vm, el) {
		var childNodes = [].slice.call(el.childNodes)
		linkAndCapture(function compositeLinkCapturer() {
			// 执行真正的bindDir 创建directive对象
			if (nodeLinkFn) nodeLinkFn.forEach(method => method(vm, el))
			if (childLinkFn) childLinkFn(vm, childNodes)
		}, vm)
	}
}

function linkAndCapture(linker, vm) {
	var originalDirCount = vm._directives.length
	// push vm._directives
	linker()
	var dirs = vm._directives.slice(originalDirCount)
	dirs.forEach(function (dir) { dir._bind() })
	return dirs
}

function compileNode(node, options) {
	// Node.ELEMENT_NODE	1	一个 元素 节点，例如 <p> 和 <div>。 元素节点
	if (node.nodeType === 1) {
		return compileElement(node, options)
	// Node.TEXT_NODE	3	Element 或者 Attr 中实际的  文字 文本节点
	} else if (node.nodeType === 3) {
		return compileTextNode(node, options)
	} else {
		return null
	}
}

// 遍历所有DOM节点 并保证 compileNode

function compileNodeList(nodeList, options) {
	var linkFns = []
	var nodeLinkFn, childLinkFn, node
	for (var i = 0, l = nodeList.length; i < l; i++) {
		node = nodeList[i]
		nodeLinkFn = compileNode(node, options)
		childLinkFn = node.hasChildNodes() ? compileNodeList(node.childNodes, options) : null
		linkFns.push(nodeLinkFn, childLinkFn)
	}
	return linkFns.length ? makeChildLinkFn(linkFns) : null
}

function makeChildLinkFn(linkFns) {
	return function childLinkFn(vm, nodes) {
		var node, nodeLinkFn, childrenLinkFn
		for (var i = 0, n = 0, l = linkFns.length; i < l; n++) {
			node = nodes[n]
			nodeLinkFn = linkFns[i++]
			childrenLinkFn = linkFns[i++]
			if (nodeLinkFn) nodeLinkFn.forEach(method => method(vm, node))
				// nodeLinkFn(vm, node)
			if (childrenLinkFn) childrenLinkFn(vm, toArray(node.childNodes))
		}
	}
}

function compileElement(el, options) {
	// 只处理 input[type="text"][v-model]
	// hasAttribute 返回一个布尔值，指示该元素是否包含有指定的属性（attribute）
	// 指令处理抽象函数
	var nodeAttrs = el.attributes
  var self = this
  var fns = []
	Array.prototype.slice.call(nodeAttrs).forEach(function(attr) {
		var attrName = attr.name.trim()
		if (isDirective(attrName)) {
			var exp = attr.value // methodName
			var dir = attrName.substring(2) // on
			console.log(exp, dir)
			if (isEventDirective(dir)) {
				fns.push(makeNodeMethods ({
					name: dir,
					exp: exp
				}))
			} else {
				fns.push(makeNodeLinkFn({
					name: dir,
					exp: exp,
					def: directives[dir]
				}))
			}
		} else {
			return null
		}
	})
	return fns
	// if (el.tagName === 'INPUT' && el.hasAttribute('v-model')) {

	// 	// getAttribute() 返回元素上一个指定的属性值
 //  	var exp = el.getAttribute('v-model').trim()

 //  	// 绑定指令之间的关系 
 //  	// console.log('%c绑定指令之间的关系', 'color:#209cee;font-size:16px')
	// 	return makeNodeLinkFn({
	// 		name: 'model',
	// 		exp: exp,
	// 		def: directives.model
	// 	})
	// 	console.log({
	// 		name: 'model',
	// 		exp: exp,
	// 		def: directives.model
	// 	})
	// } else {
	// 	return null
	// }
}

var compileUtil = {
	// 'v-on:click="click"'
	eventHandler: function(node, vm, exp, dir) {
		var eventType = dir.split(':')[1],
			fn = vm.$options.methods && vm.$options.methods[exp];

		if (eventType && fn) {
			node.addEventListener(eventType, fn.bind(vm), false);
		}
	}
}



var isEventDirective = function(dir) {
	return dir.indexOf('on') === 0
}
var isDirective = function(attr) {
	return attr.indexOf('v-') == 0
}

var isBindDirective = function (dir) {
	return dir.indexOf('bind') === 0
}

function compileTextNode(node, options) {
	var tokens = parseText(node.wholeText)
	// console.log("%c解析文本节点tokens: " + '%c' + JSON.stringify(tokens), 'color:#f90;font-size:16px', 'font-size:16px;color:#fce')
	// JSON.stringify(parseText("  {{aaaa}}  "))
  // "[{"value":"  "},{"tag":true,"value":"aaaa"},{"value":"  "}]"
	if (tokens) {
		// 创建一个Fragment
		var frag = document.createDocumentFragment()
		tokens.forEach(function (token) {
			var el = token.tag ? processTextToken(token) : document.createTextNode(token.value)
			frag.appendChild(el)
		})
		return [makeTextNodeLinkFn(tokens, frag)]
	}
}



function processTextToken(token) {
  var el = document.createTextNode(' ')
	// 简化，双向绑定，text 模式
	token.descriptor = {
		name: 'text',
		exp: token.value,
		def: directives.text
	}
	return el
}

var makeNodeMethods = function(dir) {
	// name on exp methodName
	return function nodeLinkFn(vm, el) {
		// 绑定逻辑关系
		vm._bindDir(dir, el)
	}
}

function makeNodeLinkFn(dir) {
	console.log(dir)
	return function nodeLinkFn(vm, el) {
		// 绑定逻辑关系
		vm._bindDir(dir, el)
	}
}

function makeTextNodeLinkFn(tokens, frag) {
	return function textNodeLinkFn(vm, el) {
		var fragClone = frag.cloneNode(true)
		var childNodes = toArray(fragClone.childNodes)
		tokens.forEach(function (token, i) {
			var value = token.value
			if (token.tag) {
				var node = childNodes[i]
				vm._bindDir(token.descriptor, node)
			}
		})
		replace(el, fragClone)
	}
}

function parseText(text) {
  if (regTag.test(text)) {
    // just copy from vue, and simplify
    var tokens = []
    var lastIndex = regTag.lastIndex = 0
    var match, index, value

    while (match = regTag.exec(text)) {

      index = match.index
      // push text token
      if (index > lastIndex) {
        tokens.push({
          value: text.slice(lastIndex, index)
        })
      }

      value = match[1]

      tokens.push({
        tag: true,
        value: value.trim()
      })
      lastIndex = index + match[0].length
    }
    if (lastIndex < text.length) {
      tokens.push({
        value: text.slice(lastIndex)
      })
    }
    return tokens
  } else {
    return null
  }
}
