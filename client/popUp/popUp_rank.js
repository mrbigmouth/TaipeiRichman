//預設訂閱第一頁的排行榜 與 自己的排行資料
Template.popUp_rank.onCreated(function() {
  var instance = this;
  Session.set('ranksViewPage', 1);
  instance.autorun(function() {
    instance.loading = instance.subscribe('rank', Session.get('ranksViewPage'));
  });
});

Template.popUp_rank.helpers({
  isReady: function() {
    var instance = Template.instance();
    return instance.loading.ready();
  },
  //按照當前的訂閱頁碼，設定排行榜的起始排序
  rankUsers: function() {
    var pageSort = (Session.get('ranksViewPage') - 1) * 10;
    return _.map(APP.db.rank.getLimitOrderByVictoryAndWealth().fetch(), function(rank, sort) {
      return rank.setSort(sort + 1 + pageSort);
    });
  },
  hasPrevPage: function() {
    return (Session.get('ranksViewPage') !== 1);
  },
  hasNextPage: function() {
    return (APP.db.rank.getLimitOrderByVictoryAndWealth().count() === 10);
  }
});

Template.popUp_rank.events({
  'click button[data-action="prev"]': function(e, ins) {
    Session.set('ranksViewPage', Session.get('ranksViewPage') - 1);
  },
  'click button[data-action="next"]': function(e, ins) {
    Session.set('ranksViewPage', Session.get('ranksViewPage') + 1);
  }
});