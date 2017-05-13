define(['matter'], function(Matter) {
  return {
  constants: {
    MAX_NUM_CARDS: 32,
    MIN_NUM_CARDS: 2,
    VIEW_HEIGHT: 1000*.75,
    VIEW_WIDTH: 800*.75,
    NUM_CARD_GROUPS: 10,
    CARD_WIDTH: 105*.60,
    CARD_HEIGHT: 150*.60,
    MOUSE_X_FORCE: 0.02,
    MOUSE_Y_FORCE: -0.15,
    SPACE_FORCE: 0.2,
    IMAGES: {
      pulseIconPath: 'img/pulseIcon.png',
      cardBackPath: 'img/card_0.png'
    },
    DEFAULT_COLLISION: 0x0001,
    COLORS: [
      '#000000',
      '#222034',
      '#45283C',
      '#663931',
      '#8F563B',
      '#DF7126',
      '#D9A066',
      '#EEC39A',
      '#FBF236',
      '#99E550',
      '#6ABE30',
      '#37946E',
      '#4B692F',
      '#524B24',
      '#323C39',
      '#3F3F74',
      '#306082',
      '#5B6EE1',
      '#639BFF',
      '#5FCDE4',
      '#CBDBFC',
      '#FFFFFF',
      '#9BADB7',
      '#847E87',
      '#696A6A',
      '#595652',
      '#76428A',
      '#AC3232',
      '#D95763',
      '#D77BBA',
      '#8F974A',
      '#8A6F30'
    ]
  },
  vectorSetMag: function(x, y, scale) {
    // console.log('vectorSetMag'+x + ', ' + y + ', '+scale);
    v = this.vectorNormalize(x, y);
    return {
      x: v.x * scale,
      y: v.y * scale
    };
  },
  applyForceTowardPt: function(x1, y1, x2, y2, mag) {
    x= x1 - x2;
    y= y1 - y2;
    return this.vectorSetMag(x, y, mag);
  },
  vectorMag: function(x, y) {
    return Math.sqrt((x*x) + (y*y));
  },
  vectorNormalize: function(x, y) {
    m= this.vectorMag(x, y);
    m > 0 ?
      r= {x:x/m, y:y/m}
    :
      r= {x:x, y:y};
    return r;
  },
  randInt: function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
  },
  randNum: function(min, max) {
    return (Math.random() * (max - min)) + min;
  },
  drawByVertices: function(vertices, ctx) {
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    for(j=0; j<vertices.length; j++) {
      ctx.lineTo(vertices[j].x, vertices[j].y);
    }
    ctx.lineTo(vertices[0].x, vertices[0].y);

    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }
}
});
