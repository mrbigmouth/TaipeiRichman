//預設的彈跳視窗狀態
Session.setDefault('popUpState', {
  open: false,
  content: ''
});

Template.popUp.helpers({
  popUpState: function() {
    return Session.get('popUpState');
  },
  //判斷當前popUpState要顯示的內容
  getTemplate: function() {
    return 'popUp_' + this.content;
  }
});

Template.popUp.events({
  //關閉視窗
  'click .close': function() {
    Session.set('popUpState', {
      open: false,
      content: ''
    });
  }
});