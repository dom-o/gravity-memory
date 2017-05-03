define(['matter', './utils'], function(Matter, utils) {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var Engine = Matter.Engine,
      World = Matter.World,
      Render = Matter.Render,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Events = Matter.Events,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      Composite = Matter.Composite
      constants = utils.constants;

  var engine = Engine.create();
  // TODO: Scale gravity, number of cards, force of click with difficulty.
  // TODO: Refine how you display cards that are face-up. Maybe add sprites?
  engine.world.gravity.x = 0;
  engine.world.gravity.y = 0.05;
  var mouseConstraint = MouseConstraint.create(engine, {element: canvas});
  currentCard = null;
  compareCard = null;
  faceUp = [];
  nullTimer=-1;
  levelFailure = false;
  numCards = constants.MIN_NUM_CARDS;

  deck = Composite.create({label: 'deck'});
  World.add(engine.world, deck);

  for(i=0; i<numCards; i++) {
    setTimeout(function(i) {
      card = Bodies.rectangle(canvas.width/2, canvas.height/2, constants.CARD_WIDTH, constants.CARD_HEIGHT);
      card.label = i % (numCards/2);

      card.collisionFilter.category = constants.COLLS[i%constants.NUM_CARD_GROUPS];
      card.collisionFilter.mask = constants.DEFAULT_COLLISION | constants.COLLS[i%constants.NUM_CARD_GROUPS];
      Composite.add(deck, card);
      velocity= {
        x: utils.randNum(-5, 5),
        y: utils.randNum(-15, -8)
      };
      Body.setVelocity(card, velocity);
    }, 100*i, i);
  }

  offset=25;
  ground = [
    Bodies.rectangle(canvas.width/2, -5*constants.CARD_HEIGHT, canvas.width+2*offset, 50, {label:'top ground', isStatic: true, friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1 }), //TOP
    Bodies.rectangle(-offset, canvas.height/2, 50, 3*canvas.height+2*offset, {label:'left ground', friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1, isStatic: true }), //LEFT
    Bodies.rectangle(canvas.width/2, canvas.height+3*constants.CARD_HEIGHT, canvas.width+2*offset, 50, {label:'bottom ground', friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1, isStatic: true }), //BOTTOM
    Bodies.rectangle(canvas.width+offset, canvas.height/2, 50, 3*canvas.height+2*offset, {label:'right ground', friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1, isStatic: true }) //RIGHT
  ];
  World.add(engine.world, ground);

  Events.on(mouseConstraint, 'mouseup', function(event) {
    mousePos = event.mouse.position;
    cards = Composite.allBodies(deck);
    for(i=cards.length-1; i>=0; i--) {
      card = cards[i];
      if(Matter.Bounds.contains(card.bounds, mousePos)) {
        if(currentCard != null && compareCard != null) {
          faceUp.splice(faceUp.indexOf(compareCard), 1);
          faceUp.splice(faceUp.indexOf(currentCard), 1);

          currentCard = null;
          compareCard = null;
        }
        clearTimeout(nullTimer);

        minX =0;
        maxX= 0;
        mousePos.x < card.position.x ? maxX= 0.02 : maxX=0;
        mousePos.x > card.position.x ? minX= -0.02 : minX=0;
        force = {
          x: utils.randNum(minX, maxX),
          y: -0.15
        };
        Body.applyForce(card, mousePos, force);

        if(currentCard != null) {
          compareCard = card;
          faceUp.push(compareCard);

          if(compareCard.label == currentCard.label && compareCard !== currentCard) {
            setTimeout(function(currentCard, compareCard) {
              Composite.remove(deck, currentCard);
              Composite.remove(deck, compareCard);

              faceUp.splice(faceUp.indexOf(compareCard), 1);
              faceUp.splice(faceUp.indexOf(currentCard), 1);
            }, 500, currentCard, compareCard);

            faceUp.push(currentCard);
            faceUp.push(compareCard);
          }

          nullTimer = setTimeout(function() {
            faceUp.splice(faceUp.indexOf(compareCard), 1);
            faceUp.splice(faceUp.indexOf(currentCard), 1);

            currentCard = null;
            compareCard = null;
          }, 3*1000);
        }
        else {
          currentCard = card;
          faceUp.push(currentCard);
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
      if (constants.MAX_NUM_CARDS - numCards >= 2 && !levelFailure) {
        numCards += 2;
      }
      for(i=0; i<numCards; i++) {
        setTimeout(function(i) {
          card = Bodies.rectangle(canvas.width/2, canvas.height/2, constants.CARD_WIDTH, constants.CARD_HEIGHT);
          card.label = i % (numCards/2);

          card.collisionFilter.category = constants.COLLS[i%constants.NUM_CARD_GROUPS];
          card.collisionFilter.mask = constants.DEFAULT_COLLISION | constants.COLLS[i%constants.NUM_CARD_GROUPS];
          Composite.add(deck, card);
          velocity= {
            x: utils.randNum(-5, 5),
            y: utils.randNum(-15, -8)
          };
          Body.setVelocity(card, velocity);
        }, 100*i, i);
      }
    }
  });

  Engine.run(engine);

  (
    function render() {
      window.requestAnimationFrame(render);
      bodies = Composite.allBodies(engine.world);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for(i=0; i<bodies.length; i++) {
        body = bodies[i];
        Composite.allBodies(deck).includes(body) ? ctx.fillStyle = constants.COLORS[i] : ctx.fillStyle = 'black';

        utils.drawByVertices(body.vertices, ctx);

        ctx.fillStyle = 'red';

        if(faceUp.includes(body)) {
          // ctx.fillStyle = 'red';
          ctx.font = "50px arial";
          ctx.textAlign = "center";
          ctx.fillText(body.label, body.position.x, body.position.y);
        }

      }
    }
  )();
});
