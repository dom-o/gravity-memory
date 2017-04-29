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
  var NUM_CARDS= 10,
      NUM_CARD_GROUPS= 3,
      CARD_WIDTH= 70;
      CARD_HEIGHT= 100,
      DEFAULT_COLLISION= 0x0001;
      COLLS= [0x0002, 0x0004, 0x0008, 0x0010, 0x0020, 0x0040, 0x0080, 0x0100, 0x0200, 0x0400, 0x0800, 0x1000, 0x2000, 0x4000, 0x8000],
      COLORS= [
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
      ];

  var engine = Engine.create();
  // TODO: Scale gravity, number of cards, force of click with difficulty.
  engine.world.gravity.x = 0;
  engine.world.gravity.y = 0.05;
  var mouseConstraint = MouseConstraint.create(engine, {element: canvas});
  currentCard = null;
  compareCard = null;
  deck = [];
  for(i=0; i<NUM_CARDS; i++) {
    setTimeout(function(i) {
      card = Bodies.rectangle(canvas.width/2, canvas.height/2, CARD_WIDTH, CARD_HEIGHT);
      card.label = i % (NUM_CARDS/2);

      card.collisionFilter.category = COLLS[i%NUM_CARD_GROUPS];
      card.collisionFilter.mask = DEFAULT_COLLISION | COLLS[i%NUM_CARD_GROUPS];

      deck.push(card);
      World.add(engine.world, card);
      velocity= {
        x: utils.randNum(-5, 5),
        y: utils.randNum(-12, -10)
      };
      Body.setVelocity(card, velocity);
    }, 100*i, i)
  }

  offset=25;
  ground = [
    // Bodies.rectangle(canvas.width/2, -offset, canvas.width+2*offset, 50, { isStatic: true, friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1 }),
    Bodies.rectangle(-offset, canvas.height/2, 50, 3*canvas.height+2*offset, { friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1, isStatic: true }),
    Bodies.rectangle(canvas.width/2, canvas.height+5*CARD_HEIGHT, canvas.width+2*offset, 50, { friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1, isStatic: true }),
    Bodies.rectangle(canvas.width+offset, canvas.height/2, 50, 3*canvas.height+2*offset, { friction: 0, frictionAir: 0, frictionStatic: 0, restitution: 1, isStatic: true })
  ];
  World.add(engine.world, ground);

  Events.on(mouseConstraint, 'mouseup', function(event) {
    mousePos = event.mouse.position;
    for(i=deck.length-1; i>=0; i--) {
      if(Matter.Bounds.contains(deck[i].bounds, mousePos)) {
        card = deck[i];
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

          if(compareCard.label == currentCard.label && compareCard !== currentCard) {
            console.log('match! '+ compareCard.label + ' == ' +currentCard.label);
            World.remove(engine.world, currentCard);
            World.remove(engine.world, compareCard);

            deck.splice(deck.indexOf(currentCard), 1);
            deck.splice(deck.indexOf(compareCard), 1);
            console.log(deck);
            console.log(Composite.allBodies(engine.world));
          }
          else{
            console.log('no! '+ compareCard.label + ' != ' +currentCard.label);
          }
          currentCard = null;
          compareCard = null;
        }
        else {
          currentCard = card;
        }
        break;
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
        deck.includes(body) ? ctx.fillStyle = COLORS[i] : ctx.fillStyle = 'black';

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

        ctx.fillStyle = 'white';
        ctx.font = "50px arial";
        ctx.textAlign = "center";
        ctx.fillText(body.label, body.position.x, body.position.y);
      }
    }
  )();
});
