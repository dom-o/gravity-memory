define(['matter', './utils'], function(Matter, utils) {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  canvas.onselectstart = function () { return false; }

  var Engine = Matter.Engine,
      World = Matter.World,
      Render = Matter.Render,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Events = Matter.Events,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      Composite = Matter.Composite,
      constants = utils.constants;

  canvas.width = constants.VIEW_WIDTH;
  canvas.height = constants.VIEW_HEIGHT;
  var engine = Engine.create();
  engine.world.gravity.x = 0;
  engine.world.gravity.y = 0.08;
  var mouseConstraint = MouseConstraint.create(engine, {element: canvas});
  currentCard = null;
  compareCard = null;
  nullTimer=-1;
  levelFailure = false;
  numCards = constants.MIN_NUM_CARDS;
  cardsMatched = 0;
  pulse = Math.round(numCards/10);
  textures = {};
  background = 'black'

  deck = Composite.create({label: 'deck'});
  World.add(engine.world, deck);

  for(i=0; i<numCards; i++) {
    setTimeout(genCard, 100*i, i, deck, textures);
  }

  offset=25;
  ground = [
    Bodies.rectangle(canvas.width/2, -7*constants.CARD_HEIGHT, canvas.width+2*offset, 50, {label:'top ground', isStatic: true, friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1, render:{fillStyle:'transparent'} }), //TOP
    Bodies.rectangle(-offset, canvas.height/2, 50, 3*canvas.height+2*offset, {label:'left ground', friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1, isStatic: true, render:{fillStyle:'transparent'} }), //LEFT
    Bodies.rectangle(canvas.width/2, canvas.height+1.5*constants.CARD_HEIGHT, canvas.width+2*offset, 50, {label:'bottom ground', friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1, isStatic: true, render:{fillStyle:'transparent'} }), //BOTTOM
    Bodies.rectangle(canvas.width+offset, canvas.height/2, 50, 3*canvas.height+2*offset, {label:'right ground', friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1, isStatic: true, render:{fillStyle:'transparent'} }) //RIGHT
  ];
  World.add(engine.world, ground);

  Events.on(mouseConstraint, 'mouseup', function(event) {
    mousePos = event.mouse.position;
    cards = Composite.allBodies(deck);
    for(i=cards.length-1; i>=0; i--) {
      card = cards[i];
      if(Matter.Bounds.contains(card.bounds, mousePos)) {
        if(currentCard != null && compareCard != null) {
          currentCard = null;
          compareCard = null;
        }
        clearTimeout(nullTimer);

        minX =0;
        maxX= 0;
        mousePos.x < card.position.x ? maxX= constants.MOUSE_X_FORCE : maxX=0;
        mousePos.x > card.position.x ? minX= -constants.MOUSE_X_FORCE : minX=0;
        force = {
          x: utils.randNum(minX, maxX),
          y: constants.MOUSE_Y_FORCE
        };
        Body.applyForce(card, mousePos, force);

        if(currentCard != null) {
          compareCard = card;

          if(compareCard.label == currentCard.label && compareCard !== currentCard) {
            setTimeout(function(currentCard, compareCard) {
              cardsMatched += 2;
              Composite.remove(deck, currentCard);
              Composite.remove(deck, compareCard);
            }, 500, currentCard, compareCard);
          }

          nullTimer = setTimeout(function() {
            currentCard = null;
            compareCard = null;
          }, 3*1000);
        }
        else {
          currentCard = card;
        }
        break;
      }
    }
  });

  Events.on(engine, 'collisionStart', function(event) {
    pairs = event.pairs;
    for(i=0; i<pairs.length; i++) {
      pair = [pairs[i].bodyA, pairs[i].bodyB];
      if(pair.includes(ground[2])) {
        levelFailure = true;
        if(pair.indexOf(ground[2]) == 0)
          Composite.remove(deck, pair[1]);
        else if (pair.indexOf(ground[2]) == 1) {
          Composite.remove(deck, pair[0]);
        }
      }
    }
  });

  Events.on(deck, 'afterRemove', function(event) {
    /*
      if(no more bodies) {
        calculate score;
        play some game over animation;
        allow option to play again or option to go to next level with more cards
      }
      play some animation for card removal
    */
    if(Composite.allBodies(deck).length == 0) {
      if (!levelFailure) {
        numCards+2 <= constants.MAX_NUM_CARDS ? numCards += 2 : numCards;
      }
      pulse = Math.round(numCards/10);
      levelFailure = false;
      cardsMatched = 0;
      for(i=0; i<numCards; i++) {
        setTimeout(genCard, 100*i, i, deck, textures);
      }
    }
  });

  document.addEventListener('keyup', function(e) {
    if(e.keyCode === 32) {
      if(pulse > 0) {
        cards = Composite.allBodies(engine.world);
        for(i=0; i<cards.length; i++) {
          force = utils.applyForceTowardPt(cards[i].position.x, cards[i].position.y, ground[2].position.x, ground[2].position.y, constants.SPACE_FORCE);
          Body.applyForce(cards[i], ground[2].position, force);
        }
        pulse--;
      }
    }
  });

  Engine.run(engine);

  (
    function render() {
      window.requestAnimationFrame(render);
      bodies = Composite.allBodies(engine.world);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.globalAlpha = 1;
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for(i=0; i<bodies.length; i++) {
        body = bodies[i];

        if (body.render.sprite && body.render.sprite.texture) {
          sprite = body.render.sprite;
          if(body===compareCard || body===currentCard) {
            // part sprite
            var texture = getTexture(textures, sprite.texture);
          }
          else {
            var texture = getTexture(textures, constants.IMAGES.cardBackPath);
          }
          drawTexture(ctx, body, texture, sprite);
        }
        else {
          ctx.fillStyle = body.render.fillStyle;
          utils.drawByVertices(body.vertices, ctx);
          if(body===compareCard || body===currentCard) {
            ctx.fillStyle = 'red';
            ctx.font = "56px arial";
            ctx.textAlign = "center";
            ctx.fillText(body.label, body.position.x, body.position.y);
          }
        }
      }

      for(i=0; i<Math.round(constants.MAX_NUM_CARDS/10); i++) {
        i<pulse ? ctx.globalAlpha = 0.9 : ctx.globalAlpha = 0.2;
        pulseTexture = getTexture(textures, constants.IMAGES.pulseIconPath);
        ctx.drawImage(
          pulseTexture,
          40+60*i, 30, 40, 40
        );
      }

      ctx.globalAlpha = 0.3;
      ctx.fillStyle = 'red';
      ctx.font = "56px arial";
      ctx.textAlign = "right";
      ctx.fillText(cardsMatched + '/' +numCards, canvas.width-50, 70);
    }
  )();

  function drawTexture(ctx, body, texture, sprite) {
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

  function getTexture (textures, imagePath) {
    var image = textures[imagePath];

    if (image)
      return image;

    image = textures[imagePath] = new Image();
    image.src = imagePath;

    return image;
  }

  function genCard(i, deck, textures) {
    card = Bodies.rectangle(constants.VIEW_WIDTH/2, 3*constants.VIEW_HEIGHT/4, constants.CARD_WIDTH, constants.CARD_HEIGHT, {
      label: i % (numCards/2),
      render: {
        fillStyle: constants.COLORS[i%constants.COLORS.length],
        sprite: {
          texture: 'img/card_'+((i%(numCards/2)) +1)+'.png'
        }
      },
    });
    category = Body.nextCategory();
    card.collisionFilter.category = category;
    card.collisionFilter.mask = constants.DEFAULT_COLLISION;// | category;
    getTexture(textures, card.render.sprite.texture);
    Composite.add(deck, card);
    velocity= {
      x: utils.randNum(-5, 5),
      y: utils.randNum(-15, -10)
    };
    Body.setVelocity(card, velocity);
  }
});
