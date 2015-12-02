Template.popUp_game.onRendered(function() {
  var instance = this;
  $.ajax({
    cache: true,
    dataType: 'script',
    url: '//connect.facebook.net/zh_TW/sdk.js',
    success: function() {
      FB.init({
        appId: '574979869307650',
        version: 'v2.3'
      });
      FB.getLoginStatus();
      FB.XFBML.parse( instance.firstNode );
    }
  });
});

Template.popUp_game.helpers({
  gameAWaiting: function() {
    if (! APP.isInitialized()) {
      return false;
    }
    return APP.gameStatus.isGameAWaiting();
  },
  players: function() {
    return APP.db.player.getAllOrderBySort();
  },
  isUserPlayer: function() {
    return APP.isLoginUserInGame();
  }
});
Template.popUp_game.events({
  'click button[data-action="join"]': function() {
    Meteor.call('playerJoinGame');
  },
  'click button[data-action="exit"]': function() {
    Meteor.call('playerExitGame');
  },
  'click button[data-action="start"]': function() {
    Meteor.call('startGame');
  },
  'click button[data-action="loginIn"]': function() {
    Meteor.loginWithFacebook();
  },
  'click button[data-action="restart"]': function() {
    Meteor.call('restart');
  },
});