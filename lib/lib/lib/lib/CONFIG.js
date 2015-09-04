//遊戲基本設定物件
CONFIG = {
  //可購買的地標列表
  landMarkList: [
    {
      name: '臺北車站',
      lat: 25.046190,
      lng: 121.517494,
      price: 500,
      type: 4
    },
    {
      name: '新光三越',
      lat: 25.046799,
      lng: 121.515022,
      price: 200,
      type: 4
    },
    {
      name: '國立臺灣博物館',
      lat: 25.043418,
      lng: 121.515010,
      price: 300,
      type: 4
    },
    {
      name: '臺大醫院',
      lat: 25.043369,
      lng: 121.516636,
      price: 300,
      type: 3
    },
    {
      name: '二二八和平公園',
      lat: 25.039573,
      lng: 121.515564,
      price: 400,
      type: 4
    },
    {
      name: '東門',
      lat: 25.039055,
      lng: 121.517674,
      price: 300,
      type: 4
    },
    {
      name: '臺大醫學院',
      lat: 25.038786,
      lng: 121.521599,
      price: 300,
      type: 2
    },
    {
      name: '國家音樂廳',
      lat: 25.037054,
      lng: 121.521083,
      price: 200,
      type: 4
    },
    {
      name: '中正紀念堂',
      lat: 25.036127,
      lng: 121.522691,
      price: 300,
      type: 4
    },
    {
      name: '金甌女中',
      lat: 25.035342,
      lng: 121.524304,
      price: 200,
      type: 2
    },
    {
      name: '交通部',
      lat: 25.038284,
      lng: 121.525207,
      price: 400,
      type: 1
    },
    {
      name: '臺北商業大學',
      lat: 25.041601,
      lng: 121.526137,
      price: 200,
      type: 2
    },
    {
      name: '審計部',
      lat: 25.043958,
      lng: 121.526849,
      price: 300,
      type: 1
    },
    {
      name: '善導寺',
      lat: 25.044374,
      lng: 121.525084,
      price: 300,
      type: 4
    },
    {
      name: '警政署',
      lat: 25.044816,
      lng: 121.523304,
      price: 400,
      type: 1
    },
    {
      name: '成功中學',
      lat: 25.042428,
      lng: 121.522638,
      price: 200,
      type: 2
    },
    {
      name: '外交部領事處',
      lat: 25.042998,
      lng: 121.520257,
      price: 200,
      type: 1
    },
    {
      name: '教育部',
      lat: 25.043309,
      lng: 121.518916,
      price: 200,
      type: 1
    },
    {
      name: '立法院',
      lat: 25.044524,
      lng: 121.519264,
      price: 0,
      type: 0
    },
    {
      name: '行政院',
      lat: 25.045694,
      lng: 121.519637,
      price: 300,
      type: 1
    }
  ],
  //預設的玩家數量
  playerNumbers: 4,
  //預設的玩家起始財產、起步位置
  defaultPlayer: {
    position: 1,
    money: 5000
  },
  //玩家的代表顏色設定
  playerColor: [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf"
  ]
};