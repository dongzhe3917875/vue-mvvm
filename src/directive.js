var Watcher = require('./watcher')

module.exports = Directive

function Directive(descriptor, vm, el) {
	this.vm = vm
	this.el = el
	this.descriptor = descriptor
	this.name = descriptor.name
	this.expression = descriptor.exp
}

Directive.prototype._bind = function () {
	var name = this.name
	var descriptor = this.descriptor


	// 绑定事件
	if (name.indexOf('on') === 0) {
		return this.onMethod(this.el, this.vm, this.expression, name)
	}
	if (this.el && this.el.removeAttribute) {
		this.el.removeAttribute(descriptor.attr || 'v-' + name)
	}

	var def = descriptor.def
	this.update = def.update
	this.bind = def.bind

	// 绑定指令的事件
	if (this.bind) this.bind()

	this._update = function (val) {
		// 绑定方法
		this.update(val)
	}.bind(this)

	// 初始化一个watcher
	// watcher去更新数据
	var watcher = this._watcher = new Watcher(this.vm, this.expression, this._update)

	//初始化更新视图
	this.update(watcher.value)
}

Directive.prototype.set = function (value) {
	this._watcher.set(value)
}

Directive.prototype.onMethod = function(node, vm, exp, dir) {
	var eventType = dir.split(':')[1],
	fn = vm.$options.methods && vm.$options.methods[exp];
	if (eventType && fn) {
		node.addEventListener(eventType, fn.bind(vm), false);
	}
}

Directive.prototype.on = function (event, handler) {
	this.el.addEventListener(event, handler, false)
}



