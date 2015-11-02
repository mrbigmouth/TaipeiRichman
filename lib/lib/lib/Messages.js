/**
 * 遊戲訊息物件
 * @typedef {Object} Message~message
 * @property {String} _id 主鍵
 * @property {Number} type 訊息類別
 *                         0: 系統訊息
 *                         1: 擲骰訊息
 *                         2: 購地訊息
 *                         3: 建房訊息
 *                         4: 支付訊息
 *                         5: 破產訊息
 *                         6: 聊天訊息
 *                         7: 車禍訊息
 *                         8: 住院訊息
 * @property {?String} userId 發言人，系統訊息時為null
 * @property {?Number} playerSort 與訊息有關的玩家的排序
 * @property {?Number} landMarkSort 與訊息有關的地標的排序
 * @property {?Number} ownerSort 與訊息有關的地標擁有者的排序
 * @property {Date} time 訊息產生時間
 * @property {String|Number|Boolean} content 訊息內容/擲骰結果/購地建房結果
 *                                           購地建房結果為1時代表成功、0代表拒絕、false代表無法進行購地建房
 */
Message = function Message(data) {
  _.extend(this, data);
  return this;
};
//取得格式化的時間
Message.prototype.getFormatTime = function() {
  var time = this.time;
  return time.getFullYear() + '/' + paddingZero(time.getMonth() + 1) + '/' + paddingZero(time.getDate()) + ' ' + 
    paddingZero(time.getHours()) + ':' + paddingZero(time.getMinutes()) + ':' + paddingZero(time.getSeconds());
};
//用來替數字補零的函式
function paddingZero(i) {
  if (i < 10) {
    return '0' + i;
  }
  else {
    return '' + i;
  }
}
//取得與訊息有關的玩家的名稱
Message.prototype.getPlayerName = function() {
  var player = APP.db.player.getBySort( this.playerSort );
  return player.getDisplayName();
};
//取得與訊息有關的地標的名稱
Message.prototype.getLandMarkName = function() {
  var landMark = APP.db.landMark.getBySort( this.landMarkSort );
  return landMark.getName();
};
//取得與訊息有關的地標擁有者的名稱
Message.prototype.getOwnerName = function() {
  var owner = APP.db.player.getBySort( this.ownerSort );
  return owner.getDisplayName();
};
//取得訊息主體內容
Message.prototype.getContent = function() {
  return this.content;
};
Message.prototype.getMoneyContent = function() {
  return '$ ' + this.content.toLocaleString();
};
//判斷是否為系統訊息
Message.prototype.isSystemMessage = function() {
  return (this.type === 0);
};
//判斷是否為擲骰訊息
Message.prototype.isDiceMessage = function() {
  return (this.type === 1);
};
//判斷是否為購地訊息
Message.prototype.isBuyMessage = function() {
  return (this.type === 2);
};
//判斷是否為建房訊息
Message.prototype.isBuildMessage = function() {
  return (this.type === 3);
};
//判斷是否為支付訊息
Message.prototype.isPayMessage = function() {
  return (this.type === 4);
};
//判斷是否為聊天訊息
Message.prototype.isBankruptcyMessage = function() {
  return (this.type === 5);
};
//判斷是否為聊天訊息
Message.prototype.isChatMessage = function() {
  return (this.type === 6);
};
//判斷是否為車禍訊息
Message.prototype.isCarAccidentMessage = function() {
  return (this.type === 7);
};
//判斷是否為住院訊息
Message.prototype.isHospitalMessage = function() {
  return (this.type === 8);
};
//判斷是否購地/建房成功
Message.prototype.isAgree = function() {
  return (this.content === 1);
};
//判斷是否拒絕購地/建房
Message.prototype.isRefuse = function() {
  return (this.content === 0);
};
//判斷是否無法購地/建房
Message.prototype.isFail = function() {
  return (this.content === false);
};