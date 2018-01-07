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
	Dep.target.addDep(this)
}


Dep.prototype.notify = function () {
	console.log('subs', this.subs)
	this.subs.forEach(function (sub) {
		// 调用每一个watcher 的 update
		sub.update()
	})
}