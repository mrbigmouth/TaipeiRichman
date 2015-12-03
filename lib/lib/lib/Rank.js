/**
 * 排行榜紀錄物件
 * @typedef {Object} Rank~rank
 * @property {String} _id 主鍵，為userId
 * @property {?Number} sort 排序，預設為null，只有資料到達使用者端的時候才會根據訂閱的頁碼自動計算、設定
 * @property {Number} victory 玩家勝利次數
 * @property {Number} wealth 玩家總財富
 */
Rank = function Rank(data) {
  _.extend(this, data);
  return this;
};
//取得排序
Rank.prototype.getSort = function() {
  return this.sort;
};
//取得玩家id
Rank.prototype.getUserId = function() {
  return this._id;
};
//判斷是否就是當前登入的玩家id
Rank.prototype.isLoginUser = function() {
  return (this.getUserId() === Meteor.userId())
};
//取得勝利次數
Rank.prototype.getVictory = function() {
  return this.victory;
};
//取得總財富
Rank.prototype.getTotalWealth = function() {
  return this.wealth;
};
//取得平均財富
Rank.prototype.getAverageWealth = function() {
  return this.victory ? Math.round(this.wealth / this.victory) : '--';
};
//設定排序
Rank.prototype.setSort = function(sort) {
  this.sort = sort;
  return this;
};