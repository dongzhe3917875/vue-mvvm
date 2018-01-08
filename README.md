# vue-mvvm
模拟vue-mvvm的简单实现
主要参考了两篇文章，将思路整理 代码结合在一起了 即实现了功能 又有模块化的拆分

[simple-vue](https://github.com/luobotang/simply-vue)
这篇文章模块化做的很好 各个模块都有拆分 对节点的compile 函数式运用很巧妙 但是没有compute属性和methods方法 以及对象的watch

[mvvm](https://github.com/DMQ/mvvm)
这篇文章介绍的比较详细 功能也比较全 只是代码耦合度比较高 看起来比较费劲 对文本节点的处理 不够细致

扩展了一些功能 比如 `methods`支持普通函数，`mounted`钩子函数的添加

使用demo的方法放在了test.html

```
<!doctype html>
<html>
<head>
	<meta charset="UTF-8">
	<title>Simple Vue</title>
</head>
<body>
	<div id="box">
		<p><input type="text" v-model="name"></p>
		<p>Your name: {{name}}</p>
		<!-- <ul><li><a href=""></a></li><li><a href=""></a></li><li><a href=""></a></li></ul> -->
		<p>{{aaa}}</p>
		<p v-text='obj.name'></p>
		<button v-on:click='changeName'>age to 18</button>
	</div>
	<script src="../dist/vue.js"></script>
	<script>
		var vm = new Vue({
			el: '#box',
			data: {
				name: 'dongzhe',
				age: '12',
				obj: {name: 'dongzhe'}
			},
			computed: {
				aaa () {
					return `姓名：${this.name}, 年龄：${this.age}`
				}
			},
			methods: {
				changeName () {
					this.age = 18
					this.obj.name = 'heheda'
				},
				test () {
					console.log('yes it is mounted')
				}
			},
			mounted () {
				this.obj = {name: 'dongzhe nb'}
				this.test()
			}
		})
	</script>
</body>
</html>
```
