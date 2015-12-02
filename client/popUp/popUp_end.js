Template.popUp_end.helpers({
  winnerId: function() {
    if (!APP.isInitialized()) {
      return;
    }
    return APP.gameStatus.getLastGameWinner();
  }
});
Template.popUp_end.events({
  'click button': function() {
    Session.set('popUpState', {
      open: true,
      content: 'game'
    });
  }
});