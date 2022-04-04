WIDGETS["widmoon"] = { area: "tr", width: 24, draw: function() {
  SunCalc = require("suncalc.js");
  const CenterX = this.x + 12, CenterY = this.y + 12, Radius = 11;
  var southernHemisphere = false; // when in southern hemisphere, use the "My Location" App
    
  function loadLocation() {
    // "mylocation.json" is created by the "My Location" app
    location = require("Storage").readJSON("mylocation.json",1)||{"lat":50.1236,"lon":8.6553,"location":"Frankfurt"};
    if (location.lat < 0) southernHemisphere = true;
  }

  // code source: github.com/rozek/banglejs-2-activities/blob/main/README.md#drawmoonphase
  function drawMoonPhase (CenterX,CenterY, Radius, leftFactor,rightFactor) {
    let x = Radius, y = 0, Error = Radius;
    g.drawLine(CenterX-leftFactor*x,CenterY, CenterX+rightFactor*x,CenterY);
    let dx,dy;
    while (y <= x) {
      dy = 1 + 2*y; y++; Error -= dy;
      if (Error < 0) {
        dx = 1 - 2*x; x--; Error -= dx;
      }
      g.drawLine(CenterX-leftFactor*x,CenterY-y, CenterX+rightFactor*x,CenterY-y);
      g.drawLine(CenterX-leftFactor*x,CenterY+y, CenterX+rightFactor*x,CenterY+y);
      g.drawLine(CenterX-leftFactor*y,CenterY-x, CenterX+rightFactor*y,CenterY-x);
      g.drawLine(CenterX-leftFactor*y,CenterY+x, CenterX+rightFactor*y,CenterY+x);
    }
  }

    function updateWidget() {
    g.reset().setColor(g.theme.bg);
    g.fillRect(CenterX - Radius, CenterY - Radius, CenterX + Radius, CenterY + Radius);
    g.setColor(0x41f);

    ilu = SunCalc.getMoonIllumination(new Date()); 

    leftFactor = ilu.phase * 4 - 1;
    rightFactor = (1 - ilu.phase) * 4 - 1;
    if (ilu.phase >= 0.5) leftFactor = 1; else rightFactor = 1;
    if (true == southernHemisphere) {
      var tmp=leftFactor; leftFactor=rightFactor; rightFactor=tmp;
    }

    drawMoonPhase(CenterX,CenterY, Radius, leftFactor,rightFactor);
  }

    drawMoonPhase(CenterX,CenterY, Radius, leftFactor,rightFactor);
  }

  loadLocation();
  updateWidget();
} };
