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
//判斷此玩家是否為當前登入使用者
Player.prototype.isLoginUser = function() {
  if (this.userId && this.userId === Meteor.userId()) {
    return true;
  }
  else {
    return false;
  }
};
//取得玩家顯示名稱
Player.prototype.getDisplayName = function() {
  var user;
  //當此玩家為電腦時
  if (this.isComputer()) {
    return '電腦' + this.sort;
  }
  //若為玩家時
  else {
    //在前端，使用getUserName模板來訂閱玩家資料並顯示模板render結果
    if (Meteor.isClient) {
      return Blaze.toHTMLWithData(Template.getUserName, {userId: this.userId});
    }
    //在後端，直接從資料庫取值
    else {
      user = Meteor.users.findOne(this.userId);
      if (user) {
        return user.profile.name;
      }
      else {
        return '';
      }
    }
  }
};
//若玩家並非電腦，則回傳使用者id
Player.prototype.getUserId = function() {
  if (this.isComputer()) {
    return null;
  }
  else {
    return this.userId;
  }
};
//依照玩家順序，回傳代表顏色
Player.prototype.getColor = function() {
  return CONFIG.playerColor[ this.sort - 1 ];
};
//依照玩家順序，回傳代表顏色的style設定
Player.prototype.getColorStyle = function() {
  return 'color:' + this.getColor() + ';';
};
//取得玩家當前金錢
Player.prototype.getMoney = function() {
  return '$ ' + this.money.toLocaleString();
};

//判斷此玩家是否擁有指定地標
Player.prototype.isOwner = function(landMark) {
  return (this.sort === landMark.owner);
};
//判斷此玩家是否住院中
Player.prototype.isInHospital = function() {
  return (this.inHospitalRound > 0);
};
//判斷此玩家是否已破產
Player.prototype.isBankruptcy = function() {
  return (this.money < 0);
};
//判斷此玩家是否擁有足夠的金錢投資目標地標
Player.prototype.canBuy = function(landMark) {
  return (this.money >= landMark.price);
};
//取得在此玩家之後的下一位動作的玩家
Player.prototype.getNextPlayer = function() {
  var nextPlayerSort = this.sort + 1;
  nextPlayerSort = nextPlayerSort > CONFIG.playerNumbers ? 1 : nextPlayerSort;
  return APP.db.player.getBySort(nextPlayerSort);
};
//取得當前玩家所在的地標
Player.prototype.getPosition = function() {
  //獲得當前位置的landMark
  return APP.db.landMark.getBySort(this.position);
};
//取得當前玩家所在位置在前進N步以後的所在地標
Player.prototype.getNextPosition = function(step) {
  //獲得地標總數
  var nextPosition = this.position + step;
  var maxLandMarkSort = APP.db.landMark.getAll().count();
  if (nextPosition > maxLandMarkSort) {
    nextPosition = nextPosition % maxLandMarkSort;
  }
  var result = APP.db.landMark.getBySort(nextPosition);
  return result;
};

//儲存玩家在google map上的標誌api的字典物件
if (Meteor.isClient) {
  var mapApi = {};
}
//取得當前玩家棋子標誌的google api
Player.prototype.getMapApi = function() {
  return mapApi[ this._id ];
};

//將玩家資料初始化
Player.prototype.setDefault = function() {
  _.each(CONFIG.defaultPlayer, function(value, key) {
    this[ key ] = value;
  });
  APP.db.player.updatePlayer(this._id, CONFIG.defaultPlayer);
  return this;
};
//增加玩家金額
Player.prototype.gainMoney = function(money) {
  this.money += money;
  APP.db.player.updatePlayer(this._id, {money: this.money});
  return this;
};
//減少玩家金額
Player.prototype.payMoney = function(money) {
  var originMoney = this.money;
  this.money -= money;
  APP.db.player.updatePlayer(this._id, {money: this.money});
  return this;
};
//讓玩家住院
Player.prototype.sentToHospital = function(hospital, round) {
  var hospital = APP.db.landMark.getHospital();
  var hospitalOwner = hospital.getOwner();
  this.inHospitalRound = round;
  this.position = hospital.sort;
  APP.db.player.updatePlayer(this._id, {
    position: this.position,
    inHospitalRound: this.inHospitalRound
  });
  return this;
};
//減少玩家的住院輪數
Player.prototype.processHospital = function() {
  this.inHospitalRound -= 1;
  APP.db.player.updatePlayer(this._id, {
    inHospitalRound: this.inHospitalRound
  });
  return this;
};

//設定當前玩家棋子標誌的google api
Player.prototype.setMapApi = function(api) {
  return mapApi[ this._id ] = api;
};

//依照當前玩家棋子標誌在地圖上的當前lat, lng值
Player.prototype.getLatLng = function() {
  var api = this.getMapApi();
  return {
    lat: api.position.lat(),
    lng: api.position.lng()
  };
};
//依照當前玩家棋子停止時的所在地標與該地標上的當前玩家棋子數量，回傳在該玩家的棋子在地圖上應有的lat, lng值
Player.prototype.getStopLatLng = function() {
  //獲得當前位置的landMark
  var atLandMark = APP.db.landMark.getBySort(this.position);
  //獲得玩家棋子在該地標上處於第幾排序
  var playerId = this._id;
  var playerSortAtLandMark;
  APP.db.player.getAllByPosition(this.position).forEach(function(player, sort) {
    if (playerId === player._id) {
      playerSortAtLandMark = sort;
    }
  });
  //依照地標上玩家數量與自身排序，決定玩家棋子的位置偏移量
  switch (playerSortAtLandMark) {
  case 0:
    return atLandMark.getLatLng();
    break;
  case 1:
    return new google.maps.LatLng(atLandMark.lat, atLandMark.lng + 0.0005);
    break;
  case 2:
    return new google.maps.LatLng(atLandMark.lat, atLandMark.lng - 0.0005);
    break;
  case 3:
    return new google.maps.LatLng(atLandMark.lat + 0.0005, atLandMark.lng);
    break;
  case 4:
    return new google.maps.LatLng(atLandMark.lat - 0.0005, atLandMark.lng);
    break;
  default: 
    return new google.maps.LatLng(atLandMark.lat - 0.0005, atLandMark.lng);
  }
};

//將玩家標誌設置在google地圖上的指定Lat Lng位置
Player.prototype.setOnMap = function(newLatLng) {
  var mapApi;
  //只有在使用者端才會執行setOnMap method
  if (Meteor.isClient) {
    mapApi = this.getMapApi();
    //若未給定座標，則自行取得應在的座標
    if (! newLatLng) {
      newLatLng = this.getStopLatLng();
    }
    //若已在地圖上建立玩家標誌，則執行_mapApi的setPosition method更新位置
    if (mapApi) {
      mapApi.setPosition( newLatLng );
    }
    //若尚未在地圖上建立玩家，則在地圖上建立新marker
    else {
      mapApi = new google.maps.Marker({
        map: APP._map,
        draggable: false,
        position: newLatLng,
        icon: {
          path: userPath(),
          strokeColor: this.getColor(),
          strokeWeight: 1,
          fillColor: this.getColor(),
          fillOpacity: 0.5
        }
      });
      //儲存api
      this.setMapApi(mapApi);
    }
  }
  return this;
};
//從google地圖上將玩家標誌移除
Player.prototype.removeIcon = function(newLatLng) {
  if (Meteor.isClient) {
    this.getMapApi().setMap(null);
    return this;
  }
};

//回傳google map可接受的路徑參數，畫出玩家棋子
var userPath = function() {
  return 'm-16,0 ' +
         'a16,5 0 1 0 32,0 ' +
         'l-11,-24 ' +
         'a12.5,12.5 0 1 0 -6,0 ' +
         'l-14,25';
};

//設定當前玩家所在的地標
Player.prototype.setPosition = function(landMark) {
  this.position = landMark.sort;
  APP.db.player.updatePlayer(this._id, {
    position: this.position
  });
  return this;
};