var Dep = require('./dep')
// let vm = new Vue({
//   data: {
//     name: 'dongzhe'
//   }
// })

// value = {name: 'dongzhe'}

module.exports = function observe(value, vm) {
  // value  是 this._data 不是 this
  var ob
  if (value.hasOwnProperty('__ob__')) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  if (ob && vm) {
    ob.addVm(vm)
  }
  return vm
}

function Observer(value) {
  this.value = value
  // this.dep = new Dep()
  // 把observer对象设置为 this._data的一个属性 __ob__
  Object.defineProperty(value, '__ob__', {
    value: this,
    enumerable: false,
    writable: true,
    configurable: true
  })
  // 遍历this._data
  this.walk(value)
}


Observer.prototype.walk = function (obj) {
  Object.keys(obj).forEach(function (key) {
    // name: dongzhe
    this.convert(key, obj[key])
  }, this)
}


Observer.prototype.convert = function (key, value) {
  // {name: dongzhe} name dongzhe
  defineReactive(this.value, key, value)
}

// 将多个vue实例放进去
Observer.prototype.addVm = function (vm) {
  // 利用括号实现初始化
  (this.vms || (this.vms = [])).push(vm)
}

function defineReactive(obj, key, value) {
  // obj 就是 this._data {name: dongzhe}
  var dep = new Dep()

  // 如果value是一个对象 则进行递归遍历 确保每一个属性被defineProperty到
  observeNew(value); // 监听子属性

   // 定义set 和 get
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      // 由于需要在闭包内添加watcher，所以通过Dep定义一个全局target属性，暂存watcher, 添加完移除
      if (Dep.target) {
        // 计算属性
        dep.depend()
      }
      return value
    },
    set: function reactiveSetter(newVal) {
      if (value === newVal) {
        return
      } else {
        value = newVal
        // 通知更新 其实就是调用 subs里面的watcher 来更新数据以及根据依赖更新数据
        // 一旦有数据被set 就会更新依赖数据

        // 新的值是object的话，进行监听
        childObj = observeNew(newVal)
        dep.notify()
      }
    }
  })
}

function observeNew(value, vm) {
    if (!value || typeof value !== 'object') {
        return
    }
    return new Observer(value)
}


