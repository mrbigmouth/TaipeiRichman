//預設的彈跳視窗狀態
Session.setDefault('popUpState', {
  open: true,
  content: ''
});

Template.popUp.helpers({
  isHide: function() {
    return (Session.get('popUpState').open ? '' : 'hide');
  },
  players: function() {
    return APP.db.player.find({}, {sort: {sort: 1}});
  },
  isUserPlayer: function() {
    return APP.isLoginUserInGame();
  }
});
Template.popUp.events({
  'click .close': function() {
    var popUpState = Session.get('popUpState');
    Session.set('popUpState', false);
  },
  'click button[data-action="join"]': function() {
    Meteor.call('playerJoinGame');
  },
  'click button[data-action="exit"]': function() {
    Meteor.call('playerExitGame');
  },
  'click button[data-action="loginIn"]': function() {
    Meteor.loginWithFacebook();
  },
  'click button[data-action="loginOut"]': function() {
    Meteor.logout();
  }
});