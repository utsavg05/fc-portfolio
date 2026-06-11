(function(){
    const canvas = document.getElementById('three-bg');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x081a08, 0.012);

    const camStart = {x:3.5, y:1.6, z:4.5};
    const camEnd = {x:12, y:12, z:14};
    const lookStart = {x:1.2, y:1.0, z:0};
    const lookEnd = {x:0, y:0, z:0};

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 200);
    camera.position.set(camStart.x, camStart.y, camStart.z);

    const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x081a08);

    // ── LIGHTS ──
    scene.add(new THREE.AmbientLight(0x336633, 1.2));
    const sun = new THREE.DirectionalLight(0xfff8e0, 1.8);
    sun.position.set(6,14,8); sun.castShadow=true;
    sun.shadow.camera.left=-14; sun.shadow.camera.right=14;
    sun.shadow.camera.top=10; sun.shadow.camera.bottom=-10;
    sun.shadow.mapSize.set(2048,2048);
    scene.add(sun);

    const spotChar = new THREE.SpotLight(0xfff5d0, 4, 25, Math.PI/5, 0.3, 0.8);
    spotChar.position.set(2, 6, 3);
    spotChar.target.position.set(1, 0, 0);
    spotChar.castShadow=true;
    scene.add(spotChar); scene.add(spotChar.target);

    const rimLight = new THREE.PointLight(0x66bbff, 2, 10, 1.5);
    rimLight.position.set(-1, 3, -2);
    scene.add(rimLight);

    const groundGlow = new THREE.PointLight(0x33ff44, 1.5, 8, 2);
    groundGlow.position.set(1, 0.2, 0.5);
    scene.add(groundGlow);

    function addFlood(x,z){
        const g=new THREE.Group();
        const pole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.1,14,6),new THREE.MeshLambertMaterial({color:0x333333}));
        pole.position.set(0,7,0); g.add(pole);
        const h=new THREE.Mesh(new THREE.BoxGeometry(1.2,.4,.4),new THREE.MeshLambertMaterial({color:0xffffee,emissive:0xffff66,emissiveIntensity:.5}));
        h.position.y=14; g.add(h);
        const l=new THREE.PointLight(0xfff5d0,1.5,35,1.5); l.position.y=14; g.add(l);
        g.position.set(x,0,z); scene.add(g);
    }
    addFlood(-9,-8); addFlood(9,-8); addFlood(-9,8); addFlood(9,8);

    // ── FIELD ──
    function makeFieldTex(){
        const c=document.createElement('canvas'), W=1024, H=732;
        c.width=W; c.height=H;
        const x=c.getContext('2d');
        for(let i=0;i<16;i++){x.fillStyle=i%2?'#1d8a28':'#1a7a22'; x.fillRect(0,i*(H/16),W,H/16)}
        x.strokeStyle='rgba(255,255,255,.75)'; x.lineWidth=3; x.fillStyle='rgba(255,255,255,.75)';
        const m=30;
        x.strokeRect(m,m,W-2*m,H-2*m);
        x.beginPath(); x.moveTo(m,H/2); x.lineTo(W-m,H/2); x.stroke();
        x.beginPath(); x.arc(W/2,H/2,85,0,Math.PI*2); x.stroke();
        x.beginPath(); x.arc(W/2,H/2,4,0,Math.PI*2); x.fill();
        const pw=340,ph=130,gw=180,gh=55;
        x.strokeRect((W-pw)/2,m,pw,ph); x.strokeRect((W-pw)/2,H-m-ph,pw,ph);
        x.strokeRect((W-gw)/2,m,gw,gh); x.strokeRect((W-gw)/2,H-m-gh,gw,gh);
        x.beginPath(); x.arc(W/2,m+100,4,0,Math.PI*2); x.fill();
        x.beginPath(); x.arc(W/2,H-m-100,4,0,Math.PI*2); x.fill();
        x.beginPath(); x.arc(W/2,m+100,75,.3*Math.PI,.7*Math.PI); x.stroke();
        x.beginPath(); x.arc(W/2,H-m-100,75,1.3*Math.PI,1.7*Math.PI); x.stroke();
        [[m,m,0],[W-m,m,Math.PI/2],[W-m,H-m,Math.PI],[m,H-m,1.5*Math.PI]].forEach(([cx,cy,a])=>{
            x.beginPath(); x.arc(cx,cy,14,a,a+Math.PI/2); x.stroke();
        });
        return new THREE.CanvasTexture(c);
    }
    const fTex=makeFieldTex(); fTex.anisotropy=renderer.capabilities.getMaxAnisotropy();
    const fieldMesh=new THREE.Mesh(new THREE.PlaneGeometry(16,11.4),new THREE.MeshLambertMaterial({map:fTex}));
    fieldMesh.rotation.x=-Math.PI/2; fieldMesh.receiveShadow=true; scene.add(fieldMesh);

    const outer=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshLambertMaterial({color:0x0d3a0d}));
    outer.rotation.x=-Math.PI/2; outer.position.y=-0.01; scene.add(outer);

    // ── STADIUM STANDS ──
    const standMat=new THREE.MeshLambertMaterial({color:0x111120});
    function addStandRow(len,axis,pos,rotY){
        const g=new THREE.Group();
        for(let r=0;r<5;r++){
            const w=axis==='x'?len:1.2, d=axis==='z'?len:1.2;
            const row=new THREE.Mesh(new THREE.BoxGeometry(w,.35,d),standMat);
            const off=axis==='x'?0:((pos>0?1:-1)*r*.5);
            const offZ=axis==='z'?0:((pos>0?1:-1)*r*.5);
            row.position.set(axis==='z'?off:0, r*.45+.18, axis==='x'?offZ:0);
            g.add(row);
        }
        if(axis==='x') g.position.set(0,0,pos);
        else g.position.set(pos,0,0);
        scene.add(g);
    }
    addStandRow(16,'x',-7.5,0); addStandRow(16,'x',7.5,0);
    addStandRow(11,'z',-9.5,0); addStandRow(11,'z',9.5,0);

    // Crowd (colored points on stands)
    function addCrowd(xRange,yRange,zRange,count){
        const geo=new THREE.BufferGeometry();
        const pos=new Float32Array(count*3), cols=new Float32Array(count*3);
        for(let i=0;i<count;i++){
            pos[i*3]=xRange[0]+Math.random()*(xRange[1]-xRange[0]);
            pos[i*3+1]=yRange[0]+Math.random()*(yRange[1]-yRange[0]);
            pos[i*3+2]=zRange[0]+Math.random()*(zRange[1]-zRange[0]);
            const c=new THREE.Color().setHSL(Math.random(),.5,.3+Math.random()*.15);
            cols[i*3]=c.r; cols[i*3+1]=c.g; cols[i*3+2]=c.b;
        }
        geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
        geo.setAttribute('color',new THREE.BufferAttribute(cols,3));
        scene.add(new THREE.Points(geo,new THREE.PointsMaterial({size:.15,vertexColors:true})));
    }
    addCrowd([-7,7],[.5,2.8],[-8.5,-7],200);
    addCrowd([-7,7],[.5,2.8],[7,8.5],200);
    addCrowd([-10.5,-8.5],[.5,2.8],[-5,5],120);
    addCrowd([8.5,10.5],[.5,2.8],[-5,5],120);

    // ── GOALS ──
    function makeGoal(){
        const g=new THREE.Group(), m=new THREE.MeshPhongMaterial({color:0xffffff,specular:0x999999,shininess:40});
        const pH=2.44, pW=3.6;
        const lp=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,pH,8),m); lp.position.set(-pW/2,pH/2,0); g.add(lp);
        const rp=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,pH,8),m); rp.position.set(pW/2,pH/2,0); g.add(rp);
        const cb=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,pW,8),m);
        cb.rotation.z=Math.PI/2; cb.position.y=pH; g.add(cb);
        const nm=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.07,side:THREE.DoubleSide});
        const nb=new THREE.Mesh(new THREE.PlaneGeometry(pW,pH),nm); nb.position.set(0,pH/2,-.9); g.add(nb);
        const nt=new THREE.Mesh(new THREE.PlaneGeometry(pW,.9),nm); nt.position.set(0,pH,-.45); nt.rotation.x=Math.PI/2; g.add(nt);
        return g;
    }
    const g1=makeGoal(); g1.position.z=-5.7; scene.add(g1);
    const g2=makeGoal(); g2.position.z=5.7; g2.rotation.y=Math.PI; scene.add(g2);

    // ── BALL ──
    function makeBallTex(){
        const c=document.createElement('canvas'); c.width=256; c.height=256;
        const x=c.getContext('2d');
        x.fillStyle='#f0f0f0'; x.fillRect(0,0,256,256);
        x.fillStyle='#1a1a1a';
        function pent(cx,cy,r){x.beginPath();for(let i=0;i<5;i++){const a=i*2*Math.PI/5-Math.PI/2;i?x.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a)):x.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a))}x.closePath();x.fill()}
        pent(128,128,38); pent(55,55,26); pent(201,55,26); pent(55,201,26); pent(201,201,26);
        pent(128,25,22); pent(128,231,22); pent(25,128,22); pent(231,128,22);
        return new THREE.CanvasTexture(c);
    }
    const bTex=makeBallTex();
    function makeBall(r){return new THREE.Mesh(new THREE.SphereGeometry(r,24,24),new THREE.MeshPhongMaterial({map:bTex,specular:0x888888,shininess:30}))}

    const mainBall=makeBall(.2); mainBall.position.set(2,.2,.6); mainBall.castShadow=true; scene.add(mainBall);

    const floaters=[];
    [[-5,3.5,-3],[6,4,2.5],[-4,5,4],[7,3,-3],[-6,4.5,1],[4,6,-2],[0,7,0]].forEach(([bx,by,bz])=>{
        const b=makeBall(.1+Math.random()*.08);
        b.position.set(bx,by,bz);
        b.userData={rs:.006+Math.random()*.012,bs:.3+Math.random()*.7,bh:.25+Math.random()*.5,sy:by};
        scene.add(b); floaters.push(b);
    });

    // ── CHARACTER (joint-based for kick animation) ──
    const charGroup=new THREE.Group();
    const jMat=new THREE.MeshPhongMaterial({color:0x1a8020,specular:0x44aa44,shininess:8});
    const sMat=new THREE.MeshPhongMaterial({color:0xffffff,specular:0xcccccc,shininess:10});
    const bMat=new THREE.MeshPhongMaterial({color:0x111111,shininess:15});
    const skMat=new THREE.MeshPhongMaterial({color:0xc68642,specular:0x886644,shininess:12});
    const soMat=new THREE.MeshPhongMaterial({color:0x1a8020});
    const hairMat=new THREE.MeshPhongMaterial({color:0x111111});

    // Torso pivot
    const torsoGrp=new THREE.Group(); torsoGrp.position.y=1.15;
    const torsoMesh=new THREE.Mesh(new THREE.BoxGeometry(.44,.42,.24),jMat); torsoMesh.position.y=.2; torsoMesh.castShadow=true; torsoGrp.add(torsoMesh);
    const shoulderMesh=new THREE.Mesh(new THREE.BoxGeometry(.54,.09,.26),jMat); shoulderMesh.position.y=.38; torsoGrp.add(shoulderMesh);
    const numP=new THREE.Mesh(new THREE.PlaneGeometry(.14,.16),new THREE.MeshBasicMaterial({color:0xffd700})); numP.position.set(0,.24,.13); torsoGrp.add(numP);

    // Neck + Head
    const neckGrp=new THREE.Group(); neckGrp.position.y=.42;
    const neckM=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.08,8),skMat); neckM.position.set(0,.04,0); neckGrp.add(neckM);
    const headMesh=new THREE.Mesh(new THREE.SphereGeometry(.17,20,20),skMat); headMesh.position.y=.18; headMesh.castShadow=true; neckGrp.add(headMesh);
    const hairM=new THREE.Mesh(new THREE.SphereGeometry(.175,20,12,0,Math.PI*2,0,Math.PI*.55),hairMat); hairM.position.set(0,.2,0); neckGrp.add(hairM);
    torsoGrp.add(neckGrp);

    // Arms
    function makeArm(side){
        const armGrp=new THREE.Group(); armGrp.position.set(side*.3,.35,0);
        const upper=new THREE.Mesh(new THREE.CylinderGeometry(.042,.038,.34,8),jMat); upper.position.y=-.17; armGrp.add(upper);
        const elbowGrp=new THREE.Group(); elbowGrp.position.y=-.34;
        const fore=new THREE.Mesh(new THREE.CylinderGeometry(.036,.03,.3,8),skMat); fore.position.y=-.15; elbowGrp.add(fore);
        armGrp.add(elbowGrp);
        return {grp:armGrp, elbow:elbowGrp};
    }
    const leftArm=makeArm(-1); const rightArm=makeArm(1);
    leftArm.grp.rotation.set(-.3,0,.15); leftArm.elbow.rotation.x=-.5;
    rightArm.grp.rotation.set(-.3,0,-.15); rightArm.elbow.rotation.x=-.5;
    torsoGrp.add(leftArm.grp); torsoGrp.add(rightArm.grp);
    charGroup.add(torsoGrp);

    // Shorts
    const shortsMesh=new THREE.Mesh(new THREE.BoxGeometry(.42,.2,.24),sMat); shortsMesh.position.y=1.06; charGroup.add(shortsMesh);

    // Legs (with knee joints)
    function makeLeg(side){
        const hipGrp=new THREE.Group(); hipGrp.position.set(side*.1,1.0,0);
        const thigh=new THREE.Mesh(new THREE.CylinderGeometry(.065,.06,.3,8),skMat); thigh.position.y=-.15; hipGrp.add(thigh);
        const kneeGrp=new THREE.Group(); kneeGrp.position.y=-.3;
        const shin=new THREE.Mesh(new THREE.CylinderGeometry(.05,.042,.34,8),soMat); shin.position.y=-.17; kneeGrp.add(shin);
        const boot=new THREE.Mesh(new THREE.BoxGeometry(.11,.07,.18),bMat); boot.position.set(0,-.36,-.01); kneeGrp.add(boot);
        hipGrp.add(kneeGrp);
        return {hip:hipGrp, knee:kneeGrp};
    }
    const leftLeg=makeLeg(-1), rightLeg=makeLeg(1);
    charGroup.add(leftLeg.hip); charGroup.add(rightLeg.hip);

    charGroup.position.set(1.8,0,.3);
    charGroup.rotation.y=-.5;
    scene.add(charGroup);

    // ── PARTICLES ──
    const pGeo=new THREE.BufferGeometry(), pC=300, pPos=new Float32Array(pC*3);
    for(let i=0;i<pC*3;i+=3){pPos[i]=(Math.random()-.5)*24;pPos[i+1]=Math.random()*5;pPos[i+2]=(Math.random()-.5)*20}
    pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
    const pts=new THREE.Points(pGeo,new THREE.PointsMaterial({color:0x44cc44,size:.04,transparent:true,opacity:.3}));
    scene.add(pts);

    // ── CONFETTI (hidden until goal) ──
    const confGeo=new THREE.BufferGeometry(), confC=300, confPos=new Float32Array(confC*3), confCols=new Float32Array(confC*3), confVel=[];
    for(let i=0;i<confC;i++){
        confPos[i*3]=0; confPos[i*3+1]=-10; confPos[i*3+2]=0;
        const r=Math.random();
        const gold=r>.6, green=r>.3&&r<=.6;
        confCols[i*3]=gold?1:green?.2:1; confCols[i*3+1]=gold?.84:green?.85:.2; confCols[i*3+2]=gold?0:green?.15:.2;
        confVel.push({x:0,y:0,z:0,g:0});
    }
    confGeo.setAttribute('position',new THREE.BufferAttribute(confPos,3));
    confGeo.setAttribute('color',new THREE.BufferAttribute(confCols,3));
    const confetti=new THREE.Points(confGeo,new THREE.PointsMaterial({size:.18,vertexColors:true,transparent:true,opacity:0}));
    scene.add(confetti);
    let confActive=false, confTime=0;

    function triggerConfetti(){
        confActive=true; confTime=0;
        confetti.material.opacity=1;
        const p=confGeo.attributes.position.array;
        for(let i=0;i<confC;i++){
            p[i*3]=1+(Math.random()-.5)*4;
            p[i*3+1]=2+Math.random()*3;
            p[i*3+2]=(Math.random()-.5)*4;
            confVel[i].x=(Math.random()-.5)*8;
            confVel[i].y=4+Math.random()*8;
            confVel[i].z=(Math.random()-.5)*6;
            confVel[i].g=-.06-Math.random()*.06;
        }
        confGeo.attributes.position.needsUpdate=true;
    }

    // ── KICK ANIMATION ──
    let isSpeaking=true, kickDone=false;
    const kickTL=gsap.timeline({delay:1.8, onComplete:function(){kickDone=true}});
    // Approach step
    kickTL.to(leftLeg.hip.rotation,{x:-.2,duration:.3,ease:'power1.in'})
          .to(charGroup.position,{z:.0,duration:.3},'<')
    // Wind up — leg back, body tilts
          .to(rightLeg.hip.rotation,{x:.9,duration:.5,ease:'power2.in'})
          .to(rightLeg.knee.rotation,{x:-1.1,duration:.45,ease:'power2.in'},'<.05')
          .to(torsoGrp.rotation,{x:.12,z:-.06,duration:.45},'<')
          .to(leftArm.grp.rotation,{x:-1.0,z:.3,duration:.4},'<')
          .to(rightArm.grp.rotation,{x:.4,z:-.4,duration:.4},'<')
    // KICK — fast explosive forward swing
          .to(rightLeg.hip.rotation,{x:-1.1,duration:.15,ease:'power4.out'})
          .to(rightLeg.knee.rotation,{x:.3,duration:.12,ease:'power3.out'},'<.02')
          .to(torsoGrp.rotation,{x:-.1,z:.04,duration:.15},'<')
          .to(rightArm.grp.rotation,{x:-.8,z:.4,duration:.15},'<')
          .to(leftArm.grp.rotation,{x:.2,z:-.2,duration:.15},'<')
    // Ball launches in an arc toward the goal
          .to(mainBall.position,{x:.5,y:3.5,z:-2,duration:.5,ease:'power2.out'},'<')
          .to(mainBall.rotation,{x:15,y:10,duration:1.0,ease:'none'},'<')
          .to(mainBall.position,{x:0,y:1.2,z:-5.2,duration:.5,ease:'power2.in'})
    // GOAL! Confetti
          .call(triggerConfetti)
    // Celebration — arms up
          .to(rightLeg.hip.rotation,{x:0,duration:.4,ease:'power2.out'},'+=.1')
          .to(rightLeg.knee.rotation,{x:0,duration:.4,ease:'power2.out'},'<')
          .to(leftLeg.hip.rotation,{x:0,duration:.3},'<')
          .to(torsoGrp.rotation,{x:0,z:0,duration:.3},'<')
          .to(leftArm.grp.rotation,{x:-2.8,z:.4,duration:.4,ease:'back.out(2)'},'<')
          .to(rightArm.grp.rotation,{x:-2.8,z:-.4,duration:.4,ease:'back.out(2)'},'<')
          .to(leftArm.elbow.rotation,{x:-.3,duration:.3},'<.1')
          .to(rightArm.elbow.rotation,{x:-.3,duration:.3},'<')
    // Hold celebration pose
          .to({},{duration:1.2})
    // Lower arms back to idle
          .to(leftArm.grp.rotation,{x:-.3,z:.15,duration:.6,ease:'power2.inOut'})
          .to(rightArm.grp.rotation,{x:-.3,z:-.15,duration:.6,ease:'power2.inOut'},'<')
          .to(leftArm.elbow.rotation,{x:-.5,duration:.4},'<')
          .to(rightArm.elbow.rotation,{x:-.5,duration:.4},'<')
    // Ball reappear at feet
          .set(mainBall.position,{x:2,y:.2,z:.6});

    // ── MOUSE + SCROLL ──
    let mX=0,mY=0,tX=0,tY=0,scrollP=0;
    document.addEventListener('mousemove',function(e){mX=(e.clientX/window.innerWidth)*2-1;mY=(e.clientY/window.innerHeight)*2-1});
    window.addEventListener('scroll',function(){var m=document.body.scrollHeight-window.innerHeight;scrollP=m>0?window.scrollY/m:0});

    // ── RENDER ──
    const lookTarget=new THREE.Vector3();
    function animate(){
        requestAnimationFrame(animate);
        tX+=(mX*.8-tX)*.04; tY+=(mY*.5-tY)*.04;
        const p=Math.min(scrollP*2.5,1);
        camera.position.x=camStart.x+(camEnd.x-camStart.x)*p+tX*(1-p*.7);
        camera.position.y=camStart.y+(camEnd.y-camStart.y)*p+tY*.3*(1-p);
        camera.position.z=camStart.z+(camEnd.z-camStart.z)*p;
        lookTarget.set(
            lookStart.x+(lookEnd.x-lookStart.x)*p,
            lookStart.y+(lookEnd.y-lookStart.y)*p,
            lookStart.z+(lookEnd.z-lookStart.z)*p
        );
        camera.lookAt(lookTarget);

        const t=Date.now()*.001;
        if(kickDone) charGroup.position.y=Math.sin(t)*.012;
        if(isSpeaking){headMesh.rotation.x=Math.sin(t*3)*.06;headMesh.rotation.z=Math.sin(t*2)*.04}
        mainBall.rotation.y+=.004; mainBall.rotation.x+=.003;

        floaters.forEach(function(b){b.rotation.y+=b.userData.rs;b.rotation.x+=b.userData.rs*.6;b.position.y=b.userData.sy+Math.sin(t*b.userData.bs)*b.userData.bh});
        pts.rotation.y+=.00015;

        if(confActive){
            confTime++;
            const cp=confGeo.attributes.position.array;
            for(let i=0;i<confC;i++){
                cp[i*3]+=confVel[i].x*.016; confVel[i].y+=confVel[i].g;
                cp[i*3+1]+=confVel[i].y*.016; cp[i*3+2]+=confVel[i].z*.016;
            }
            confGeo.attributes.position.needsUpdate=true;
            if(confTime>250){confetti.material.opacity=Math.max(0,confetti.material.opacity-.005);if(confetti.material.opacity<=0)confActive=false}
        }

        renderer.render(scene,camera);
    }
    animate();
    window.addEventListener('resize',function(){camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight)});

    /* ── TYPING ── */
    const cBox=document.getElementById('commentary-box'),tText=document.getElementById('typed-text'),cur=document.getElementById('cursor');
    const msg="Hi, I am Utsav Gupta. I am a Full Stack Developer with 2 years of experience. I build SaaS products, mobile apps, and MVPs for startups.";
    setTimeout(function(){cBox.classList.add('visible');var i=0;(function tp(){if(i<msg.length){tText.textContent+=msg[i];i++;setTimeout(tp,25+Math.random()*35)}else{isSpeaking=false;setTimeout(function(){if(cur)cur.style.display='none'},2000)}})()},1800);

    /* ── NAV ── */
    const nav=document.getElementById('navbar');
    window.addEventListener('scroll',function(){nav.classList.toggle('scrolled',window.scrollY>60)});
    const hb=document.getElementById('hamburger'),mm=document.getElementById('mobile-menu');
    hb.addEventListener('click',function(){hb.classList.toggle('active');mm.classList.toggle('open')});
    mm.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){hb.classList.remove('active');mm.classList.remove('open')})});

    /* ── GSAP ── */
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section-label,.section-heading').forEach(function(el){gsap.from(el,{y:40,opacity:0,duration:.7,scrollTrigger:{trigger:el,start:'top 85%'}})});
    gsap.utils.toArray('.timeline-item').forEach(function(it,i){gsap.from(it,{x:-60,opacity:0,duration:.6,delay:i*.12,scrollTrigger:{trigger:it,start:'top 85%'}})});
    gsap.utils.toArray('.skill-card').forEach(function(c,i){gsap.from(c,{y:50,opacity:0,duration:.5,delay:i*.08,scrollTrigger:{trigger:c,start:'top 88%'}})});
    gsap.utils.toArray('.project-card').forEach(function(c,i){gsap.from(c,{y:60,opacity:0,duration:.6,delay:i*.1,scrollTrigger:{trigger:c,start:'top 88%'}})});
    gsap.from('.cta-heading',{y:50,opacity:0,duration:.7,scrollTrigger:{trigger:'.cta-heading',start:'top 80%'}});

    /* ── COUNTERS ── */
    const sObs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){const t=+e.target.dataset.count;let c=0;const inc=t/40,ti=setInterval(function(){c+=inc;if(c>=t){e.target.textContent=t+'+';clearInterval(ti)}else e.target.textContent=Math.floor(c)},35);sObs.unobserve(e.target)}})},{threshold:.5});
    document.querySelectorAll('.stat-number').forEach(function(el){sObs.observe(el)});

    /* ── ABOUT TEXT ── */
    const aT=document.getElementById('about-text');
    const aStr="With 2 years of hands-on experience in full stack development, I dominate every match. SaaS products, mobile applications, and MVPs for startups are my playing field. I turn ideas into polished, scalable digital products that win. Let's build something legendary together.";
    const chars=aStr.split('').map(function(c){const s=document.createElement('span');s.innerText=c;aT.appendChild(s);return s});
    window.addEventListener('scroll',function(){const r=aT.getBoundingClientRect(),p=Math.min(Math.max((innerHeight-r.top)/(r.height+innerHeight*.4),0),1),rv=Math.floor(p*chars.length*1.4);chars.forEach(function(c,i){c.style.opacity=i<rv?'1':'.08'})});

    /* ── TILT ── */
    function addTilt(sel,n){document.querySelectorAll(sel).forEach(function(c){c.addEventListener('mousemove',function(e){const r=c.getBoundingClientRect();c.style.transform='perspective(800px) rotateX('+((e.clientY-r.top-r.height/2)/n)+'deg) rotateY('+((r.width/2-(e.clientX-r.left))/n)+'deg) translateY(-10px)'});c.addEventListener('mouseleave',function(){c.style.transform=''})})}
    addTilt('.skill-card',14); addTilt('.project-card',20);

    /* ── NAV LINKS ── */
    document.querySelectorAll('a[href^="#"]').forEach(function(l){l.addEventListener('click',function(e){e.preventDefault();const t=document.querySelector(l.getAttribute('href'));if(t)t.scrollIntoView({behavior:'smooth'})})});
    const allS=document.querySelectorAll('section[id]');
    window.addEventListener('scroll',function(){const sp=scrollY+120;allS.forEach(function(s){const l=document.querySelector('.nav-links a[href="#'+s.id+'"]');if(l){if(sp>=s.offsetTop&&sp<s.offsetTop+s.offsetHeight){document.querySelectorAll('.nav-links a').forEach(function(a){a.classList.remove('active')});l.classList.add('active')}}})});
    document.getElementById('back-to-top').addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'})});

})();
