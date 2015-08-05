//清空當前玩家資料
APP.db.player.remove({});
_.each(_.range(CONFIG.playerNumbers), function(sort) {
  var player = _.clone(CONFIG.defaultPlayer);
  player.sort = sort + 1;
  player.userId = null;
  APP.db.player.insert(player);
});