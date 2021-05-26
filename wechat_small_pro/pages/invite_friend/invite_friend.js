//index.js
//获取应用实例
var app = getApp()
var baseUrl = app.globalData.host;
var util = require('../../utils/util.js');
function initVak() {
  let arr = [];
  for (let i = 0; i < 255; i++) {
    arr.push('empty')
  }
  console.log('init', arr)
  return arr;
}
var Pi = Page({
  data: {
    setInter:'',  //存储计时器
    chess_finish:false,
    gameUser1:'',
    gameUser1Img:'/assets/images/pic45.png',
    gameUser1Hiddenflg:false,
    gameUser2:'',
    gameUser2Img:'/assets/images/pic45.png',
    gameUser2Hiddenflg:true,
    userNum:-1,
    room:'正在创建',
    modalHiddenFlg:false,
    jiazaiHiddenFlg:false,
    stepFlg:false,    //是否可以下棋
    socketStatus: 'closed',
    logs: [],
    vak: initVak(),
    he: 0,
    result: "",
    toUserName:'',
    userName:'',
    userImg: '/assets/images/pic45.png',

    userInfo: {},
    hasUserInfo: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    jscode:'',
    weChatLoginRequest:{
      jscode:'',
      nickName:'',
      avatarUrl:null,
      gender:null,
      language:'',
      country:'',
      province:'',
      city:''
    }
  },
  count: 0,
  vec: [
    [1, 0],
    [0, 1],
    [1, 1],
    [-1, 1]
  ],
  /*********************************web socket******************************/ 
  openSocket() {
    var that = this
   //打开时的动作
   wx.onSocketOpen(() => {
    console.log('WebSocket 已连接')
    that.data.socketStatus = 'connected';
    //that.sendMessage();
   })
   //断开时的动作
   wx.onSocketClose(() => {
    console.log('WebSocket 已断开')
    that.data.socketStatus = 'closed'
    
   })
   //报错时的动作
   wx.onSocketError(error => {
    console.error('socket error:', error)
   })
   // 监听服务器推送的消息
   wx.onSocketMessage(message => {
    //把JSONStr转为JSON
    message = message.data.replace(" ", "");
    if (typeof message != 'object') {                          
       message = message.replace(/\ufeff/g, ""); //重点  
    }
    message = JSON.parse(message)
    // console.log('设置toUserName')
    // var userNameTemp = wx.getStorageSync("userName")
    // console.log(userNameTemp)
    // console.log(message.toUserName)
    // wx.setStorageSync('toUserName', userNameTemp!=message.toUserName?message.toUserName:message.userName)
    // this.setData({
    //   toUserName:wx.getStorageSync('toUserName')
    // })
    console.log('message:'+JSON.stringify(message))
    if (message.socketStatus == 'Connected'){
      console.log('socket连接成功')
      //心跳包，防止连接自动断开，每40秒发送一次心跳包
      that.data.setInter = setInterval(() => {
        console.log('心跳包发送')
        //let m = {'userName':wx.getStorageSync('userName'),'alive':'true'}
        this.sendHeart()
      }, 40000);
    }else{
      console.log('message=================:'+JSON.stringify(message))
      wx.setStorageSync('message', message)
      
      console.log("【websocket监听到消息】内容如下：" + JSON.stringify(message));
      //更新棋盘
      console.log(message)
      //console.log(message.message.vak)
      //更新棋盘
      if (message != undefined && message.vak!=undefined){
        this.setData({
          vak: message.vak,
        })
        this.count=message.count
        this.judge(message.pos)
      }
      //更新房间人数
      if (message.userNum != null && message.userNum != undefined && message.userNum != ''){
        this.setData({
          roomUsersTotal:message.roomUsersTotal
        })
        if(message.roomUsersTotal == 2){
          this.setData({
            gameUser2Hiddenflg:false
          })
        }
      }
      console.log('message消息:' + JSON.stringify(message))
      if (message.curStepUser === wx.getStorageSync('userName')){     
        //当下是自己落子
        this.data.stepFlg = true
        message.vak = this.data.vak
      }else{    //发送给对手落子信息
        this.data.stepFlg = false
        message.vak = this.data.vak
        this.sendMessage(message)
      }
    }
    
    
    //this.judge(message.message.pos);
   })
   // 打开信道
   wx.connectSocket({
    url: encodeURI(app.globalData.wsApi + '/five/invite?token=' + wx.getStorageSync("token")),
   })
   },
  //关闭信道
   closeSocket() {
     var that = this
     
    if (that.data.socketStatus === 'connected') {
      wx.closeSocket({
        success: () => {
        //that.globalData.socketStatus = 'closed'
        that.data.socketStatus = 'closed'
        }
      })
    }
   },

   sendHeart(){
    if (this.data.socketStatus === 'connected') {
      //自定义的发给后台识别的参数
        let sendData = {'userName':wx.getStorageSync('userName'),'alive':'true'}
        wx.sendSocketMessage({
          //data: mess
          data:JSON.stringify(sendData)
        })
      }
   },

   endSetInter: function(){
    var that = this;
    //清除计时器  即清除setInter
    clearInterval(that.data.setInter)
   },

   //发送消息函数
   sendMessage(e) {
     let that = this
     let message = '';
     if (e != null && e != ''){
      message = e
      console.log('sendMessage1:'+message)
      message['fromUserName'] = wx.getStorageSync('userName')
      console.log('sendMessage2:'+message)
     }
     //message.toUserName = wx.getStorageSync("toUserName")
    if (that.data.socketStatus === 'connected') {
      wx.request({
        url: baseUrl+'/five/pushAll', 
        data: {
          message: JSON.stringify(message),
        },
        method: 'post',
        header: {
            'content-type': 'application/x-www-form-urlencoded', // 默认值
            'Authorization': wx.getStorageSync('token')
        },
        success: function(res) {
          if (res.data.success == true){
            console.log('广播已发送')
          }  
        },fail(res){
          wx.redirectTo({
            url: '../login/login',
          })
          wx.showToast({
            title: '服务器网络异常',
            icon:'none',
            duration:4000
          })
        }
      })

    //自定义的发给后台识别的参数
    //console.log('==============================toUserName:'+wx.getStorageSync("toUserName")) 
      // var sendData = {  
      //   "toUserName":wx.getStorageSync("toUserName"),
      //   "message":message
      // }
      // wx.sendSocketMessage({
      //   //data: mess
      //   data:JSON.stringify(sendData)
      // })
    }
   },

  ///////////


  step(event) {
    var message = wx.getStorageSync('message')
    //禁止落子
    if (!this.data.stepFlg || this.chess_finish){
      return;                              
    }
    var pos = event.currentTarget.dataset.pos;
    if (this.data.vak[pos] == "white" || this.data.vak[pos] == "black") return;
    this.count++;
    if (this.count % 2 != 0) {
      this.data.vak[pos] = "black";
    }
    else {
      this.data.vak[pos] = "white";
    }
    console.log('data.vak', this.data.vak)
    message.vak = this.data.vak
    message.count = this.count
    message.pos = pos
    message.curStepUser =  (message.gameUser1==wx.getStorageSync('userName')?message.gameUser2:message.gameUser1) //轮到对手下
    this.sendMessage(message)    //发送棋盘信息
    this.data.stepFlg = false
    this.setData({
      vak: this.data.vak
    })
    this.judge(pos);
  },
  restart () {
    console.log('restart===============')
    this.setData({
      logs: [],
      //vak: initVak(),
      he: 0,
      result: "",
      socketStatus: 'connected',
      stepFlg:false,    //是否可以下棋
      chess_finish:true
    });
    this.count = 0;
    this.vec= [
      [1, 0],
      [0, 1],
      [1, 1],
      [-1, 1]
    ]
    var that = this;
    //wx.setStorageSync('toUserName', '')
    //wx.setStorageSync('message', '')

    // wx.redirectTo({
    //   url: './index',
    // })
    
    //that.closeSocket();
    //that.openSocket();
    // if (that.data.socketStatus === 'closed') {
    //   that.openSocket();
    //   console.log('socket onLoad')
    // }
  },

  quit(){
    this.closeSocket()
    wx.switchTab({
      url: '../game_select/game_select',
    })

  },
  judge(pos) {
    var that = this
    var color = this.data.vak[pos];
    var x0 = parseInt(pos / 15), y0 = pos % 15, x, y, round;
    for (var i = 0; i < 4; i++) {
      var five = 0;
      round = 0;
      for (x = x0, y = y0; round < 5; x += this.vec[i][0], y += this.vec[i][1], round++) {
        if (this.data.vak[15 * x + y] == color) {
          five++;
        }
        else {
          break;
        }
      }
      round = 0;
      for (x = x0, y = y0; round < 5; x -= this.vec[i][0], y -= this.vec[i][1], round++) {
        if (this.data.vak[15 * x + y] == color) {
          five++;
        }
        else {
          break;
        }
      }
      var rstr = color + "win";
      if (five >= 6) {
        this.setData({
          result: rstr
        });
        wx.showModal({
          title: color + '获胜',
          content: '棋局结束',
          success: function (res) {
            // if (res.confirm) {
              
            // }
            that.restart()
          }
        })
      }
    }
  },

  createRoom(){
    let userName = wx.getStorageSync('userName')
    let that = this
    wx.request({
      url: baseUrl+'/five/createRoom', 
      data: {
         username: userName,
      },
      method: 'post',
      header: {
          'content-type': 'application/x-www-form-urlencoded', // 默认值
          'Authorization': wx.getStorageSync('token')
      },
      success: function(res) {
        if (res.data.success == true){
          that.setData({
            room: res.data.data.room,
            jiazaiHiddenFlg:true,
            gameUser1:userName,
            gameUser1Img:wx.getStorageSync('avatarUrl')==null?'/assets/images/pic45.png':wx.getStorageSync('avatarUrl')
          })
        } 
        console.log('room:'+that.data.room+"创建成功") 
      },fail(res){
        wx.redirectTo({
          url: '../login/login',
        })
        wx.showToast({
          title: '服务器网络异常',
          icon:'none',
          duration:4000
        })
      }
    })
  },

  joinRoom(){
    let userName = wx.getStorageSync('userName')
    let that = this
    //未登录情况
    if (userName == null || userName == ''){
      this.setData({
        hasUserInfo:false
      })
      return
    }
    if (that.data.socketStatus === 'closed') {
      that.openSocket();
      console.log('socket onLoad')
    }

    wx.request({
      url: baseUrl+'/five/joinRoom', 
      data: {
         username: userName,
         room: that.data.room
      },
      method: 'post',
      header: {
          'content-type': 'application/x-www-form-urlencoded', // 默认值
          'Authorization': wx.getStorageSync('token')
      },
      success: function(res) {
        if (res.data.success == true){
          console.log('房间'+that.data.room+' 加入成功')
          that.setData({
            userNum:res.data.data.userNum,
            gameUser2Hiddenflg:false
          })
        }else{
          console.log('房间加入失败')
          wx.switchTab({
            url: '../game_select/game_select',
          })
          wx.showModal({
            title: '房间加入失败',
            content: res.data.data,
            success: function (res) {
              wx.switchTab({
                url: '../game_select/game_select',
              })
            }
          })
        }  
      },fail(res){
        wx.redirectTo({
          url: '../login/login',
        })
        wx.showToast({
          title: '服务器网络异常',
          icon:'none',
          duration:4000
        })
      }
    })
  },

  onLoad(options) {
    //通过websocket连接服务器
    var that = this;
    
    let invited_room = options.room;
    //判断是自己创建还是被邀请来的
    if (invited_room != null && invited_room != ''){
      this.setData({
        modalHiddenFlg:true,
        room:invited_room
      })
      this.joinRoom()
    }else{
      if (that.data.socketStatus === 'closed') {
        that.openSocket();
        console.log('socket onLoad')
      }
      this.createRoom();
    }
    ///////////////////////////
    // let avatarUrl = wx.getStorageSync('avatarUrl')
    // if (avatarUrl == null || avatarUrl == undefined || avatarUrl == ''){
    //   avatarUrl = '/assets/images/pic45.png'
    // }
    // this.setData({
    //   userName:wx.getStorageSync('userName'),
    //   userImg:avatarUrl,
    //   logs: (wx.getStorageSync('logs') || []).map(function (log) {
    //     return util.formatTime(new Date(log))
    //   })
    // })

    console.log('onLoad')
    
      //初始化棋盘
      // this.fiveStone = new FiveStone(15, 0.9);
      // this.fiveStone.setWinCallback(winCallback);
      // //这里不使用refreshFiveStone的原因是因为这里是初始化，区别出后面的刷新
      // this.setData({
      //   'fiveStone':this.fiveStone
      // });

    this.loc = null;

      //var that = this;
      //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
        //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
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
      this.closeSocket()
      
    },

    modalConfirm: function(){
      this.setData({
        modalHiddenFlg:true,
        //jiazaiHiddenFlg:true,
        //room:'1234'
      })
    },

    modalCandel: function(){
      wx.switchTab({
        url: '../game_select/game_select',
      })
      this.closeSocket()
    },

      /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (res) {
      let that = this
      if (res.from === 'button') {
        // 来自页面内转发按钮
      }
      return {
        title: "好友对战",
        path: 'pages/invite_friend/invite_friend?room=' + that.data.room
      }
    },

    

    getUserInfo: function(e) {
      let data = JSON.parse(e.detail.rawData)
      let that = this
      console.log('data:' + data)
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        // hasUserInfo: false
      })
      let request = that.data.weChatLoginRequest
      console.log(data.nickName)
      request.nickName=data.nickName
      request.avatarUrl=data.avatarUrl
      request.gender=data.gender
      request.language=data.language
      request.country=data.country
      request.province=data.province
      request.city=data.city
      wx.login({
        complete: (res) => {
            request.jscode=res.code
            console.log(request)
            wx.request({
              url: baseUrl+'/auth/weChatLogin', 
              data: {
                  jscode:request.jscode,
                  nickName:request.nickName,
                  avatarUrl:request.avatarUrl,
                  gender:request.gender,
                  language:request.language,
                  country:request.country,
                  province:request.province,
                  city:request.city
              },
              method: 'post',
              header: {
                  "Content-Type":"application/x-www-form-urlencoded" // 默认值
              },
              success: function(res) {
                  var status = res.data.success
                  console.log(res)
                  //登陆成功
                  if (status){
                      wx.setStorageSync('token',res.data.data.token)
                      wx.setStorageSync('userName', res.data.data.userInfo.nickName)
                      wx.setStorageSync('avatarUrl', res.data.data.userInfo.avatarUrl)
                      
                      that.setData({
                        hasUserInfo:true
                      })
                      console.log(request)
                      console.log(wx.getStorageSync("token"))
                      // wx.redirectTo({     ////跳转到首页
                      //   url: '../index/index',
                      // })
                      // wx.switchTab({
                      //   url: '../game_select/game_select',
                      // })
                      that.joinRoom()
                  }else{
                      wx.showToast({
                          title: '授权失败',
                          icon:'none',
                          duration:4000
                      })
                  }
              }
            })
        },
      })
    }
})
