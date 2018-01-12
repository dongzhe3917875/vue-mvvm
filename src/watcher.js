var Dep = require('./dep')

module.exports = Watcher

function Watcher(vm, expOrFn, cb) {
  // cb就是更新dom
	// vue对象
  this.vm = vm
  // 将watcher赋值给vue对象
  vm._watchers.push(this)
  // this.exp = exp
  this.expOrFn = expOrFn
  this.cb = cb

  // dep对象和对应的ID
  this.deps = []
  this.depIds = {}

  this.getter = function (vm) {
    // 在这里会触发observer里面的getter
    return vm[expOrFn]
  }
  this.setter = function (vm, value) {
    var val = vm;
    var exp = expOrFn
    exp = exp.split('.');
    exp.forEach(function(k, i) {
        // 非最后一个key，更新val的值
        if (i < exp.length - 1) {
            val = val[k];
        } else {
            val[k] = value;
        }
    })
  }

  // getter的作用域是this.vm
  if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
  } else {
      this.getter = this.parseGetter(expOrFn);
  }

  this.value = this.get()
}

Watcher.prototype.parseGetter = function(exp) {
  
  if (/[^\w.$]/.test(exp)) return;

  var exps = exp.split('.');

  return function(obj) {
    for (var i = 0, len = exps.length; i < len; i++) {
      if (!obj) return;
      obj = obj[exps[i]];
    }
    return obj;
  }
}


Watcher.prototype.get = function () {
	// 原来Target给了watcher对象
  Dep.target = this
  // 这里会触发 observer里面的getter Dep.target是有值的 值为watcher

  // compute更新是怎么回事
  // 在这里直接触发了 computed 中aaa 的get aaa的get执行了函数 返回了里面的name以及age
  // 又触发了name和age的get 这样就会吧Dep.target 也就是当前的watcher是aaa 加入到name和age的dep的sub里面
  // 一旦触发了 name或者age的set 就会notify 更新aaa以及aaa的视图
  // 不论是主动更新还是被动更新都是可以的 每次更新完后都会触发get 更新都会更新数据和视图
  var value = this.getter.call(this.vm, this.vm)
  Dep.target = null
  return value
}


Watcher.prototype.set = function (value) {
  this.setter.call(this.vm, this.vm, value)
}

Watcher.prototype.addDep = function (dep) {
  // 会传进来一个dep实例 每一个observe 的属性 都会维护一个自己的dep
  var id = dep.id
  if (!this.depIds[id]) {
  	// 把watcher添加到 dep 的subs属性里面
    dep.addSub(this)
    this.depIds[id] = true
    this.deps.push(dep)
  }
}

Watcher.prototype.update = function () {
  this.run()
}

Watcher.prototype.run = function () {
  // 也会触发observer里面的getter
  var value = this.get()
  if (this.value !== value) {
    var oldValue = this.value
    // 改数据
    this.value = value
    // 改dom
    this.cb.call(this.vm, value, oldValue)
  }
}