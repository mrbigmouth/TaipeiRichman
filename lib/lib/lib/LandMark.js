/**
 * 地標物件
 * @class LandMark
 * @property {String} _id 主鍵
 * @property {String} name 地標名稱
 * @property {Number} lat 地標在google地圖上的lat座標值
 * @property {Number} lng 地標在google地圖上的lng座標值
 * @property {Number} sort 地標排序，從1起始
 * @property {?Number} owner 擁有玩家的排序，若無人擁有則記為null
 * @property {Number} price 該地標的地價
 * @property {Number} house 蓋的房子層數
 * @property {Number} type 地標類別 0:不可購買的觸發事件地點 1:政府機關 2:學校機關 3:醫院 4:其他
 */
LandMark = function LandMark(data) {
  _.extend(this, data);
  return this;
};
//取得該地標的名稱
LandMark.prototype.getName = function() {
  return this.name;
};
//取得該地標的擁有者
LandMark.prototype.getOwner = function() {
  return APP.db.player.getBySort(this.owner);
};
//取得該地標的顯示顏色
LandMark.prototype.getColor = function() {
  var owner;
  //若為不可購買的事件觸發點
  if (this.isEventLandMark()) {
    return '#000000';
  }
  else {
    owner = this.getOwner();
    if (owner) {
      return owner.getColor();
    }
    else {
      return 'rgba(255, 255, 255, .85)';
    }
  }
};
//取得該地標的購買/建房價格
LandMark.prototype.getPrice = function() {
  return this.price;
};
//取得該地標的過路費
LandMark.prototype.getToll = function() {
  var toll = this.price * (this.house + 1) * CONFIG.tollRate;
  //如果是政府機關或學校機關，過路費x1.5倍
  if (this.isGovernment() || this.isSchool()) {
    toll *= 1.5;
  }
  //住院費x2
  else if (this.isHospital) {
    toll *= 2;
  }
  return toll;
};
//判斷是否為不可購買的事件觸發點
LandMark.prototype.isEventLandMark = function() {
  return (this.type === 0);
};
//判斷是否為政府機關
LandMark.prototype.isGovernment = function() {
  return (this.type === 1);
};
//判斷是否為學校機關
LandMark.prototype.isSchool = function() {
  return (this.type === 2);
};
//判斷是否為醫院
LandMark.prototype.isHospital = function() {
  return (this.type === 3);
};
//傳入終點地標，取得從此地標到終點地標路上經過的所有地標
LandMark.prototype.getAllLandMarkInPath = function(toLandMark) {
  var sort = this.sort;
  var to = toLandMark.sort;
  var result = [this];
  var maxLandMarkSort = CONFIG.landMarkList.length;
  while (sort !== to) {
    sort += 1;
    if (sort > maxLandMarkSort) {
      sort = 1;
    }
    result.push( APP.db.landMark.getBySort(sort) );
  }
  return result;
};
//取得該地標標誌的google地圖座標值
LandMark.prototype.getLatLng = function() {
  return new google.maps.LatLng(this.lat, this.lng);
};
//遊戲重新開始時，將地標資料初始化
LandMark.prototype.setDefault = function() {
  this.owner = null;
  this.house = 0;
  this.price = CONFIG.landMarkList[ this.sort - 1 ].price;
  APP.db.landMark.updateLandMark(this._id, {
    owner: this.owner,
    house: this.house,
    price: this.price
  });
  return this;
};
//變跟該地標的擁有者
LandMark.prototype.setOwner = function(player) {
  if (player) {
    this.owner = player.sort;
  }
  else {
    this.owner = null;
  }
  APP.db.landMark.updateLandMark(this._id, {
    owner: this.owner
  });
  return this;
};
//加蓋一層房屋
LandMark.prototype.addHouse = function() {
  this.house += 1;
  APP.db.landMark.updateLandMark(this._id, {
    house: this.house
  });
  return this;
};
//摧毀所有房屋
LandMark.prototype.destroyHouse = function() {
  this.house = 0;
  APP.db.landMark.updateLandMark(this._id, {
    house: this.house
  });
  return this;
};
//地價、房價上漲
LandMark.prototype.raisePrice = function() {
  var raisePrice = CONFIG.landMarkList[ this.sort - 1 ].price;
  this.price += raisePrice;
  APP.db.landMark.updateLandMark(this._id, {
    price: this.price
  });
  return this;
};
//取得地標標誌的google地圖api
LandMark.prototype.getMapApi = function() {
  return mapApi[ this._id ];
};
//取得地標上房子標誌的google地圖api
LandMark.prototype.getHouseMapApi = function() {
  return houseMapApi[ this._id ];
};
//取得地標標誌的google地圖api
LandMark.prototype.setMapApi = function(api) {
  return mapApi[ this._id ] = api;
};
//取得地標上房子標誌的google地圖api
LandMark.prototype.setHouseMapApi = function(api) {
  return houseMapApi[ this._id ] = api;
};
//將該地標標誌設置到google地圖上
LandMark.prototype.setOnMap = function(color) {
  var mapApi;
  //只有在使用者端才會執行setOnMap method
  if (Meteor.isClient) {
    mapApi = this.getMapApi();
    //若已經在google地圖上建好標誌，則取消之前的標誌
    if (mapApi) {
      mapApi.setMap(null);
    }
    //在地圖上建立地標新標誌
    mapApi = new google.maps.Marker({
      map: APP.getGoogleMap(),
      draggable: false,
      position: this.getLatLng(),
      title: '地名:' + this.getName() + ' 收費:' + this.getToll(),
      icon: {
        path: circlePath(20),
        strokeColor: 'rgba(0, 0, 0, 1)',
        strokeWeight: 1,
        fillColor: this.getColor(),
        fillOpacity: 0.5
      }
    });
    //儲存api
    this.setMapApi(mapApi);
  }
  return this;
};
//將該地標上的房子標誌設置到google地圖上
LandMark.prototype.setHouseOnMap = function(color) {
  var houseMapApi;
  //只有在使用者端才會執行setOnMap method
  if (Meteor.isClient) {
    houseMapApi = this.getHouseMapApi();
    //若已經在google地圖上建好標誌，則取消之前的標誌
    if (houseMapApi) {
      houseMapApi.setMap(null);
    }
    //只有房子在一層以上才會建立標誌
    if (this.house > 0) {
      //在地圖上建立地標新標誌
      houseMapApi = new google.maps.Marker({
        map: APP.getGoogleMap(),
        draggable: false,
        position: google.maps.geometry.spherical.computeOffset(this.getLatLng(), 80, 220),
        icon: 'img/house' + this.house + '.png'
      });
      //儲存api
      this.setHouseMapApi(houseMapApi);
    }
  }
  return this;
};

//輸入半徑，回傳google map可接受的圓形路徑參數
function circlePath(r) {
  return 'M 0 0 m -' + r + ', 0 '+
         'a ' + r + ',' + r + ' 0 1,0 ' + (r * 2) + ',0 ' +
         'a ' + r + ',' + r + ' 0 1,0 -' + (r * 2) + ',0';
};

//儲存地標在google map上的標誌api的字典物件
if (Meteor.isClient) {
  var mapApi = {};
  var houseMapApi = {};
}