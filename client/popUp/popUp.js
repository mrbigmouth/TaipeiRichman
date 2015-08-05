//預設的彈跳視窗狀態
Session.setDefault('popUpState', {
  open: true,
  content: ''
});

Template.popUp.helpers({
  //判斷popUp是否應隱藏
  isHide: function() {
    return (Session.get('popUpState').open ? '' : 'hide');
  },
  //取得當前玩家資料
  players: function() {
    return APP.db.player.find({}, {sort: {sort: 1}});
  },
  //判斷當前使用者是否為已登入的玩家
  isUserPlayer: function() {
    return APP.isLoginUserInGame();
  }
});
Template.popUp.events({
  //當使用者點擊關閉按鈕時
  'click .close': function() {
    var popUpState = Session.get('popUpState');
    Session.set('popUpState', false);
  },
  //當使用者點擊加入遊戲時
  'click button[data-action="join"]': function() {
    Meteor.call('playerJoinGame');
  },
  //當使用者點擊離開遊戲時
  'click button[data-action="exit"]': function() {
    Meteor.call('playerExitGame');
  },
  //當使用者點擊Facebook登入時
  'click button[data-action="loginIn"]': function() {
    Meteor.loginWithFacebook();
  },
  //當使用者點擊Facebook登出時
  'click button[data-action="loginOut"]': function() {
    if (APP.isLoginUserInGame()) {
      Meteor.call('playerExitGame');
    }
    Meteor.logout();
  }
});