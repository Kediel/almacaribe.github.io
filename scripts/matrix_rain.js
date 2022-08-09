(function(caption) {
    var stepX, stepY,
    //screen grid width and height
    width, height, 
    doc, 
    //message to show
    message, messageLength, currentChar, getChar,
    messageLeft, messageRight, messageTop,
    //animation settings
    fallTime, delay, makeDelay,
    
    animationEnd, animationStart,
    
    isMessage = function(position) {
            return position >= messageLeft && position < messageRight;
    };

    //Create initials
    var init = function() {
        var docEl, math = Math, prefix = " |-moz-|-o-|-webkit-".split("|");
        doc = document;
        docEl = doc.documentElement;
        stepX = 10;
        stepY = 18;
        width = math.floor(docEl.clientWidth / stepX);
        height = math.ceil(docEl.clientHeight / stepY);
        message = caption.toUpperCase();
        messageLength = message.length;
        messageLeft = math.floor((width - messageLength)/2);
        messageRight = messageLeft + messageLength;
        messageTop = math.floor(height/2);
        currentChar = 0;
        getChar = function() {
            return message.charAt(currentChar++%messageLength);
        };
        
        fallTime = 1.4; //Total fall time approx twice the animation-duration
        delay = math.round(fallTime/height*100)/100; //animation delay between two adjacent letters
        
        makeDelay = function(position) {
            var time = position * delay + "s", buf = [];
            
            prefix.forEach(function(item) {
                buf.push(item, "animation-delay:", time, ";"); //join all browser-specific props
            });
            
            return buf.join("");
            
        };
        
        //BAD-BAD-BAD. Use modernizr instead of browser sniffing;
        var ua = window.navigator.userAgent;
        if(ua.indexOf("MSIE") > -1){
            animationEnd = "MSAnimationEnd";
            animationStart = "MSAnimationStart";
        }
        else if(ua.indexOf("Opera") > -1) {
            animationEnd = "oanimationend";
            animationStart = "oanimationstart";
        }
        else if(ua.indexOf("WebKit") > -1) {
            animationEnd = "webkitAnimationEnd";
            animationStart = "webkitAnimationStart";
        } 
        else { //FF and W3C
            animationEnd = "animationend";
            animationStart = "animationstart";
        }

        
    };

    //Column constructor
    var Column = function(options) {
            this.position = options.position;
            this.id = "column" + this.position;
            this.onDestroy = options.onDestroy;
            this.onStart = options.onStart;
            this.onStop = options.onStop;
        }, 
        columnProto = Column.prototype;
        
    /**
     * Render entire element content;
     */
    columnProto.render = function(){
        var body = document.body,
            buf = [], i = 0, len = height, 
            me = this, id = me.id;
            
        buf.push('<div class="column" id="', id, '" style="left:', me.position * stepX ,'px">');
        
        for(; i < len; i++) {
            buf.push('<div class="cell" style="', makeDelay(i), '">', me.getChar(i), '</div>');
        }
        
        buf.push('</div>');
        
        //append to body
        body.insertAdjacentHTML('beforeend', buf.join(""));
        
        //save current element
        me.element = doc.getElementById(id);
        me.element.lastElementChild.addEventListener(animationEnd, me.stop.bind(me), false);
    };
    
    /**
     * Get symbol by position
     */
    columnProto.getChar = function(i) {
        return String.fromCharCode(65 + Math.floor(Math.random()*21 + 1));
    };
    
    /**
     * Starts animation
     */
    columnProto.start = function() {                
        this.element.className += ' animated';
        this.isAnimated = true;
        var stub = this.onStart && this.onStart(this);
    };
    
    /**
     * Stops animation
     */
    columnProto.stop = function() {
        var element = this.element,
            className = element.className;
                
        element.className = className.replace(/\banimated\b/, '');
        
        this.isAnimated = false;
        var stub = this.onStop && this.onStop(this);
    };
    
    /**
     * Remove column from dom;
     */
    columnProto.destroy = function() {
        var me = this,
            element = me.element,
            onDestroy = me.onDestroy;
        element.parentNode.removeChild(element);
        //call destroy callback
        var stub = onDestroy && onDestroy(me);        
        
        element = me.element = me.onDestroy = null;
    };
    
    /**
     * Special message column
     * 
     */
    var MessageColumn = function(options) {
        Column.call(this, options);
    }, messageColumnProto;
    
    //Inherit MessageColumn from Column
    (function(){
        var F = function(){};
        F.prototype = Column.prototype;
        MessageColumn.prototype = messageColumnProto = new F();
        MessageColumn.prototype.constructor = MessageColumn;
    }());
    
    messageColumnProto.render = function(){
        var buf = [];
        columnProto.render.apply(this, arguments);
        
        buf.push('<div class="message" style="top:', messageTop*stepY, 'px; left:', this.position*stepX, 'px;" id="message', this.position ,'">', this.getChar(messageTop), '</div>');
        
        this.element.insertAdjacentHTML('afterend', buf.join(""));
        this.message = doc.getElementById("message"+ this.position);
        this.element.children[messageTop].addEventListener(animationStart, this.showMessage.bind(this), false);
    };
    
    messageColumnProto.showMessage = function(){
        if(this.isShown) {return;}
        this.isShown = true;
        this.message.className += " shown";
    };
    
    /**
     * Return message part for message row
     */
    messageColumnProto.getChar = function(i) {
        return i === messageTop ? message.charAt(this.position - messageLeft) : columnProto.getChar.apply(this, arguments);
    };
    
    
    
        
    init();
    var columns = {}, running = {}, messageColumnsOrder = [], columnsOrder = [];
    (function() {
        var i, len, column, 
        markAsRunning = function(column) {
            running[column.position] = 1;
        }, 
        markAsNonRunning = function(column) {
            delete running[column.position];
        },
        createColumn = function(position) {
            if (isMessage(position)) {
                messageColumnsOrder.push(i);
                return new MessageColumn({position: i, onStart: markAsRunning, onStop: markAsNonRunning });
            } 
            else {
                columnsOrder.push(i);
                return new Column({position: i, onStart: markAsRunning, onStop: markAsNonRunning });
            }                
        }, randomizer = function() {
            return 0.5 - Math.random();
        };
        for(i = 0, len = width; i < len; i++) {
            column = createColumn(i);
            columns[i] = column;
            column.render();
        }
        
        //randomize message columns
        messageColumnsOrder.sort(randomizer).sort(randomizer);
        
        //randomize simple columns
        for(i = 0 ; i < 5; i++) {
            columnsOrder = columnsOrder.concat(columnsOrder);
        }
        columnsOrder.sort(randomizer).sort(randomizer);
        
        
    }());
    
    var currentStep = 1,
		//select column to animate
        selectColumn = function() {
			//messageColumn every 5 steps;
            return currentStep%5 === 0 ? messageColumnsOrder.pop() : columnsOrder.pop();
        },
		stopAnimation = function() {
			clearInterval(timer);
		},
		startAnimation = function(){
            var index, column;
            
            index = selectColumn();

			//no column found. 
            if(index === undefined) {stopAnimation(); return;}
            
            currentStep++;
            column = columns[index];
            var stub = column && column.start();
            
		},
        timer = setInterval(startAnimation, 100);
}("merry christmas"));

// CSS
@keyframes colored
{
    0% {color: #FFF;}
    50% {color: #0F0;}
    100% {color: #000;}    
}

@-moz-keyframes colored
{
    0% {color: #FFF;}
    50% {color: #0F0;}
    100% {color: #000;}    
}

@-o-keyframes colored
{
    0% {color: #FFF;}
    50% {color: #0F0;}
    100% {color: #000;}    
}

@-webkit-keyframes colored
{
    0% {color: #FFF;}
    50% {color: #0F0;}
    100% {color: #000;}    
}

.animated {
    
}

body {
    margin: 0;
    border: 0;
    padding: 0;
    background-color: #000;
    color: #000;
    font-size: 1em;
    font-family: Consolas, monospace;
    overflow: hidden;
}

.column {
    position: fixed;
    width: 10px;
    height: 100%;
    oveflow: visible;
}

.cell {
    width: 10px;
    height: 18px;
}

.animated > .cell {
	animation-name: colored;
    animation-duration: 1s;
    animation-timing-function: linear;

    -moz-animation-name: colored;
    -moz-animation-duration: 1s;
    -moz-animation-timing-function: linear;
    
    -o-animation-name: colored;
    -o-animation-duration: 1s;
    -o-animation-timing-function: linear;
    
    -webkit-animation-name: colored;
    -webkit-animation-duration: 0.7s;
    -webkit-animation-timing-function: linear;
}

.message {
	position: fixed;
	z-index: 10;
}

.shown {
	color: #FFF;
    background-color: #000;
}
