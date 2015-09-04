//視地標的最新擁有者、房子層數狀態，在google地圖上設定地標、建造房子
Tracker.autorun(function() {
  //只有APP已啟動時才會繼續執行
  if (!APP.isInitialized()) {
    return;
  }

  _.each(CONFIG.landMarkList, function(v, k) {
    var sort = k + 1;
    Tracker.autorun(function() {
      APP.db.landMark.getBySort(sort).setOnMap().setHouseOnMap();
    });
  });
});

//視玩家狀態，在google地圖上放置、移動玩家標誌
Tracker.autorun(function() {
  //只有APP已啟動時才會繼續執行
  if (!APP.isInitialized()) {
    return;
  }

  APP.db.player.getAll().forEach(function(player) {
    player.setOnMap();
  });
});