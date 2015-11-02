//重新初始化當前地標資料
APP.db.landMark.initialize();
//重新初始化當前玩家資料
APP.db.player.initialize();
//重新初始化遊戲訊息資料
APP.db.message.initialize();
//將APP啟動狀態設為已啟動
APP.initialized.set(true);