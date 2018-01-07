// 替换指定dom为另外一个dom元素
exports.replace = function replace(target, el) {
	target.parentNode.replaceChild(el, target)
}

// 讲一个类数组或者有length属性的对象转换为一个真正的数组
exports.toArray = function toArray(list) {
	var l = list.length
	var ret = new Array(l)
	while (l--) {
		ret[l] = list[l]
	}
	return ret
}