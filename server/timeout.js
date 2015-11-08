//根據遊戲狀態，檢查使用者動作時間是否已經超時
function checkLeftTime() {
  var gameStatus = APP.gameStatus;
  //如果遊戲已開始
  if (gameStatus.isGameStart()) {
    //如果正在等待某為登入玩家的擲骰或購地
    if (gameStatus.isWaitUserDice() || gameStatus.isWaitUserBuy() || gameStatus.isWaitUserBuild()) {
      //計算最新的等待剩餘時間
      gameStatus.setLeftTime();
      //若已無等待剩餘時間，則自動執行動作
      if (gameStatus.getExecuteLeftTime() <= 0) {
        if (gameStatus.isWaitUserDice()) {
          Meteor.call('rollADice');
        }
        else if (gameStatus.isWaitUserBuy()) {
          Meteor.call('buyLandMark', true);
        }
        else if (gameStatus.isWaitUserBuild()) {
          Meteor.call('buildHouse', true);
        }
      }
    }
  }
}

//每秒執行檢查
Meteor.setInterval(checkLeftTime, 1000);