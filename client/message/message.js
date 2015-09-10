//預設不篩選訊息
Session.setDefault('isFilterMessage', false);

Template.message.helpers({
  //判斷使用者是否能夠進行聊天
  userCanChat: function() {
    return (!!Meteor.userId()) ? true : false;
  },
  //取得全部訊息
  messageList: function() {
    if (Session.get('isFilterMessage')) {
      return APP.db.message.getAllImportantOrderByTime();
    }
    else {
      return APP.db.message.getAllOrderByTime();
    }
  },
  //若為玩家聊天訊息，以不同的背景色突顯
  applyMessageBackground: function() {
    if (this.isChatMessage()) {
      return 'background:#999999;';
    }
  }
});

Template.message.events({
  //點擊篩選訊息按鈕時，切換isFilterMessage的設定值
  'click button.toggleFilter': function() {
    Session.set('isFilterMessage', !Session.get('isFilterMessage') );
  }
});

Template.message_chat.events({
  'submit': function(e, ins) {
    var form = ins.firstNode;
    //取得聊天輸入框
    var message = form.message;
    if (message.value) {
      //呼叫新增聊天訊息的method
      Meteor.call('chat', message.value);
      //將聊天輸入框清空
      message.value = '';
    }
    //防止表單預設的submit執行動作
    e.preventDefault();
  }
});