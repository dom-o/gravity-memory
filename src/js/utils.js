const utils = {
  constants: {
    MAX_NUM_CARDS: 32,
    MIN_NUM_CARDS: 2,
    VIEW_HEIGHT: 1050*.75,
    VIEW_WIDTH: 800*.75,
    NUM_CARD_GROUPS: 10,
    CARD_WIDTH: 105*.50,
    CARD_HEIGHT: 150*.50,
    MOUSE_X_FORCE: 0.02,
    MOUSE_Y_FORCE: -0.15,
    SPACE_FORCE: 0.2,
    IMAGES: {
      pulseIconPath: 'img/pulseIcon.png',
      cardBackPath: 'img/card_0.png'
    },
  },
  getPulse: function(numCards) {
    return Math.round(numCards/5)
  },
  vectorSetMag: function(x, y, scale) {
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
  },
  getTexture: function(textures, imagePath) {
    var image = textures[imagePath];

    if (image)
      return image;

    image = textures[imagePath] = new Image();
    image.src = imagePath;

    return image;
  },
  drawTexture: function(ctx, body, texture, sprite) {
    ctx.translate(body.position.x, body.position.y);
    ctx.rotate(body.angle);
    ctx.drawImage(
      texture,
      texture.width * -sprite.xOffset * sprite.xScale,
      texture.height * -sprite.yOffset * sprite.yScale,
      texture.width * sprite.xScale,
      texture.height * sprite.yScale
    );
    // revert translation, hopefully faster than save / restore
    ctx.rotate(-body.angle);
    ctx.translate(-body.position.x, -body.position.y);
  }
}
