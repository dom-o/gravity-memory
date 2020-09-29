define(['matter', './utils'], function(Matter, utils) {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  canvas.onselectstart = function () { return false; }

  const Engine = Matter.Engine,
      World = Matter.World,
      Render = Matter.Render,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Events = Matter.Events,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      Composite = Matter.Composite,
      Common = Matter.Common,
      constants = utils.constants;

  canvas.width = constants.VIEW_WIDTH;
  canvas.height = constants.VIEW_HEIGHT;
  const engine = Engine.create();
  engine.world.gravity.x = 0;
  engine.world.gravity.y = 0.08;
  const mouseConstraint = MouseConstraint.create(engine, {element: canvas});
  let currentCard = null,
      compareCard = null,
      nullTimer=-1,
      numCards = constants.MIN_NUM_CARDS,
      cardsMatched = 0,
      pulse = utils.getPulse(numCards),
      textures = {},
      background = 'black',
      showSprites = true,
      timeoutIDs = []

  const offset=10;
  const ground = [
    Bodies.rectangle(canvas.width/2, -1.5*constants.CARD_HEIGHT, canvas.width*1.5, 50, {label:'top_ground', isStatic: true, friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 0, /*render:{fillStyle:'transparent'}*/ }), //TOP
    Bodies.rectangle(-offset, canvas.height/2, 25, canvas.height*1.5, {label:'left_ground', friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1, isStatic: true, /*render:{fillStyle:'transparent'}*/ }), //LEFT
    Bodies.rectangle(canvas.width/2, canvas.height+(2*constants.CARD_HEIGHT), canvas.width*1.5, 50, {label:'bottom_ground', friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1, isStatic: true, /*render:{fillStyle:'transparent'}*/ }), //BOTTOM
    Bodies.rectangle(canvas.width+offset, canvas.height/2, 25, canvas.height*1.5, {label:'right_ground', friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1, isStatic: true, /*render:{fillStyle:'transparent'}*/ }), //RIGHT
  ];
  World.add(engine.world, ground);

  let deck = Composite.create({label: 'deck'})
  World.add(engine.world, deck)

  let shower = Composite.create({label: 'shower'})
  World.add(engine.world, shower)

  for(let i=0; i<numCards; i++) {
    timeoutIDs.push(setTimeout(genCard, 100*i, i, deck, textures));
  }

  Events.on(mouseConstraint, 'mouseup', function(event) {
    const mousePos = event.mouse.mousedownPosition;
    const cards = Composite.allBodies(deck);

    for (let i=cards.length-1; i>=0; i--) {
      let card = cards[i];
      const tolerance = 15
      const generous_bounds = {
        max:{x:card.bounds.max.x+tolerance, y:card.bounds.max.y+tolerance},
        min:{x:card.bounds.min.x-tolerance, y:card.bounds.min.y-tolerance}
      }

      if(Matter.Bounds.contains(generous_bounds, mousePos)) {
        if(currentCard != null && compareCard != null) {
          currentCard = null;
          compareCard = null;
        }
        clearTimeout(nullTimer);

        minX = 0;
        maxX = 0;
        mousePos.x < card.position.x ? maxX = constants.MOUSE_X_FORCE : maxX=0;
        mousePos.x > card.position.x ? minX = -constants.MOUSE_X_FORCE : minX=0;
        force = {
          x: Common.random(minX, maxX),
          y: constants.MOUSE_Y_FORCE
        };
        Body.applyForce(card, mousePos, force);

        if(currentCard != null) {
          compareCard = card;

          if(compareCard.label === currentCard.label && compareCard !== currentCard) {
            setTimeout(function(currentCard, compareCard) {
              cardsMatched += 2;
              successShower(currentCard.position.x, currentCard.position.y, constants.CARD_WIDTH/8, 15, shower)
              successShower(compareCard.position.x, compareCard.position.y, constants.CARD_WIDTH/8, 15, shower)
              Composite.remove(deck, [currentCard, compareCard])
            }, 100, currentCard, compareCard);
          }

          nullTimer = setTimeout(function() {
            currentCard = null;
            compareCard = null;
          }, 2000);
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
    for(let i=0; i<pairs.length; i++) {
      if (pairs[i].bodyA.label==='bottom_ground' || pairs[i].bodyB.label==='bottom_ground') {
        resetLevel(0)
      }
    }
  });

  Events.on(deck, 'afterRemove', function(event) {
    if (cardsMatched === numCards) {
      successShower(constants.VIEW_WIDTH/2, constants.VIEW_HEIGHT/2, constants.CARD_WIDTH/2, 50, shower)
      setTimeout(function() {
        resetLevel(2)
      }, 3000)
    }
  });

  document.addEventListener('keyup', function(e) {
    if(e.key === "q") {
      if(pulse > 0) {
        const cards = Composite.allBodies(deck);
        for(let i=0; i<cards.length; i++) {
          const force = utils.applyForceTowardPt(cards[i].position.x, cards[i].position.y, ground[2].position.x, ground[2].position.y, constants.SPACE_FORCE);
          Body.applyForce(cards[i], ground[2].position, force);
        }
        pulse--;
      }
    } else if (e.key === '+') {
      resetLevel(2)
    } else if (e.key === '-') {
      resetLevel(-2)
    } else if (e.key === 'w') {
      showSprites = !showSprites
    }
  });

  Engine.run(engine);

  (
    function render() {
      window.requestAnimationFrame(render);
      const bodies = Composite.allBodies(engine.world);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.globalAlpha = 1;
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for(i=0; i<bodies.length; i++) {
        let body = bodies[i];

        if (body.render.sprite && body.render.sprite.texture && showSprites) {
          sprite = body.render.sprite;
          if(body===compareCard || body===currentCard) {
            // part sprite
            var texture = utils.getTexture(textures, sprite.texture);
          }
          else {
            var texture = utils.getTexture(textures, constants.IMAGES.cardBackPath);
          }
          utils.drawTexture(ctx, body, texture, sprite);
        }
        else {
          ctx.fillStyle = body.render.fillStyle;
          utils.drawByVertices(body.vertices, ctx);
          if(body===compareCard || body===currentCard) {
            ctx.fillStyle = 'red';
            ctx.font = '56px arial';
            ctx.textAlign = 'center';
            ctx.fillText(body.label, body.position.x, body.position.y);
          }
        }
      }

      for(i=0; i<utils.getPulse(constants.MAX_NUM_CARDS); i++) {
        i<pulse ? ctx.globalAlpha = 0.9 : ctx.globalAlpha = 0.2;
        pulseTexture = utils.getTexture(textures, constants.IMAGES.pulseIconPath);
        ctx.drawImage(
          pulseTexture,
          40+(60*i), 30, 40, 40
        );
      }

      ctx.globalAlpha = 0.5;
      ctx.fillStyle = 'red';
      ctx.font = "56px arial";
      ctx.textAlign = "right";
      ctx.fillText(cardsMatched + '/' +numCards, canvas.width-50, 70);
    }
  )();

  function successShower(x, y, drop_width, num_drops, shower) {
    for(let i=0; i<=num_drops; i++) {
      setTimeout(function(shower) {
        const drop = Bodies.rectangle(x,y, drop_width, drop_width, {
          isSensor: true,
          collisionFilter: {
            mask: -2
          },
          render: {
            fillStyle: '#D4AF37'
          }
        })
        Composite.add(shower, drop)
        velocity= {
          x: Common.random(-2.5, 2.5),
          y: Common.random(-7.5, -5)
        };
        Body.setVelocity(drop, velocity)

        setTimeout(function(shower, i ) {
          Composite.remove(shower, drop)
        }, 50*i, shower, i)
      }, 10*i, shower)
    }
  }

  function resetLevel(card_increase) {
    while(timeoutIDs.length > 0) {
      id = timeoutIDs.shift()
      clearTimeout(id)
    }
    cardsMatched = 0
    Composite.clear(deck)
    currentCard = null
    compareCard = null
    if (numCards+card_increase <= constants.MAX_NUM_CARDS && numCards+card_increase >= constants.MIN_NUM_CARDS) {
      numCards+=card_increase
    }
    pulse = utils.getPulse(numCards)
    for(let i=0; i<numCards; i++) {
      timeoutIDs.push(setTimeout(genCard, 100*i, i, deck, textures));
    }
  }

  function genCard(i, deck, textures) {
    card = Bodies.rectangle(constants.VIEW_WIDTH/2, constants.VIEW_HEIGHT/2, constants.CARD_WIDTH, constants.CARD_HEIGHT, {
      // restitution: 1,
      frictionStatic: 0,
      friction: 0,
      label: i % (numCards/2),
      render: {
        fillStyle: "white",
        sprite: {
          texture: 'images/gravity-memory/card_'+((i%(numCards/2)) +1)+'.png'
        },
      },
      collisionFilter: {
        group: -19,
      }
    });
    utils.getTexture(textures, card.render.sprite.texture);
    Composite.add(deck, card);
    velocity= {
      x: Common.random(-5, 5),
      y: Common.random(-11.25, -7.5)
    };
    Body.setVelocity(card, velocity);
  }
});
