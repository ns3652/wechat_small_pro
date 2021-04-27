// pages/select_project/select_project.js
const app = getApp()
var baseUrl = app.globalData.host;
Page({
  data: {
    items1: [
      { name: '男', value: '男', checked: '' },
      { name: '女', value: '女',checked:'' },
    ],
    items2: [
      { name: '未婚', value: '未婚', checked: '' },
      { name: '离异', value: '离异', checked: '' },
    ],
    hideItem:false,
    sex:'',
    phone:'',
    test:'',
    username:'',
    password:'',
    surePassword:'',
    spirit:'',
    rightTest:'',
    time:61,
    text:'获取验证码',
    disabled: false,
    color:'#f97676',
    role:'',
    id:'',
    referrerPhone:'',
    rigText:''
  },
  sexChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      sex:e.detail.value
    })
  },
  inputPhone:function(e){
    this.setData({
      phone:e.detail.value
    })
  },
  inputUsername:function(e){
    this.setData({
      username:e.detail.value
    })
  },
  inputTest:function(e){
    this.setData({
      test: e.detail.value
    })
  },
  inputPassword:function(e){
    this.setData({
      password:e.detail.value
    })
  },
  inputAgain:function(e){
    this.setData({
      surePassword:e.detail.value
    })
  },
  chooseSpirit:function(e){
    this.setData({
      spirit:e.detail.value
    })
  },
  getTest:function(e){
    var that = this;
    var type = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/
    var time = this.data.time
    this.setData({
      disabled:true,
      color:'#ccc'
    })

   if(type.test(this.data.phone)){
      wx.request({
        url: 'https://www.wyhweb.com/register/sendMessage',
        method: 'POST', //请求方式
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: {
          phone: this.data.phone
        },
        success: function (res) {

          that.setData({
            rightTest:res.data
          })
          var interval = setInterval(function (e) {
            time--;
            that.setData({
              text: time + 's',

            })
            if (time <= 0) {
              clearInterval(interval)
              that.setData({
                text: '重新发送',
                time: 60,
                disabled: false,
                color: '#f97676'
              })
            }
          }, 1000);
        }
      })
     }
     else{
       wx.showToast({
         title: '手机号格式错误',
         icon: 'none',
         duration: 1000
       })
       this.setData({
         disabled:false,
         color:'#f97676'
       })
     }
  },

  submit: function (e) {

    // var that = this;

    // var test = this.data.test
    // var rightTest = this.data.rightTest
    var username = this.data.username
    var password = this.data.password
    var surePassword = this.data.surePassword

    if (username == null || username == ''){
      wx.showToast({
        title: '用户名不能为空',
        icon: 'none',
        duration: 3000
      })
    }else if (password == null || password == ''){
      wx.showToast({
        title: '密码不能为空',
        icon: 'none',
        duration: 3000
      })
    }else if (password != surePassword){
      wx.showToast({
        title: '密码不一致',
        icon: 'none',
        duration: 3000
      })
    }

    wx.request({
      url: baseUrl + '/register/addUser', 
      //url:  'http://localhost:8080/register/addUser', 
      method:'post',
      data: {
        username: username,
        password: password
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success (res) {
        console.log(res)
        var data = res.data
        if (data.success){
          
          wx.redirectTo({
            url: '../login/login',
          })

          wx.showToast({
            title: '用户注册成功',
            icon: 'none',
            duration: 3000
          })
        }else{
          wx.showToast({
            title: data.message,
            icon: 'none',
            duration: 3000
          })
        }
        // wx.showToast({
        //   title: '服务器无响应',
        //   icon: 'none',
        //   duration: 3000
        // })
      },fail(res){
        wx.showToast({
          title: '服务器无响应',
          icon: 'none',
          duration: 3000
        })
      }
    })
    


    // var sex = this.data.sex
    // var sp = this.data.spirit
    // var id = this.data.id
    // var phone;
    // var password;
    // var sex;
    // var role;
    // var emotionalState;
    // var referrerPhone

    // if (test == '' || test != rightTest) {
    //   wx.showToast({
    //     title: '验证码错误',
    //     icon: 'none',
    //     duration: 1000
    //   })
    // }
    // if (username == ){

    // } else if (password != surePassword) {
    //   wx.showToast({
    //     title: '密码不一致',
    //     icon: 'none',
    //     duration: 1000
    //   })
    // }
    // else if (sex == '') {
    //   wx.showToast({
    //     title: '请选择性别',
    //     icon: 'none',
    //     duration: 1000
    //   })
    // }
    // else if (sp == '') {
    //   wx.showToast({
    //     title: '请选择感情状态',
    //     icon: 'none',
    //     duration: 1000
    //   })
    // } else {
    //   {
    //     if (id == 1) {
    //       that.setData({
    //         role: 'cupid',
    //         referrerPhone: ''
    //       })
    //     }
    //     else {
    //       that.setData({
    //         role: 'singleUser',
    //         referrerPhone: this.data.referrerPhone
    //       })
    //     }

    //     wx.request({
    //       url: 'https://www.wyhweb.com/register/addUser',
    //       method: 'POST', //请求方式
    //       header: {
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //       },
    //       data: {
    //         phone: that.data.phone,
    //         password: that.data.password,
    //         sex: that.data.sex,
    //         role: that.data.role,
    //         emotionalState: that.data.spirit,
    //         referrerPhone: ''
    //       },
    //       success: function (res) {
    //         console.log(res.data)
    //         if (res.data.registerStatus == 'error') {
    //           wx.showToast({
    //             title: '用户已注册',
    //             icon: 'none',
    //             duration: 1000
    //           })
    //         }
    //         else {
    //           wx.showToast({
    //             title: '注册成功',
    //             icon: 'success',
    //             duration: 1000
    //           })
    //           if (id == 1) {
    //             wx.navigateTo({
    //               url: '../message/message'
    //             })
    //           }
    //           else {
    //             wx.navigateTo({
    //               url: '../buy/buy'
    //             })
    //           }
    //         }
    //       }
    //     })
    //   }
    //}
  },

  onLoad: function (options) {
    // console.log(options.id)
    // if(options.id == 1){
    //   this.setData({
    //     hideItem:true,
    //     id:1,
    //     rigText:'《红娘合作协议》'
    //   })
    // }
    // else if(options.id == 2){
    //   this.setData({
    //     hideItem: false,
    //     id:2,
    //     rigText: '《单身合作协议》'
    //   })
    // }
  }
})