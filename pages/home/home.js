// pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    share:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let username = options.username;
    if (username == null || username == ''){
      username = '测试'
    }
    this.setData({
      share:username
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: "这个小程序真好",
      path: 'pages/home/home?username=' + wx.getStorageSync('userName')
    }
  }
})