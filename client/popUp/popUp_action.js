Template.popUp_action.helpers({
  isDiceAction: function() {
    if (!APP.isInitialized()) {
      return;
    }
    var gameStatus = APP.gameStatus;
    if (gameStatus.isWaitUserDice() && gameStatus.isWaitLoginUser()) {
      return true;
    }
    return false;
  },
  isBuyAction: function() {
    if (!APP.isInitialized()) {
      return;
    }
    var gameStatus = APP.gameStatus;
    if (gameStatus.isWaitUserBuy() && gameStatus.isWaitLoginUser()) {
      return true;
    }
    return false;
  },
  isBuildAction: function() {
    if (!APP.isInitialized()) {
      return;
    }
    var gameStatus = APP.gameStatus;
    if (gameStatus.isWaitUserBuild() && gameStatus.isWaitLoginUser()) {
      return true;
    }
    return false;
  },
  costMoney: function() {
    if (!APP.isInitialized()) {
      return;
    }
    var gameStatus = APP.gameStatus;
    if (gameStatus.isWaitLoginUser()) {
      return gameStatus.getCurrentPlayer().getPosition().getPrice();
    }
    return false;
  },
  landMarkName: function() {
    if (!APP.isInitialized()) {
      return;
    }
    var gameStatus = APP.gameStatus;
    if (gameStatus.isWaitLoginUser()) {
      return gameStatus.getCurrentPlayer().getPosition().getName();
    }
    return false;
  },
  leftTime: function() {
    if (!APP.isInitialized()) {
      return;
    }
    var gameStatus = APP.gameStatus;
    var leftTime = gameStatus.getExecuteLeftTime();
    return leftTime > 0 ? leftTime : 0;
  }
});

Template.popUp_action.events({
  'click [data-action="roll"]': function(e) {
    Meteor.call('rollADice');
  },
  'click [data-action="agree"]': function(e) {
    var gameStatus = APP.gameStatus;
    if (gameStatus.isWaitUserBuy()) {
      Meteor.call('buyLandMark', true);
    }
    else {
      Meteor.call('buildHouse', true);
    }
  },
  'click [data-action="refuse"]': function(e) {
    var gameStatus = APP.gameStatus;
    if (gameStatus.isWaitUserBuy()) {
      Meteor.call('buyLandMark', false);
    }
    else {
      Meteor.call('buildHouse', false);
    }
  }
});