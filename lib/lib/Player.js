/**
 * 玩家物件
 * @class Player
 * @property {String} _id 主鍵
 * @property {Number} sort 玩家排序，從1起始
 * @property {?String} userId 玩家id，若為電腦玩家，則為null
 * @property {Number} money 玩家當前現金量
 */
Player = function Player(data) {
  _.extend(this, data);
  return this;
};
//判斷此玩家是否為電腦玩家
Player.prototype.isComputer = function() {
  if (! this.userId) {
    return true;
  }
  else {
    return false;
  }
};
//取得玩家顯示名稱
Player.prototype.getDisplayName = function() {
  //當此玩家為電腦時
  if (this.isComputer()) {
    return '電腦' + this.sort;
  }
  //若為玩家時，使用getUserName模板來訂閱玩家資料並顯示模板render結果
  else {
    return Blaze.toHTMLWithData(Template.getUserName, {userId: this.userId});
  }
};
//依照玩家順序，回傳代表顏色
Player.prototype.getColorStyle = function() {
  return 'color:' + CONFIG.playerColor[ this.sort - 1 ] + ';';
};
//取得玩家當前金錢
Player.prototype.getMoney = function() {
  return '$ ' + this.money.toLocaleString();
};