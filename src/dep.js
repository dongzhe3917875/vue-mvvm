var uid = 0
module.exports = Dep

function Dep() {
	// 给每一个Dep一个id
  this.id = uid++
	this.subs = []
}

Dep.target = null

Dep.prototype.addSub = function (sub) {
	// add sub 添加依赖 sub还是watcher
	this.subs.push(sub)
}

Dep.prototype.depend = function () {
	// Dep.target是一个watcher 调用watcher 的 addDep方法 把watcher添加到subs
	// 1. 每次调用run()的时候会触发相应属性的getter
  // getter里面会触发dep.depend()，继而触发这里的addDep
	// 2. 假如相应属性的dep.id已经在当前watcher的depIds里，说明不是一个新的属性，仅仅是改变了其值而已
	// 则不需要将当前watcher添加到该属性的dep里
	// 3. 假如相应属性是新的属性，则将当前watcher添加到新属性的dep里
	Dep.target.addDep(this)
}


Dep.prototype.notify = function () {
	console.log('subs', this.subs)
	this.subs.forEach(function (sub) {
		// 调用每一个watcher 的 update
		sub.update()
	})
}