//在使用者端，在訂閱資料與google api皆備好後才會初始化遊戲
var initializeCount = 0;
function checkInitialize() {
  initializeCount += 1;
  if (initializeCount === 2) {
    initialGoogleMap();
  }
}


//訂閱遊戲狀態資料庫
Meteor.subscribe('initializeDB', function() {
  checkInitialize();
});
//檢查google API是否已載入
initializeGoogle = function initializeGoogle() {
  checkInitialize();
};


function initialGoogleMap() {
  //選定地圖顯示區域
  var $map = $('#map');
  //設定地圖參數
  var option = {
    zoom: 16,
    scaleControl: true,
    navigationControl: false,
    disableDoubleClickZoom: true,
    mapTypeControl: false,
    zoomControl: false,
    scrollwheel: false,
    streetViewControl: false,
    center: new google.maps.LatLng(25.0437, 121.522)
  };
  //建立google地圖，並將回傳api存入APP._map中
  APP._map = new google.maps.Map($map[0], option);

  //算出連接所有地標的路線
  var path = APP.db.landMark.getAllOrderBySort().map(function(landMark) {
    return landMark.getLatLng();
  });
  //將路線尾端接回起點
  path.push( path[0] );
  //在地圖上畫出路線
  new google.maps.Polyline({
    map: APP._map,
    path: path,
    strokeColor: 'rgba(102, 217, 239, .5)',
    strokeWeight: 10
  });
  //在地圖上設置玩家
  APP.db.player.getAll().forEach(function(player) {
    player.setOnMap();
  });
  //將APP狀態設置為已啟動
  APP.initialized.set(true);
}