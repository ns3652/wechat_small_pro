// pages/select_project/select_project.js
Page({
  data: {
    content: '',
    hidden: true,
    nocancel: true
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // var phone = wx.getStorageSync('userPhone')
    // if (phone == '') {
    //   this.setData({
    //     hidden: false,
    //     content: '请先登录'
    //   })
    // }
  },
  confirm: function () {
    // this.setData({
    //   hidden: true
    // });
    // wx.redirectTo({
    //   url: '../index/index',
    // })
  },

  select_invite_friend: function(){
    wx.redirectTo({
      url: '../invite_friend/invite_friend',
    })
  },

  warning(){
    wx.showToast({
      title: '功能暂未开放',
      icon:'none',
      duration:3000
    })
  }

})