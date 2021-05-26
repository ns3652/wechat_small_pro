// pages/my/my.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    singleUserHiddenFlag: false,
    cupidHiddenFlag: true,
    content: '',
    hidden: true,
    nocancel: true,  ///
    userImg: '/assets/images/pic45.png',
    userPhone: '',
    username:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let avatarUrl = wx.getStorageSync('avatarUrl')
    if (avatarUrl == null || avatarUrl == undefined || avatarUrl == ''){
      avatarUrl = '/assets/images/pic45.png'
    }
    console.log('avatarUrl:'+avatarUrl)
      this.setData({
        username:wx.getStorageSync('userName'),
        userImg:avatarUrl
      })
  },


  logout: function(){
    wx.clearStorage();
    wx.redirectTo({
      url: '../login/login',
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
  onShareAppMessage: function () {

  }
})