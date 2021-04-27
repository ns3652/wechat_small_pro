//index.js
//获取应用实例
var app = getApp()
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
    stepFlg:false,    //是否可以下棋
    socketStatus: 'closed',
    logs: [],
    vak: initVak(),
    he: 0,
    result: "",
    toUserName:'',
    userName:''
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
       //var jj = JSON.parse(message);
       // jj = message
       // message = jj;     
    }
    message = JSON.parse(message)
    //wx.setStorageSync('userName', message.toUserName)
    // if (wx.getStorageSync('toUserName') == null || wx.getStorageSync('toUserName') == ''||
    // wx.getStorageSync('toUserName') == undefined){
      
    // }
    console.log('设置toUserName')
    var userNameTemp = wx.getStorageSync("userName")
    console.log(userNameTemp)
    console.log(message.toUserName)
    wx.setStorageSync('toUserName', userNameTemp!=message.toUserName?message.toUserName:message.userName)
    this.setData({
      toUserName:wx.getStorageSync('toUserName')
    })
    console.log('message=================:'+JSON.stringify(message))
    console.log('toUserName==============:' + wx.getStorageSync('toUserName'))
    wx.setStorageSync('message', message)
    // if (){

    // }
    console.log("【websocket监听到消息】内容如下：" + JSON.stringify(message));
    //更新棋盘
    console.log(message)
    console.log(message.message.vak)
    if (message.message.vak!=undefined){
      this.setData({
        vak: message.message.vak,
      })
      this.count=message.message.count
      this.judge(message.message.pos)
    }
    console.log('message:' + JSON.stringify(message))
    if (message.message.curStepUser === wx.getStorageSync('userName')){     
      //当下是自己落子
      this.data.stepFlg = true
      message.message.vak = this.data.vak
    }else{    //发送给对手落子信息
      this.data.stepFlg = false
      message.message.vak = this.data.vak
      this.sendMessage(message)
    }
    
    //this.judge(message.message.pos);
   })
   // 打开信道
   wx.connectSocket({
    url: encodeURI(app.globalData.wsApi + '/imserver?token=' + wx.getStorageSync("token")),
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
   //发送消息函数
   sendMessage(e) {
     var that = this
     var message = '';
     if (e != null && e != ''){
      message = e.message
     }
     //message.toUserName = wx.getStorageSync("toUserName")
    if (that.data.socketStatus === 'connected') {
    //自定义的发给后台识别的参数
    console.log('==============================toUserName:'+wx.getStorageSync("toUserName")) 
      var sendData = {  
        "toUserName":wx.getStorageSync("toUserName"),
        "message":message
      }
      wx.sendSocketMessage({
        //data: mess
        data:JSON.stringify(sendData)
      })
    }
   },

  ///////////


  step(event) {
    var message = wx.getStorageSync('message')
    //禁止落子
    if (!this.data.stepFlg){
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
    message.message.vak = this.data.vak
    message.message.count = this.count
    message.message.pos = pos
    message.message.curStepUser = wx.getStorageSync("toUserName")   //轮到对手下
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
      vak: initVak(),
      he: 0,
      result: "",
      socketStatus: 'connected',
      //stepFlg:false,    //是否可以下棋
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
    wx.redirectTo({
      url: '../login/login',
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
          content: '再来一局',
          success: function (res) {
            if (res.confirm) {
              // wx.navigateTo({
              //   url: "./index"
              // });
              that.restart()
            }
          }
        })
      }
    }
  },
  onLoad () {
    this.setData({
      userName:wx.getStorageSync('userName'),
      logs: (wx.getStorageSync('logs') || []).map(function (log) {
        return util.formatTime(new Date(log))
      })
    })

    console.log('onLoad')
      var that = this;
      if (that.data.socketStatus === 'closed') {
        that.openSocket();
        console.log('socket onLoad')
      }
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
  }
})
