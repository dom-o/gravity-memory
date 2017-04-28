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
      Composite = Matter.Composite;
  var NUM_CARDS= 32,
      NUM_CARD_GROUPS= 2,
      CARD_WIDTH= 70;
      CARD_HEIGHT= 100,
      DEFAULT_COLLISION= 0x0001;
      COLLS= [0x0002, 0x0004, 0x0008, 0x0010, 0x0020, 0x0040, 0x0080, 0x0100, 0x0200, 0x0400, 0x0800, 0x1000, 0x2000, 0x4000, 0x8000],
      COLORS= ['red', 'black', 'blue', 'purple', 'grey', 'orange', 'green', 'yellow', 'pink', 'brown'];

  var engine = Engine.create();
  engine.world.gravity.x = 0;
  engine.world.gravity.y = 0.05;
  var mouseConstraint = MouseConstraint.create(engine, {element: canvas});
  currentCard = -1;
  compareCard = -1;
  deck = [];
  for(i=0; i<NUM_CARDS; i++) {
    setTimeout(function(i) {
      card = Bodies.rectangle(canvas.width/2, 0, CARD_WIDTH, CARD_HEIGHT);

      card.collisionFilter.category = COLLS[i%NUM_CARD_GROUPS];
      card.collisionFilter.mask = DEFAULT_COLLISION | COLLS[i%NUM_CARD_GROUPS];

      deck.push(card);
      World.add(engine.world, card);
      if(i==5) {console.log(card);}
      velocity= {
        x: utils.randNum(-4, 4),
        y: utils.randNum(-10, 0.5)
      };
      Body.setVelocity(card, velocity);
    }, 100*i, i)
  }

  offset=25;
  ground = [
    // Bodies.rectangle(canvas.width/2, -offset, canvas.width+2*offset, 50, { isStatic: true, friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1 }),
    Bodies.rectangle(-offset, canvas.height/2, 50, 3*canvas.height+2*offset, { friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1, isStatic: true }),
    Bodies.rectangle(canvas.width/2, canvas.height+offset, canvas.width+2*offset, 50, { friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1, isStatic: true }),
    Bodies.rectangle(canvas.width+offset, canvas.height/2, 50, 3*canvas.height+2*offset, { friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1, isStatic: true })
  ];
  World.add(engine.world, ground);

  Events.on(mouseConstraint, 'mouseup', function(event) {
    mousePos = event.mouse.position;

    for(i=0; i<deck.length; i++) {
      if(Matter.Bounds.contains(deck[i].bounds, mousePos)) {
        card = deck[i];

        minX =0;
        maxX= 0;
        mousePos.x < card.position.x ? maxX= 0.02 : maxX=0;
        mousePos.x > card.position.x ? minX= -0.02 : minX=0;

        force = {
          x: utils.randNum(minX, maxX),
          y: -0.1
        };
        Body.applyForce(card, mousePos, force);

        if(currentCard != -1) {
          compareCard = i;

          currentCard%2 === 0
          ?
            match = (currentCard+1 == compareCard)
          :
            match = (currentCard-1 == compareCard);

          if(match) {
            // World.remove(engine.world, deck[currentCard]);
            // World.remove(engine.world, deck[compareCard]);
            //
            // deck.splice(currentCard, 1);
            // deck.splice(compareCard, 1);
          }
          currentCard = -1;
          compareCard = -1;
        }
        else {
          currentCard = i;
        }
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
        ctx.fillStyle = COLORS[body.collisionFilter.category];
        ctx.beginPath();
        vertices = body.vertices;
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
  )();
});
