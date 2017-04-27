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
  var NUM_CARDS= 6,
      CARD_WIDTH= 70;
      CARD_HEIGHT= 100;

  var engine = Engine.create();
  engine.world.gravity.x = 0;
  engine.world.gravity.y = 0.05;
  var mouseConstraint = MouseConstraint.create(engine, {element: canvas});
  currentCard = -1;
  compareCard = -1;
  deck = [];
  for(i=0; i<NUM_CARDS; i++) {
    setTimeout(function() {
      card = Bodies.rectangle(canvas.width/2, 0, CARD_WIDTH, CARD_HEIGHT);
      deck.push(card);
      World.add(engine.world, card);

      velocity= {
        x: utils.randNum(-1, 1),
        y: utils.randNum(0.5, 2)
      };
      Body.setVelocity(card, velocity);
    }, 100*i)
  }

  Events.on(mouseConstraint, 'mouseup', function(event) {
    mousePos = event.mouse.position;
    force = {
      x: 0,
      y: -0.1
    }
    for(i=0; i<deck.length; i++) {
      if(Matter.Bounds.contains(deck[i].bounds, mousePos)) {
        Body.applyForce(deck[i], mousePos, force);
        if(currentCard != -1) {
          compareCard = i;

          currentCard%2 === 0
          ?
            match = (currentCard+1 == compareCard)
          :
            match = (currentCard-1 == compareCard);

          if(match) {
            World.remove(engine.world, deck[currentCard]);
            World.remove(engine.world, deck[compareCard]);

            deck.splice(currentCard, 1);
            deck.splice(compareCard, 1);
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
