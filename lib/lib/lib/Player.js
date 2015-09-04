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
//取得當前玩家所在的地標
Player.prototype.getPosition = function() {
  //獲得當前位置的landMark
  return APP.db.landMark.getBySort(this.position);
};

//儲存玩家在google map上的標誌api的字典物件
if (Meteor.isClient) {
  var mapApi = {};
}
//取得當前玩家棋子標誌的google api
Player.prototype.getMapApi = function() {
  return mapApi[ this._id ];
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