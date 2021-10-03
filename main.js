window.addEventListener('load', () => {
    let boom = false;

    const game = document.getElementById('game');
    game.setAttribute('viewBox', '0 0 1600 900');

    const scoreElement = document.getElementById('score');

    let scale = 1;
    function resize(){
        const docHeight = document.documentElement.clientHeight;
        const docWidth = document.documentElement.clientWidth;

        const gameHeight = Math.floor(Math.min(docHeight, docWidth*9/16)/9)*9;
        const gameWidth = gameHeight * 16/9;

        scale = 900/gameHeight;

        const gameLeft = Math.floor((docWidth-gameWidth)/2);
        const gameTop = Math.floor((docHeight-gameHeight)/2);

        game.style.height = gameHeight + 'px';
        game.style.width = gameWidth + 'px';
        game.style.left = gameLeft + 'px';
        game.style.top = gameTop + 'px';

        document.body.style.fontSize = `${1/scale * 50}px`;
    }
    window.addEventListener('resize', resize);
    resize();

    const overlay = document.getElementById('overlay');
    const titleEL = document.getElementById('title');
    const contentEl = document.getElementById('content');

    let messageCb = () => {};
    function showMessage(title, message, cb) {
        overlay.style.display = 'block';
        titleEL.textContent = title;
        contentEl.textContent = message;
        if(cb){messageCb = cb};
    }
    document.getElementById('messageBtn').addEventListener('click', () => {
        overlay.style.display = 'none';
        messageCb();
    })

    const sounds = {
        connect: new Howl({src: 'sounds/connect2.wav'})
    }

    let grabbed = null;

    const grab = (pair, position, element, isTouch) => (ev) => {
        if(!boom && !grabbed && !pair.resolving){
            element.classList.add('dragging');
            grabbed = {
                pair, position, element,
                x: (isTouch ? ev.changedTouches[0] : ev).clientX,
                y: (isTouch ? ev.changedTouches[0] : ev).clientY
            };
            ev.preventDefault();
        }
    }

    const release = (ev) => {
        if(grabbed){
            grabbed.element.classList.remove('dragging');
            grabbed = null;
            ev && ev.preventDefault();
        }
    }

    const drag = isTouch => (ev) => {
        if(!boom && grabbed){
            const mx = (isTouch ? ev.changedTouches[0] : ev).clientX - grabbed.x;
            const my = (isTouch ? ev.changedTouches[0] : ev).clientY - grabbed.y;
            grabbed.position.x += mx * scale;
            grabbed.position.y += my * scale;
            grabbed.x = (isTouch ? ev.changedTouches[0] : ev).clientX;
            grabbed.y = (isTouch ? ev.changedTouches[0] : ev).clientY;

            const dx = grabbed.pair.leftPos.x - grabbed.pair.rightPos.x;
            const dy = grabbed.pair.leftPos.y - grabbed.pair.rightPos.y;
            const distanceSq = dx*dx + dy*dy;
            if(distanceSq < 900){
                grabbed.pair.leftPos.x -= dx/2;
                grabbed.pair.rightPos.x += dx/2;
                grabbed.pair.leftPos.y -= dy/2;
                grabbed.pair.rightPos.y += dy/2;

                grabbed.pair.resolving = 1;
                sounds.connect.play();
                release();
            }
            ev.preventDefault();
        }
    }

    game.addEventListener('mousemove', drag())
    game.addEventListener('touchmove', drag(true))
    game.addEventListener('mouseup', release)
    game.addEventListener('touchend', release)

    const r = 50;    
    const d = r/2;

    const c = r/6;
    const p = r - 3*c
    const o = r - 2*c;
    const m = (c+o)/2;

    const cracks = [
        `L 0 ${r}`,

        //singles left
        `L 0 -${d} L -${d} 0 L 0 ${d} L 0 ${r}`,    
        `L 0 -${d} L -${d} -${d} L -${d} ${d} L 0 ${d} L 0 ${r}`,        
        `L 0 -${d} A ${d} ${d} 180 1 0 0 ${d} L 0 ${r}`,
        
        //doubles left
        `L 0 -${o} L -${p} -${m} L 0 -${c} L 0 ${c} L -${p} ${m} L 0 ${o} L 0 ${r}`,
        `L 0 -${o} L -${p} -${o} L -${p} -${c} L 0 -${c} L 0 ${c} L -${p} ${c} L -${p} ${o} L 0 ${o} L 0 ${r}`,        
        `L 0 -${o} A ${c} ${c} 180 1 0 0 -${c} L 0 ${c} A ${c} ${c} 180 1 0 0 ${o} L 0 ${r}`,        

        //singles right
        `L 0 -${d} L ${d} 0 L 0 ${d} L 0 ${r}`,
        `L 0 -${d} L ${d} -${d} L ${d} ${d} L 0 ${d} L 0 ${r}`,
        `L 0 -${d} A ${d} ${d} 180 1 1 0 ${d} L 0 ${r}`,

        //doubles right
        `L 0 -${o} L ${p} -${m} L 0 -${c} L 0 ${c} L ${p} ${m} L 0 ${o} L 0 ${r}`,
        `L 0 -${o} L ${p} -${o} L ${p} -${c} L 0 -${c} L 0 ${c} L ${p} ${c} L ${p} ${o} L 0 ${o} L 0 ${r}`,
        `L 0 -${o} A ${c} ${c} 180 1 1 0 -${c} L 0 ${c} A ${c} ${c} 180 1 1 0 ${o} L 0 ${r}`,

        //doubles mixed
        `L 0 -${o} L -${p} -${m} L 0 -${c} L 0 ${c} L ${p} ${m} L 0 ${o} L 0 ${r}`,
        `L 0 -${o} L -${p} -${o} L -${p} -${c} L 0 -${c} L 0 ${c} L ${p} ${c} L ${p} ${o} L 0 ${o} L 0 ${r}`,
        `L 0 -${o} A ${c} ${c} 180 1 0 0 -${c} L 0 ${c} A ${c} ${c} 180 1 1 0 ${o} L 0 ${r}`,

        `L 0 -${o} L ${p} -${m} L 0 -${c} L 0 ${c} L -${p} ${m} L 0 ${o} L 0 ${r}`,
        `L 0 -${o} L ${p} -${o} L ${p} -${c} L 0 -${c} L 0 ${c} L -${p} ${c} L -${p} ${o} L 0 ${o} L 0 ${r}`,
        `L 0 -${o} A ${c} ${c} 180 1 1 0 -${c} L 0 ${c} A ${c} ${c} 180 1 0 0 ${o} L 0 ${r}`,
    ]

    const maxTimer = 15000;
    let firstPair = true;
    let pairs = [];
    function spawnPair(index) {                
        const crack = cracks[index];
        const b = 20;

        const leftPos = firstPair ? {x: 700, y: 450} : {x: Math.random()*1400 + 100, y: Math.random()*600 + 100};

        const leftHidden = document.createElementNS('http://www.w3.org/2000/svg', 'path'); 
        leftHidden.setAttribute('d', `M ${b} -${r+b} L ${b} ${r+b} A ${r+2*b} ${r+b} 180 1 1 ${b} -${r+b} z`);
        leftHidden.classList.add('hidden');
        const leftPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        leftPath.setAttribute('d', `M 0 -${r} ${crack} A ${r} ${r} 180 1 1 0 -${r} z`);
        
        const left  = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        left.appendChild(leftHidden);
        left.appendChild(leftPath);
        left.classList.add('half');
        left.setAttribute('pointer-events', 'all');

        const rightPos = firstPair ? {x: 900, y: 450} : {x: Math.random()*1400 + 100, y: Math.random()*600 + 100};

        const rightHidden = document.createElementNS('http://www.w3.org/2000/svg', 'path');         
        rightHidden.setAttribute('d', `M -${b} ${r+b} A ${r+2*b} ${r+b} 180 1 0 -${b} -${r+b} L -${b} ${r+b} z`);
        rightHidden.classList.add('hidden');
        const rightPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        rightPath.setAttribute('d', `M 0 ${r} A ${r} ${r} 180 1 0 0 -${r} ${crack} z`);

        const right  = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        right.appendChild(rightHidden);
        right.appendChild(rightPath);
        right.classList.add('half');
        right.setAttribute('pointer-events', 'all');

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.appendChild(left);
        group.appendChild(right);

        game.appendChild(group);

        const pair = {
            left,
            leftPos,
            right,
            rightPos: rightPos,
            group,
            index,
            timer: maxTimer,
            color: Math.floor(Math.random() * 256)
        }
        pairs.push(pair);

        left.addEventListener('mousedown', grab(pair, pair.leftPos, left));
        left.addEventListener('touchstart', grab(pair, pair.leftPos, left, true));
        right.addEventListener('mousedown', grab(pair, pair.rightPos, right));
        right.addEventListener('touchstart', grab(pair, pair.rightPos, right, true));

        firstPair = false;
    }
    spawnPair(0);

    function shake(pos, radius){
        return pos + Math.random() * radius - radius;
    }

    let matchCount = 0;
    let score = 0;

    let lastTime = 0;
    function animationFrame(time){
        const delta = time - lastTime;
        lastTime = time;
        if(matchCount >= 10){
            matchCount -= 10;
            if(pairs.length >= cracks.length){
                showMessage('You won!.', `I have no idea how you did it, but you managed to keep up with all the shapes I made. Your score was ${score}.`, ()=>{
                    window.location.reload();
                })
                return;
            }
            spawnPair(pairs.length);
        }
        pairs.forEach(pair => {            
            if(pair.resolving > 0){
                    const scale = Math.sqrt(pair.resolving);
                    pair.left.setAttribute('transform', `translate(${pair.leftPos.x} ${pair.leftPos.y}) scale(${scale}) `);
                    pair.right.setAttribute('transform', `translate(${pair.rightPos.x} ${pair.rightPos.y}) scale(${scale})`);
                    pair.resolving -= delta/1000;
            } else {
                if (pair.resolving <= 0) {
                    score += Math.round(pair.timer);
                    scoreElement.textContent = score;
                    matchCount += 1;

                    pair.leftPos.x = Math.random()*1400 + 100;
                    pair.leftPos.y = Math.random()*600 + 100;

                    pair.rightPos.x = Math.random()*1400 + 100;
                    pair.rightPos.y = Math.random()*600 + 100;

                    pair.timer = maxTimer;

                    delete pair.resolving;
                } else if (pair.timer <= 0){
                    release();
                    boom = true;
                    showMessage('You lost.', `The unstable halves exploded before you recombined them. Your score was ${score}.`, ()=>{
                        window.location.reload();
                    })
                } else {
                    pair.timer -= delta;
                }
                const timeFactor = (maxTimer - pair.timer)/maxTimer;
                const shakeRadius = 10 * timeFactor;
                pair.group.style.fill = `hsl(${pair.color} 100% ${timeFactor*100}%)`;

                pair.left.setAttribute('transform', `translate(${shake(pair.leftPos.x, shakeRadius)} ${shake(pair.leftPos.y, shakeRadius)})`);
                pair.right.setAttribute('transform', `translate(${shake(pair.rightPos.x, shakeRadius)} ${shake(pair.rightPos.y, shakeRadius)})`);
            }
        });
        if(!boom){
            window.requestAnimationFrame(animationFrame);
        }
    }
    window.requestAnimationFrame(animationFrame);
});