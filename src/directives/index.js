exports.model = {
  bind: function () {
    var self = this
    this.on('change', function () {
      self.set(self.el.value)
    })
  },
  update: function (value) {
    this.el.value = value
  }
}

exports.text = {
  bind: function () {
    // do nothing
  },
  update: function (value) {
    this.el.textContent = value
  }
}


exports.show = {
  bind: function () {
    // do nothing
  },
  update: function (value) {
    if (value === true) {
      this.el.style.display = 'block'
    } else {
      this.el.style.display = 'none'
    }
  }
}