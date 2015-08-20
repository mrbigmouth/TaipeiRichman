//在創建模板時訂閱使用者暱稱資料
Template.getUserName.onCreated(function() {
  //若尚未訂閱此玩家資料，則訂閱之
  if (!Meteor.users.findOne(this.data.userId)) {
    this.loadAction = Meteor.subscribe('userName', this.data.userId);
  }
});
//顯示使用者暱稱資料
Template.getUserName.helpers({
  getUserName: function() {
    var instance = Template.instance();
    var user;
    if (!instance.loadAction || instance.loadAction.ready()) {
      user = Meteor.users.findOne(this.userId);
      if (user && user.profile) {
        return '玩家' + user.profile.name;
      }
      return '玩家???';
    }
    else {
      return '(載入中...)';
    }
  }
});