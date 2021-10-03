window.addEventListener('load', () => {
    console.log('loaded');
    const game = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    game.id = 'game';
    game.setAttribute("viewBox", '0 0 1600 900');
    document.body.appendChild(game);

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

        console.log()
    }
    window.addEventListener('resize', resize);
    resize();

    let grabbed = null;

    const grab = (pair, position, element) => (ev) => {
        if(!grabbed && !pair.resolving){
            element.classList.add('dragging');
            grabbed = {
                pair, position, element,
                x: ev.clientX,
                y: ev.clientY
            };

        }
    }

    const release = (ev) => {
        if(grabbed){
            grabbed.element.classList.remove('dragging');
            grabbed = null;
        }
    }

    const drag = (ev) => {
        if(grabbed){
            const mx = ev.clientX - grabbed.x;
            const my = ev.clientY - grabbed.y;
            grabbed.position.x += mx * scale;
            grabbed.position.y += my * scale;
            grabbed.x = ev.clientX;
            grabbed.y = ev.clientY;

            const dx = grabbed.pair.leftPos.x - grabbed.pair.rightPos.x;
            const dy = grabbed.pair.leftPos.y - grabbed.pair.rightPos.y;
            const distanceSq = dx*dx + dy*dy;
            if(distanceSq < 400){
                grabbed.pair.leftPos.x -= dx/2;
                grabbed.pair.rightPos.x += dx/2;
                grabbed.pair.leftPos.y -= dy/2;
                grabbed.pair.rightPos.y += dy/2;

                grabbed.pair.resolving = 1;
                release();
            }
        }
    }

    game.addEventListener('mousemove', drag)
    game.addEventListener('mouseup', release)

    const r = 50;
    const d1 = 25

    const cracks = [
        `L 0 ${r}`,
        `L 0 -${d1} L -${d1} 0 L 0 ${d1} L 0 ${r}`,
        `L 0 -${d1} L ${d1} 0 L 0 ${d1} L 0 ${r}`,
        `L 0 -${d1} L -${d1} -${d1} L -${d1} ${d1} L 0 ${d1} L 0 ${r}`,
        `L 0 -${d1} L ${d1} -${d1} L ${d1} ${d1} L 0 ${d1} L 0 ${r}`,
    ]
    let firstPair = true;
    let pairs = [];
    function spawnPair(index) {
        const crack = cracks[index];

        const leftPos = firstPair ? {x: 700, y: 450} : {x: Math.random()*1400 + 100, y: Math.random()*600 + 100};

        const leftHidden = document.createElementNS('http://www.w3.org/2000/svg', 'path'); 
        leftHidden.setAttribute('d', `M 0 -${r} L 0 ${r} A ${r} ${r} 180 1 1 0 -${r} z`);
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
        rightHidden.setAttribute('d', `M 0 ${r} A ${r} ${r} 180 1 0 0 -${r} L 0 ${r} z`);
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
            group
        }
        pairs.push(pair);

        left.addEventListener('mousedown', grab(pair, pair.leftPos, left));
        right.addEventListener('mousedown', grab(pair, pair.rightPos, right));

        firstPair = false;
    }

    let last = 0;
    let pairCount = 0;
    function animationFrame(time){
        const delta = time - last;
        last = time;
        if(pairs.length === 0){
            pairCount++;
            for(let i = 0; i < pairCount; i++){
                spawnPair(i);
            }
        }
        pairs = pairs.filter(pair => {            
            if(pair.resolving !== undefined){
                if(pair.resolving > 0){
                    const scale = Math.sqrt(pair.resolving);
                    pair.left.setAttribute('transform', `translate(${pair.leftPos.x} ${pair.leftPos.y}) scale(${scale}) `);
                    pair.right.setAttribute('transform', `translate(${pair.rightPos.x} ${pair.rightPos.y}) scale(${scale})`);
                    pair.resolving -= delta/1000;
                } else {
                    game.removeChild(pair.group);
                    return false
                }
            } else {
                pair.left.setAttribute('transform', `translate(${pair.leftPos.x} ${pair.leftPos.y})`);
                pair.right.setAttribute('transform', `translate(${pair.rightPos.x} ${pair.rightPos.y})`);
            }
            return true;
        });        
        window.requestAnimationFrame(animationFrame);
    }
    window.requestAnimationFrame(animationFrame);
});