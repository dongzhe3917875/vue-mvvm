var _compile = require('./compile')
var compileRoot = _compile.compileRoot
var compile = _compile.compile

var observe = require('./observe')
var Directive = require('./directive')

window.Vue = Vue

function Vue(options) {
  this._init(options)
}

Vue.prototype._init = function(options) {
  this.$options = options
  this._directives = []
  this._watchers = []

  this._isVue = true

  this.mounted = options.mounted || function() {}

  this._initState()
  
    // 挂载 
  this.$mount(options.el)
}

Vue.prototype._initState = function() {
  this._initProp()
  this._initData()
  this._initMethods()
}


Vue.prototype._initMethods = function() {
  var methods = this._methods = this.$options.methods || {}
  Object.keys(this._methods).forEach(function(key) {
      this[key] = this._methods[key]
    }, this)
}

Vue.prototype._initProp = function() {
  var options = this.$options
    // 解析DOM表达式
  options.el = document.querySelector(options.el)
}

// 解析数据
// new Vue({
//   data: {
//     name: 'dongzhe'
//   }
// })

// 数据监测部分

Vue.prototype._initData = function() {
  // 设置一个_data属性保持变量独立性
  var data = this._data = this.$options.data || {}
  // 把data的属性赋值给this 将data.name 赋值给 this.name 浅复制
  Object.keys(this._data).forEach(function(key) {
      // 对数据进行代理
      this._proxy(key)
    }, this)
    // 对数据进行监听
  this._initComputed()
  observe(data, this)
}


Vue.prototype._initComputed = function() {
  var self = this;
  var computed = this.$options.computed
  if (typeof computed === 'object') {
    Object.keys(computed).forEach(function(key) {
      Object.defineProperty(self, key, {
        // computed[key] 是一个function
        get: typeof computed[key] === 'function' ? computed[key] : computed[key].get,
        set: function() {}
      });
    });
  }
}

Vue.prototype._proxy = function(key) {
  var self = this
  Object.defineProperty(self, key, {
    configurable: true,
    enumerable: true,
    get: function proxyGetter() {
      return self._data[key]
    },
    set: function proxySetter(val) {
      // 当修改的时候变换数值 同步_data和this数据
      self._data[key] = val
    }
  })
}

// 模板渲染部分
Vue.prototype.$mount = function (el) {
  this._compile(el)
}

Vue.prototype._compile = function (el) {
  var original = el
  compileRoot(el)(this, el)
  compile(el)(this, el)
  this.mounted()
}

// 指令部分
Vue.prototype._bindDir = function (descriptor, node) {
  // console.log('descriptor', descriptor, node)
  this._directives.push(new Directive(descriptor, this, node))
}
