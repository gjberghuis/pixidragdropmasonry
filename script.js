let app;
let container;
let stage;
let items = [];
let containerItems = [];

document.addEventListener("DOMContentLoaded", function(){
    let type = "WebGL"
    if(!PIXI.utils.isWebGLSupported()){
      type = "canvas"
    }
    
    // create the root of the scene graph
    stage = new PIXI.Container();
    let viewCanvas = document.getElementById('app');
    
    app = new PIXI.Application( { view: viewCanvas });    
    app.renderer.backgroundColor = 0x061639;
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoResize = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);
    
    drawContainer();
    //drawItems();
    drawTextItems();
    animate();
});


function animate() {
    requestAnimationFrame(() => {
        animate();
    });
    app.render(stage);
}

function drawTextItems() {
    let items = ['Voert het opsporingsonderzoek uit.',
    'Maakt een proces-verbaal van het opsporingsonderzoek.',
    'Heeft de leiding in het opsporingsonderzoek.',
    'Beslist of een verdachte voor de rechter moet verschijnen.',
    'Eist een bepaalde straf voor de verdachte.',
    'Beslist of een verdachte schuldig is.',
    'Legt eventueel een straf op.',
    'Probeert aan te tonen dat de verdachte onschuldig is.',
    'Probeert ervoor te zorgen dat de straf van de verdachte zo laag mogelijk is.'
    ];

    let offsetX = window.innerWidth / 2;
    let offsetY = 50;
    items.forEach(item => {
       let textContainer = _drawText(item, offsetX, offsetY, getRandomColor());

       offsetY = textContainer.position.y + textContainer.height + 10;
    });
}

function _drawText(text, x = window.innerWidth / 2, y = 50, color = '#ff8000') {
    const textSprite = new PIXI.Text(text, { fill: color });
    textSprite.x = 5;
    textSprite.y = 5;

    const txtBg = new PIXI.Sprite(PIXI.Texture.WHITE);
    txtBg.width = textSprite.width + 10, txtBg.height = textSprite.height + 10;

    const container = new PIXI.Container();
    container.x = x;
    container.cursor = 'hand';
    container.y = y;
    container.interactive = true;
    container.addChild(txtBg, textSprite);
    container.on('mousedown', onDragStart)
    .on('touchstart', onDragStart)
    .on('mouseup', onDragEnd)
    .on('mouseupoutside', onDragEnd)
    .on('touchend', onDragEnd)
    .on('touchendoutside', onDragEnd)
    // events for drag move
    .on('mousemove', onDragMove)
    .on('touchmove', onDragMove);

    app.stage.addChild(container);

    return container;
}

function drawContainer() {
    let graphics = new PIXI.Graphics();
    
    // Container
    graphics.beginFill(0x5F9EA0);
    graphics.drawRect(50, 50, 300, 100);
    graphics.endFill();

    let containerTexture = app.renderer.generateTexture(graphics);
    container = new PIXI.Sprite(containerTexture);
    container.position.x = 50;    
    container.position.y = 50;

    container.on('mousedown', onDragStart)
                    .on('touchstart', onDragStart)
                    .on('mouseup', onDragEnd)
                    .on('mouseupoutside', onDragEnd)
                    .on('touchend', onDragEnd)
                    .on('touchendoutside', onDragEnd)
                    // events for drag move
                    .on('mousemove', onDragMove)
                    .on('touchmove', onDragMove);

    app.stage.addChild(container);
  
}

function drawItems() {
   _drawItem(window.innerWidth / 2, 50, 200, 200, getRandomColor('0x'));
   _drawItem(window.innerWidth / 2, 350, 200, 200, getRandomColor('0x'));
   _drawItem(window.innerWidth / 2  + 250, 50, 200, 200, getRandomColor('0x'));
   _drawItem(window.innerWidth / 2 + 250, 350, 200, 200,  getRandomColor('0x'));   
   _drawItem(window.innerWidth / 2, 650, 200, 200, getRandomColor('0x'));
   _drawItem(window.innerWidth / 2, 950, 200, 200, getRandomColor('0x'));
   _drawItem(window.innerWidth / 2  + 250, 650, 200, 200, getRandomColor('0x'));
   _drawItem(window.innerWidth / 2 + 250, 950, 200, 200,  getRandomColor('0x'));   
}

function _drawItem(x, y, width, height, color = 0xffffff) {
    let graphics = new PIXI.Graphics();

    graphics.beginFill(color);
    graphics.drawRect(x, y, height, width);
    graphics.endFill();
    
    let itemTexture = app.renderer.generateTexture(graphics);
    let itemSprite = new PIXI.Sprite(itemTexture);
    itemSprite.x = x;
    itemSprite.y = y;
    itemSprite.interactive = true;
    itemSprite.cursor = 'wait';
    itemSprite.anchor.set(0.5);  
    itemSprite.position.x = x + (width / 2);    
    itemSprite.position.y = y + (height / 2);

    itemSprite.on('mousedown', onDragStart)
                    .on('touchstart', onDragStart)
                    .on('mouseup', onDragEnd)
                    .on('mouseupoutside', onDragEnd)
                    .on('touchend', onDragEnd)
                    .on('touchendoutside', onDragEnd)
                    // events for drag move
                    .on('mousemove', onDragMove)
                    .on('touchmove', onDragMove);

    app.stage.addChild(itemSprite);
}


function onDragStart(event)
{
    this.data = event.data;
    this.alpha = 0.5;
    this.dragging = true;
}

function onDragEnd()
{
    this.alpha = 1;
    this.dragging = false;
 
    _checkCollisionWithContainer(this);

    let itemMarginInContainer = 10;
    let itemsTotalWidth = 0;
    let itemsTotalHeight = 0;
    let maxContainerWidth = window.innerWidth;
    let itemsInContainerOffset = {
        x: 0,
        y: 0
    }
    let counter = 0;
    let highestWidth = 0;

    itemsInContainerOffset.y = itemMarginInContainer + container.position.y; 

    containerItems.forEach(item => {
        let itemPositionX = 0;
        let itemPositionY = 0;

        if (counter === 0) {
            itemPositionX = container.position.x + itemMarginInContainer; 
            itemPositionY = container.position.y + itemMarginInContainer;
            itemsTotalHeight = item.height;
        } else {
            itemPositionX = itemMarginInContainer + itemsInContainerOffset.x;

            // Check if we need to create a new row
            if ((itemsTotalWidth + item.width) > (maxContainerWidth / 2 + 10)) {
                itemPositionY = itemMarginInContainer + itemsInContainerOffset.y + item.height;
                itemPositionX = container.position.x + itemMarginInContainer;
      
                itemsTotalWidth = 0;
                itemsInContainerOffset.y = item.position.y;
                itemsTotalHeight += item.height + itemMarginInContainer;
            } else {
                itemPositionY = itemsInContainerOffset.y;
            }
        }

        itemsTotalWidth += item.width + 10;
        if (itemsTotalWidth > highestWidth) {
            highestWidth = itemsTotalWidth
        }

        // Aanpassen van de container
        if (highestWidth > (maxContainerWidth / 2 + 10)) {
           // Dit zorgt ervoor dat de container niet breder kan worden dan de helft van het scherm
            
        } else {
            container.width = highestWidth !== 0 ? highestWidth + 10 : itemsTotalWidth + 10;
            container.height = itemsTotalHeight + (itemMarginInContainer * 2);
            container.position.x = 50;            
        }

        item.position.x = itemPositionX;
        item.position.y = itemPositionY;
      
        itemsInContainerOffset.x = item.position.x + item.width;

        counter++;
    });
}

function _checkCollisionWithContainer(item) {
    let itemLeftX = item.position.x - item.width / 2;
    let itemRightX = itemLeftX + item.width; 
    let itemTopY = item.position.y - item.height / 2;
    let itemBottomY = itemTopY + item.height;

    let isInHorizontalRange = false;
    if (itemLeftX => container.position.x && itemLeftX <= container.position.x) {
        isInHorizontalRange = true;
    } else if (itemRightX => container.position.x && itemRightX <= container.position.x) {
        isInHorizontalRange = true;
    }

    let isInVerticalRange = false;
    if (itemTopY => container.position.y && itemTopY <= container.position.y) {
        isInVerticalRange = true;
    } else if (itemBottomY => container.position.y && itemBottomY <= container.position.y) {
        isInVerticalRange = true;
    }

    if (isInVerticalRange && isInHorizontalRange) {
        containerItems.push(item);
    }
}

function onDragMove()
{
    if (this.dragging)
    {
        var newPosition = this.data.getLocalPosition(this.parent);
        this.position.x = newPosition.x;
        this.position.y = newPosition.y;
    }
}

/* UTIL */
function getRandomColor(prefix = '#') {
    var letters = '0123456789ABCDEF';
    var color = prefix;
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
