(function(back) {
  const SETTINGS_FILE = "run.json";
  var ExStats = require("exstats");
  var statsList = ExStats.getList();
  statsList.unshift({name:"-",id:""}); // add blank menu item
  var statsIDs = statsList.map(s=>s.id);

  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage')
  let settings = Object.assign({
    record: true,
    B1: "dist",
    B2: "time",
    B3: "pacea",
    B4: "bpm",
    B5: "step",
    B6: "caden",
    paceLength: 1000, // TODO: Default to either 1km or 1mi based on locale
    notify: {
      dist: {
        increment: 0,
        notifications: [],
      },
      step: {
        increment: 0,
        notifications: [],
      },
      time: {
        increment: 0,
        notifications: [],
      },
    },
  }, storage.readJSON(SETTINGS_FILE, 1) || {});
  function saveSettings() {
    storage.write(SETTINGS_FILE, settings)
  }

  function getBoxChooser(boxID) {
    return {
      min: 0, max: statsIDs.length-1,
      value: Math.max(statsIDs.indexOf(settings[boxID]),0),
      format: v => statsList[v].name,
      onchange: v => {
        settings[boxID] = statsIDs[v];
        saveSettings();
      },
    }
  }

  function sampleBuzz(buzzPatterns) {
    return buzzPatterns.reduce(function (promise, buzzPattern) {
        return promise.then(function () {
            return Bangle.buzz(buzzPattern[0], buzzPattern[1]);
        });
    }, Promise.resolve());
  }

  var menu = {
    '': { 'title': 'Run' },
    '< Back': back,
  };
  if (WIDGETS["recorder"])
    menu[/*LANG*/"Record Run"] = {
      value : !!settings.record,
      format : v => v?/*LANG*/"Yes":/*LANG*/"No",
      onchange : v => {
        settings.record = v;
        saveSettings();
      }
    };
  var notificationsMenu = {
    '< Back': function() { E.showMenu(menu) },
  }
  menu[/*LANG*/"Notifications"] = function() { E.showMenu(notificationsMenu)};
  ExStats.appendMenuItems(menu, settings, saveSettings);
  ExStats.appendNotifyMenuItems(notificationsMenu, settings, saveSettings);
  var vibPatterns = [/*LANG*/"Off", ".", "-", "--", "-.-", "---"];
  var vibTimes = [
    [],
    [[100, 1]],
    [[300, 1]],
    [[300, 1], [300, 0], [300, 1]],
    [[300, 1],[300, 0], [100, 1], [300, 0], [300, 1]],
    [[300, 1],[300, 0],[300, 1],[300, 0],[300, 1]],
  ];
  notificationsMenu[/*LANG*/"Dist Pattern"] = {
    value: Math.max(0,vibPatterns.findIndex((p) => JSON.stringify(p) === JSON.stringify(settings.notify.dist.notifications))),
      min: 0, max: vibPatterns.length,
      format: v => vibPatterns[v]||"Off",
      onchange: v => {
        settings.notify.dist.notifications = vibTimes[v];
        sampleBuzz(vibTimes[v]);
        saveSettings();
      }
  }
  notificationsMenu[/*LANG*/"Step Pattern"] = {
    value: Math.max(0,vibPatterns.findIndex((p) => JSON.stringify(p) === JSON.stringify(settings.notify.step.notifications))),
      min: 0, max: vibPatterns.length,
      format: v => vibPatterns[v]||"Off",
      onchange: v => {
        settings.notify.step.notifications = vibTimes[v];
        sampleBuzz(vibTimes[v]);
        saveSettings();
      }
  }
  notificationsMenu[/*LANG*/"Time Pattern"] = {
    value: Math.max(0,vibPatterns.findIndex((p) => JSON.stringify(p) === JSON.stringify(settings.notify.time.notifications))),
      min: 0, max: vibPatterns.length,
      format: v => vibPatterns[v]||"Off",
      onchange: v => {
        settings.notify.time.notifications = vibTimes[v];
        sampleBuzz(vibTimes[v]);
        saveSettings();
      }
  }
  var boxMenu = {
    '< Back': function() { E.showMenu(menu) },
  }
  Object.assign(boxMenu,{
    'Box 1': getBoxChooser("B1"),
    'Box 2': getBoxChooser("B2"),
    'Box 3': getBoxChooser("B3"),
    'Box 4': getBoxChooser("B4"),
    'Box 5': getBoxChooser("B5"),
    'Box 6': getBoxChooser("B6"),
  });
  menu[/*LANG*/"Boxes"] = function() { E.showMenu(boxMenu)};
  E.showMenu(menu);
})
