// Avatar creation system
        let currentAvatar = {
            name: '',
            role: '',
            height: 1.0,
            width: 1.0,
            shirtColor: 0x4169e1,
            skinColor: 0xffdbac,
            hairColor: 0x3d3d3d,
            hairStyle: 0,
            hasGlasses: false,
            hasHat: false
        };
        
        let previewScene, previewCamera, previewRenderer, previewCharacter;
        
        // Color palettes
        const shirtColors = [
            0x4169e1, 0x9370db, 0x228b22, 0xffa500, 0xff6347, 0x20b2aa,
            0xdc143c, 0xff1493, 0x00ced1, 0x32cd32, 0xff4500, 0x8a2be2,
            0x000080, 0x800000, 0x008000, 0x800080, 0x808000, 0x008080
        ];
        
        const skinColors = [
            0xffdbac, 0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0x654321,
            0xffeaa7, 0xfdcb6e, 0xe17055, 0xd63031, 0x74b9ff, 0x0984e3
        ];
        
        const hairColors = [
            0x3d3d3d, 0x8b4513, 0xd2691e, 0xffd700, 0xff0000, 0x000000,
            0x696969, 0xdda0dd, 0x9370db, 0x4b0082, 0x00ff00, 0x00ffff
        ];
        
        // Initialize avatar creator
        function initAvatarCreator() {
            // Create preview scene
            previewScene = new THREE.Scene();
            previewScene.background = new THREE.Color(0xf5f5f5);
            
            previewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
            previewCamera.position.set(0, 1.5, 4);
            previewCamera.lookAt(0, 1, 0);
            
            previewRenderer = new THREE.WebGLRenderer({ antialias: true });
            previewRenderer.setSize(200, 200);
            previewRenderer.shadowMap.enabled = true;
            document.getElementById('avatar-preview').appendChild(previewRenderer.domElement);
            
            // Lighting for preview
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            previewScene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(1, 2, 1);
            directionalLight.castShadow = true;
            previewScene.add(directionalLight);
            
            // Create color grids
            createColorGrid('shirt-colors', shirtColors, (color) => {
                currentAvatar.shirtColor = color;
                updatePreview();
            });
            
            createColorGrid('skin-colors', skinColors, (color) => {
                currentAvatar.skinColor = color;
                updatePreview();
            });
            
            createColorGrid('hair-colors', hairColors, (color) => {
                currentAvatar.hairColor = color;
                updatePreview();
            });
            
            // Set up sliders
            document.getElementById('height-slider').addEventListener('input', (e) => {
                currentAvatar.height = parseFloat(e.target.value);
                updatePreview();
            });
            
            document.getElementById('width-slider').addEventListener('input', (e) => {
                currentAvatar.width = parseFloat(e.target.value);
                updatePreview();
            });
            
            document.getElementById('hair-style').addEventListener('input', (e) => {
                currentAvatar.hairStyle = parseInt(e.target.value);
                updatePreview();
            });
            
            document.getElementById('has-glasses').addEventListener('change', (e) => {
                currentAvatar.hasGlasses = e.target.checked;
                updatePreview();
            });
            
            document.getElementById('has-hat').addEventListener('change', (e) => {
                currentAvatar.hasHat = e.target.checked;
                updatePreview();
            });
            
            // Name and role inputs
            document.getElementById('player-name').addEventListener('input', (e) => {
                currentAvatar.name = e.target.value;
            });
            
            document.getElementById('player-role').addEventListener('input', (e) => {
                currentAvatar.role = e.target.value;
            });
            
            // Buttons
            document.getElementById('create-avatar').addEventListener('click', createAvatar);
            document.getElementById('randomize-avatar').addEventListener('click', randomizeAvatar);
            
            // Create initial preview
            updatePreview();
        }
        
        function createColorGrid(containerId, colors, callback) {
            const container = document.getElementById(containerId);
            colors.forEach((color, index) => {
                const colorDiv = document.createElement('div');
                colorDiv.className = 'color-option';
                colorDiv.style.backgroundColor = `#${color.toString(16).padStart(6, '0')}`;
                if (index === 0) colorDiv.classList.add('selected');
                
                colorDiv.addEventListener('click', () => {
                    container.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
                    colorDiv.classList.add('selected');
                    callback(color);
                });
                
                container.appendChild(colorDiv);
            });
        }
        
        function updatePreview() {
            if (previewCharacter) {
                previewScene.remove(previewCharacter);
            }
            
            previewCharacter = createCharacterModel(currentAvatar);
            previewCharacter.position.y = 0;
            previewScene.add(previewCharacter);
            
            previewRenderer.render(previewScene, previewCamera);
        }
        
        function randomizeAvatar() {
            currentAvatar = {
                name: document.getElementById('player-name').value || 'Player',
                role: document.getElementById('player-role').value || 'Office Worker',
                height: 0.8 + Math.random() * 0.6,
                width: 0.7 + Math.random() * 0.6,
                shirtColor: shirtColors[Math.floor(Math.random() * shirtColors.length)],
                skinColor: skinColors[Math.floor(Math.random() * skinColors.length)],
                hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
                hairStyle: Math.floor(Math.random() * 5),
                hasGlasses: Math.random() > 0.5,
                hasHat: Math.random() > 0.7
            };
            
            // Update UI
            document.getElementById('height-slider').value = currentAvatar.height;
            document.getElementById('width-slider').value = currentAvatar.width;
            document.getElementById('hair-style').value = currentAvatar.hairStyle;
            document.getElementById('has-glasses').checked = currentAvatar.hasGlasses;
            document.getElementById('has-hat').checked = currentAvatar.hasHat;
            
            updatePreview();
        }
        
        function createAvatar() {
            currentAvatar.name = document.getElementById('player-name').value.trim() || 'Player';
            currentAvatar.role = document.getElementById('player-role').value.trim() || 'Office Worker';
            
            if (!currentAvatar.name) {
                alert('Please enter your name!');
                return;
            }
            
            // Hide avatar creator and show game
            document.getElementById('avatar-creator').style.display = 'none';
            document.getElementById('ui-overlay').style.display = 'block';
            document.getElementById('players-list').style.display = 'block';
            document.getElementById('chat-container').style.display = 'block';
            
            // Initialize main game
            initMainGame();
                socket = new WebSocket("ws://localhost:3000");

socket.onopen = () => {
  socket.send(JSON.stringify({ type: "join", id: myPlayerId, avatar: currentAvatar }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "spawn") {
    // spawn other players
    const newPlayer = {
      id: data.id,
      avatar: data.avatar,
      position: new THREE.Vector3(0, 1.6, 0),
      rotation: 0,
      isDancing: false,
      character: createCharacterModel(data.avatar)
    };
    scene.add(newPlayer.character);
    players.set(data.id, newPlayer);
    updatePlayersList();
  } else if (data.type === "update") {
    const other = players.get(data.id);
    if (other && other.character) {
      other.character.position.set(data.pos.x, data.pos.y, data.pos.z);
      other.character.rotation.y = data.rot;
    }
  } else if (data.type === "chat") {
    const sender = players.get(data.id);
    if (sender) addChatMessage(sender.avatar.name, data.msg);
  } else if (data.type === "despawn") {
    const gone = players.get(data.id);
    if (gone) {
      scene.remove(gone.character);
      players.delete(data.id);
      updatePlayersList();
    }
  }
};

        }
        
        // Main game variables
        let scene, camera, renderer;
        let players = new Map();
        let myPlayerId = 'player-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        let lastChatTime = 0;
        
        // Player controls
        const player = {
            position: new THREE.Vector3(0, 1.6, 5),
            velocity: new THREE.Vector3(0, 0, 0),
            speed: 0.1,
            isDancing: false
        };
        
        const keys = {};
        let mouseX = 0;
        let nearbyPlayer = null;
        
        function initMainGame() {
            // Scene setup
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf5f5f5);
            scene.fog = new THREE.Fog(0xf5f5f5, 10, 50);
            
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.copy(player.position);
            
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            document.getElementById('canvas-container').appendChild(renderer.domElement);
            
            // Create office environment
            createOfficeEnvironment();
            
            // Add my player
            const myPlayer = {
                id: myPlayerId,
                avatar: currentAvatar,
                position: player.position.clone(),
                rotation: 0,
                isDancing: false,
                character: null
            };
            
            myPlayer.character = createCharacterModel(currentAvatar);
            myPlayer.character.position.copy(player.position);
            scene.add(myPlayer.character);
            players.set(myPlayerId, myPlayer);
            
            // Add some AI players for demo
            addDemoPlayers();
            
            // Set up controls
            setupControls();
            
            // Set up chat
            setupChat();
            
            // Update players list
            updatePlayersList();
            
            // Start animation loop
            animate(0);
        }
        
        function createCharacterModel(avatar) {
            const group = new THREE.Group();
            
            // Scale factors
            const heightScale = avatar.height;
            const widthScale = avatar.width;
            
            // Torso
            const torsoGeometry = new THREE.CylinderGeometry(0.25 * widthScale, 0.3 * widthScale, 0.8 * heightScale, 8);
            const torsoMaterial = new THREE.MeshStandardMaterial({ color: avatar.shirtColor });
            const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
            torso.position.y = 0.6 * heightScale;
            torso.castShadow = true;
            group.add(torso);
            
            // Arms
            const armGeometry = new THREE.CylinderGeometry(0.08 * widthScale, 0.08 * widthScale, 0.6 * heightScale, 6);
            const armMaterial = new THREE.MeshStandardMaterial({ color: avatar.shirtColor });
            
            const leftArm = new THREE.Mesh(armGeometry, armMaterial);
            leftArm.position.set(-0.3 * widthScale, 0.7 * heightScale, 0);
            leftArm.rotation.z = Math.PI / 8;
            group.add(leftArm);
            
            const rightArm = new THREE.Mesh(armGeometry, armMaterial);
            rightArm.position.set(0.3 * widthScale, 0.7 * heightScale, 0);
            rightArm.rotation.z = -Math.PI / 8;
            group.add(rightArm);
            
            // Legs
            const legGeometry = new THREE.CylinderGeometry(0.1 * widthScale, 0.1 * widthScale, 0.8 * heightScale, 6);
            const legMaterial = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
            
            const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
            leftLeg.position.set(-0.15 * widthScale, 0.4 * heightScale, 0);
            group.add(leftLeg);
            
            const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
            rightLeg.position.set(0.15 * widthScale, 0.4 * heightScale, 0);
            group.add(rightLeg);
            
            // Head
            const headGeometry = new THREE.SphereGeometry(0.25 * Math.min(widthScale, heightScale), 8, 6);
            const headMaterial = new THREE.MeshStandardMaterial({ color: avatar.skinColor });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 1.25 * heightScale;
            head.castShadow = true;
            group.add(head);
            
            // Hair (if not bald)
            if (avatar.hairStyle > 0) {
                let hairGeometry;
                switch(avatar.hairStyle) {
                    case 1: // Short
                        hairGeometry = new THREE.SphereGeometry(0.27 * Math.min(widthScale, heightScale), 8, 6);
                        break;
                    case 2: // Medium
                        hairGeometry = new THREE.SphereGeometry(0.3 * Math.min(widthScale, heightScale), 8, 6);
                        break;
                    case 3: // Long
                        hairGeometry = new THREE.SphereGeometry(0.35 * Math.min(widthScale, heightScale), 8, 6);
                        break;
                    case 4: // Curly
                        hairGeometry = new THREE.SphereGeometry(0.32 * Math.min(widthScale, heightScale), 6, 5);
                        break;
                }
                
                const hairMaterial = new THREE.MeshStandardMaterial({ color: avatar.hairColor });
                const hair = new THREE.Mesh(hairGeometry, hairMaterial);
                hair.position.y = 1.35 * heightScale;
                hair.scale.y = avatar.hairStyle === 4 ? 0.8 : 0.6;
                group.add(hair);
            }
            
            // Eyes
            const eyeGeometry = new THREE.SphereGeometry(0.03, 4, 4);
            const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
            
            const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            leftEye.position.set(-0.08 * widthScale, 1.25 * heightScale, 0.22);
            group.add(leftEye);
            
            const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            rightEye.position.set(0.08 * widthScale, 1.25 * heightScale, 0.22);
            group.add(rightEye);
            
            // Glasses
            if (avatar.hasGlasses) {
                const glassesGeometry = new THREE.RingGeometry(0.12, 0.15, 8);
                const glassesMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
                
                const leftGlass = new THREE.Mesh(glassesGeometry, glassesMaterial);
                leftGlass.position.set(-0.08 * widthScale, 1.25 * heightScale, 0.23);
                group.add(leftGlass);
                
                const rightGlass = new THREE.Mesh(glassesGeometry, glassesMaterial);
                rightGlass.position.set(0.08 * widthScale, 1.25 * heightScale, 0.23);
                group.add(rightGlass);
                
                // Glasses bridge
                const bridgeGeometry = new THREE.BoxGeometry(0.04, 0.02, 0.02);
                const bridge = new THREE.Mesh(bridgeGeometry, glassesMaterial);
                bridge.position.set(0, 1.25 * heightScale, 0.23);
                group.add(bridge);
            }
            
            // Hat
            if (avatar.hasHat) {
                const hatGeometry = new THREE.CylinderGeometry(0.3 * widthScale, 0.25 * widthScale, 0.15, 8);
                const hatMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
                const hat = new THREE.Mesh(hatGeometry, hatMaterial);
                hat.position.y = 1.5 * heightScale;
                group.add(hat);
            }
            
            // Name label
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 64;
            const context = canvas.getContext('2d');
            context.fillStyle = 'rgba(255, 255, 255, 0.9)';
            context.fillRect(0, 0, 256, 64);
            context.fillStyle = 'black';
            context.font = 'bold 20px Arial';
            context.textAlign = 'center';
            context.fillText(avatar.name, 128, 25);
            context.font = '16px Arial';
            context.fillStyle = '#666';
            context.fillText(avatar.role, 128, 45);
            
            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.SpriteMaterial({ map: texture });
            const label = new THREE.Sprite(labelMaterial);
            label.position.y = 1.8 * heightScale;
            label.scale.set(2, 0.5, 1);
            group.add(label);
            
            // Store references for animations
            group.userData = {
                leftArm: leftArm,
                rightArm: rightArm,
                avatar: avatar
            };
            
            return group;
        }
        
        function createOfficeEnvironment() {
            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(10, 15, 10);
            directionalLight.castShadow = true;
            directionalLight.shadow.camera.near = 0.1;
            directionalLight.shadow.camera.far = 50;
            directionalLight.shadow.camera.left = -30;
            directionalLight.shadow.camera.right = 30;
            directionalLight.shadow.camera.top = 30;
            directionalLight.shadow.camera.bottom = -30;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            scene.add(directionalLight);
            
            // Floor with pattern
            const floorGeometry = new THREE.PlaneGeometry(40, 40);
            const floorMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xdcdcdc,
                roughness: 0.7,
                metalness: 0.1
            });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            scene.add(floor);
            
            // Add floor tiles pattern
            const tileGeometry = new THREE.PlaneGeometry(2, 2);
            const tileMaterial1 = new THREE.MeshStandardMaterial({ color: 0xe8e8e8 });
            const tileMaterial2 = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 });
            
            for (let x = -20; x < 20; x += 2) {
                for (let z = -20; z < 20; z += 2) {
                    const tile = new THREE.Mesh(tileGeometry, ((x + z) / 2) % 2 === 0 ? tileMaterial1 : tileMaterial2);
                    tile.position.set(x + 1, 0.01, z + 1);
                    tile.rotation.x = -Math.PI / 2;
                    tile.receiveShadow = true;
                    scene.add(tile);
                }
            }
            
            // Walls
            const wallMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xf8f8f8,
                roughness: 0.9
            });
            
            const windowMaterial = new THREE.MeshStandardMaterial({
                color: 0x87ceeb,
                transparent: true,
                opacity: 0.3,
                roughness: 0.1,
                metalness: 0.5
            });
            
            // Back wall with windows
            const backWall = new THREE.Mesh(
                new THREE.PlaneGeometry(40, 10),
                wallMaterial
            );
            backWall.position.set(0, 5, -20);
            backWall.receiveShadow = true;
            scene.add(backWall);
            
            // Add windows to back wall
            for (let x = -15; x <= 15; x += 10) {
                const window = new THREE.Mesh(
                    new THREE.PlaneGeometry(4, 3),
                    windowMaterial
                );
                window.position.set(x, 5, -19.9);
                scene.add(window);
            }
            
            // Side walls
            const leftWall = new THREE.Mesh(
                new THREE.PlaneGeometry(40, 10),
                wallMaterial
            );
            leftWall.position.set(-20, 5, 0);
            leftWall.rotation.y = Math.PI / 2;
            leftWall.receiveShadow = true;
            scene.add(leftWall);
            
            const rightWall = new THREE.Mesh(
                new THREE.PlaneGeometry(40, 10),
                wallMaterial
            );
            rightWall.position.set(20, 5, 0);
            rightWall.rotation.y = -Math.PI / 2;
            rightWall.receiveShadow = true;
            scene.add(rightWall);
            
            // Office furniture
            const woodMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x8b6914,
                roughness: 0.6,
                metalness: 0.1
            });
            
            const metalMaterial = new THREE.MeshStandardMaterial({
                color: 0x404040,
                roughness: 0.3,
                metalness: 0.8
            });
            
            // Create desks around the office
            createDesk(-10, -10);
            createDesk(0, -10);
            createDesk(10, -10);
            createDesk(-10, 5);
            createDesk(0, 5);
            createDesk(10, 5);
            
            function createDesk(x, z) {
                const deskGroup = new THREE.Group();
                
                // Desk top
                const deskTop = new THREE.Mesh(
                    new THREE.BoxGeometry(3, 0.1, 1.5),
                    woodMaterial
                );
                deskTop.position.y = 0.75;
                deskTop.castShadow = true;
                deskTop.receiveShadow = true;
                deskGroup.add(deskTop);
                
                // Computer monitor
                const monitorScreen = new THREE.Mesh(
                    new THREE.BoxGeometry(1.2, 0.7, 0.05),
                    new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1, metalness: 0.5 })
                );
                monitorScreen.position.set(0, 1.3, 0);
                deskGroup.add(monitorScreen);
                
                // Chair
                const chairSeat = new THREE.Mesh(
                    new THREE.BoxGeometry(0.5, 0.05, 0.5),
                    new THREE.MeshStandardMaterial({ color: 0x333333 })
                );
                chairSeat.position.set(0, 0.5, 0.8);
                deskGroup.add(chairSeat);
                
                deskGroup.position.set(x, 0, z);
                scene.add(deskGroup);
            }
            
            // Add plants for decoration
            for (let i = 0; i < 5; i++) {
                const plantPot = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.3, 0.25, 0.4, 8),
                    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
                );
                const plantLeaves = new THREE.Mesh(
                    new THREE.SphereGeometry(0.6, 6, 5),
                    new THREE.MeshStandardMaterial({ color: 0x228b22 })
                );
                
                const x = (Math.random() - 0.5) * 30;
                const z = (Math.random() - 0.5) * 30;
                
                plantPot.position.set(x, 0.2, z);
                plantLeaves.position.set(x, 0.8, z);
                
                scene.add(plantPot);
                scene.add(plantLeaves);
            }
        }
        
        function addDemoPlayers() {
            // Add some demo AI players
            const demoAvatars = [
                {
                    name: 'Alice',
                    role: 'Developer',
                    height: 1.1,
                    width: 0.9,
                    shirtColor: 0x9370db,
                    skinColor: 0xf1c27d,
                    hairColor: 0xd2691e,
                    hairStyle: 2,
                    hasGlasses: true,
                    hasHat: false
                },
                {
                    name: 'Bob',
                    role: 'Designer',
                    height: 1.2,
                    width: 1.1,
                    shirtColor: 0x228b22,
                    skinColor: 0xe0ac69,
                    hairColor: 0x3d3d3d,
                    hairStyle: 1,
                    hasGlasses: false,
                    hasHat: true
                },
                {
                    name: 'Carol',
                    role: 'Manager',
                    height: 1.0,
                    width: 0.8,
                    shirtColor: 0xff6347,
                    skinColor: 0xc68642,
                    hairColor: 0xffd700,
                    hairStyle: 3,
                    hasGlasses: false,
                    hasHat: false
                }
            ];
            
            demoAvatars.forEach((avatar, index) => {
                const playerId = 'demo-' + index;
                const demoPlayer = {
                    id: playerId,
                    avatar: avatar,
                    position: new THREE.Vector3((index - 1) * 5, 0, -8),
                    rotation: 0,
                    isDancing: false,
                    character: null,
                    isAI: true,
                    moveTimer: Math.random() * 5,
                    targetPosition: new THREE.Vector3((index - 1) * 5, 0, -8)
                };
                
                demoPlayer.character = createCharacterModel(avatar);
                demoPlayer.character.position.copy(demoPlayer.position);
                scene.add(demoPlayer.character);
                players.set(playerId, demoPlayer);
            });
        }
        
        function setupControls() {
            document.addEventListener('keydown', (e) => {
                keys[e.key.toLowerCase()] = true;
                keys[e.key] = true;
                
                if (e.key.toLowerCase() === 'e' && nearbyPlayer) {
                    e.preventDefault();
                    interactWithPlayer(nearbyPlayer);
                }
                
                if (e.key === ' ') {
                    e.preventDefault();
                    player.isDancing = true;
                    players.get(myPlayerId).isDancing = true;
                    createFloatingText('💃🕺', player.position);
                }
                
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                }
            });
            
            document.addEventListener('keyup', (e) => {
                keys[e.key.toLowerCase()] = false;
                keys[e.key] = false;
                
                if (e.key === ' ') {
                    player.isDancing = false;
                    players.get(myPlayerId).isDancing = false;
                }
                
                if (e.key === 'Escape') {
                    if (document.pointerLockElement === renderer.domElement) {
                        document.exitPointerLock();
                    }
                }
            });
            
            // Mouse look
            document.addEventListener('mousemove', (e) => {
                if (document.pointerLockElement === renderer.domElement) {
                    mouseX += e.movementX * 0.002;
                }
            });
            
            renderer.domElement.addEventListener('click', () => {
                renderer.domElement.requestPointerLock();
            });
        }
        
        function setupChat() {
            const chatInput = document.getElementById('chat-input');
            const chatSend = document.getElementById('chat-send');
            
            function sendMessage() {
                const message = chatInput.value.trim();
                if (message && Date.now() - lastChatTime > 1000) {
                    addChatMessage(currentAvatar.name, message);
                    chatInput.value = '';
                    lastChatTime = Date.now();
                    
                    // Simulate other players responding occasionally
                    if (Math.random() < 0.3) {
                        setTimeout(() => {
                            const otherPlayers = Array.from(players.values()).filter(p => p.id !== myPlayerId);
                            if (otherPlayers.length > 0) {
                                const responder = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
                                const responses = [
                                    'Interesting point!',
                                    'I agree!',
                                    'What do you think about that?',
                                    'Good idea!',
                                    'LOL',
                                    'That reminds me of something...',
                                    'Nice work today!',
                                    'Anyone want to grab coffee?'
                                ];
                                addChatMessage(responder.avatar.name, responses[Math.floor(Math.random() * responses.length)]);
                            }
                        }, 1000 + Math.random() * 3000);
                    }
                }
            }
            
            chatSend.addEventListener('click', sendMessage);
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        }
        
        function addChatMessage(playerName, message) {
            const chatMessages = document.getElementById('chat-messages');
            const messageDiv = document.createElement('div');
            messageDiv.innerHTML = `<strong style="color: #4CAF50;">${playerName}:</strong> ${message}`;
            messageDiv.style.marginBottom = '5px';
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Remove old messages if too many
            while (chatMessages.children.length > 20) {
                chatMessages.removeChild(chatMessages.firstChild);
            }
        }
        
        function interactWithPlayer(otherPlayer) {
            if (otherPlayer.isAI) {
                const greetings = [
                    `Hi! I'm ${otherPlayer.avatar.name}. Nice to meet you!`,
                    `Hey there! I'm working on some ${otherPlayer.avatar.role.toLowerCase()} stuff.`,
                    `Hello! How's your day going?`,
                    `Hi! Love what you've done with your avatar!`,
                    `Hey! Want to grab coffee sometime?`
                ];
                addChatMessage(otherPlayer.avatar.name, greetings[Math.floor(Math.random() * greetings.length)]);
                createFloatingText('💬', otherPlayer.position);
            }
        }
        
        function updatePlayersList() {
            const playersContent = document.getElementById('players-content');
            playersContent.innerHTML = '';
            
            players.forEach((player) => {
                const playerDiv = document.createElement('div');
                playerDiv.className = 'player-item';
                playerDiv.textContent = `${player.avatar.name} (${player.avatar.role})`;
                if (player.id === myPlayerId) {
                    playerDiv.textContent += ' - You';
                    playerDiv.style.color = '#4CAF50';
                }
                playersContent.appendChild(playerDiv);
            });
        }
        
        function createFloatingText(text, worldPos) {
            const screenPos = worldPos.clone();
            screenPos.project(camera);
            
            const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;
            
            const div = document.createElement('div');
            div.className = 'floating-text';
            div.textContent = text;
            div.style.left = x + 'px';
            div.style.top = y + 'px';
            document.body.appendChild(div);
            
            setTimeout(() => div.remove(), 2000);
        }
        
        let lastTime = 0;
        
        function animate(currentTime) {
            requestAnimationFrame(animate);
            
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;
            
            // Update my player movement
            player.velocity.set(0, 0, 0);
            
            if (!player.isDancing) {
                if (keys['w']) player.velocity.z = player.speed;
                if (keys['s']) player.velocity.z = -player.speed;
                if (keys['a']) player.velocity.x = -player.speed;
                if (keys['d']) player.velocity.x = player.speed;
            }
            
            // Arrow key camera controls
            const lookSpeed = 0.05;
            if (keys['ArrowLeft']) mouseX += lookSpeed;
            if (keys['ArrowRight']) mouseX -= lookSpeed;
            
            // Update camera rotation
            if (!player.isDancing) {
                camera.rotation.y = mouseX;
                camera.rotation.x = 0;
            }
            
            // Apply movement in camera direction
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(camera.quaternion);
            forward.y = 0;
            forward.normalize();
            
            const right = new THREE.Vector3(1, 0, 0);
            right.applyQuaternion(camera.quaternion);
            right.y = 0;
            right.normalize();
            
            player.position.add(forward.multiplyScalar(player.velocity.z));
            player.position.add(right.multiplyScalar(player.velocity.x));
            
            // Keep player in bounds
            player.position.x = Math.max(-18, Math.min(18, player.position.x));
            player.position.z = Math.max(-18, Math.min(18, player.position.z));
            
            // Dancing animation
            if (player.isDancing) {
                camera.position.y = player.position.y + Math.sin(Date.now() * 0.01) * 0.2;
                camera.rotation.z = Math.sin(Date.now() * 0.01) * 0.1;
                camera.rotation.y = mouseX;
                camera.rotation.x = 0;
            } else {
                camera.position.copy(player.position);
                camera.rotation.z = 0;
                camera.rotation.y = mouseX;
                camera.rotation.x = 0;
            }
            
            // Update my player character
            const myPlayer = players.get(myPlayerId);
            if (myPlayer && myPlayer.character) {
                myPlayer.character.position.copy(player.position);
                myPlayer.character.rotation.y = mouseX + Math.PI;
                myPlayer.position.copy(player.position);
                
                if (myPlayer.isDancing) {
                    myPlayer.character.rotation.y += 0.1;
                    myPlayer.character.position.y = Math.abs(Math.sin(Date.now() * 0.01)) * 0.3;
                    
                    // Arm waving
                    if (myPlayer.character.userData.leftArm) {
                        myPlayer.character.userData.leftArm.rotation.z = Math.sin(Date.now() * 0.01) * 0.5 + Math.PI / 8;
                        myPlayer.character.userData.rightArm.rotation.z = -Math.sin(Date.now() * 0.01) * 0.5 - Math.PI / 8;
                    }
                }
            }
            
            // Update other players (AI movement)
            players.forEach((otherPlayer) => {
                if (otherPlayer.id === myPlayerId || !otherPlayer.isAI) return;
                
                // AI movement
                otherPlayer.moveTimer -= deltaTime;
                
                if (otherPlayer.moveTimer <= 0) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 3 + Math.random() * 5;
                    otherPlayer.targetPosition.set(
                        Math.cos(angle) * distance,
                        0,
                        Math.sin(angle) * distance
                    );
                    
                    // Keep within bounds
                    otherPlayer.targetPosition.x = Math.max(-18, Math.min(18, otherPlayer.targetPosition.x));
                    otherPlayer.targetPosition.z = Math.max(-18, Math.min(18, otherPlayer.targetPosition.z));
                    
                    otherPlayer.moveTimer = 3 + Math.random() * 7;
                }
                
                // Move towards target
                const direction = new THREE.Vector3().subVectors(otherPlayer.targetPosition, otherPlayer.position);
                direction.y = 0;
                const distance = direction.length();
                
                if (distance > 0.1) {
                    direction.normalize();
                    otherPlayer.position.add(direction.multiplyScalar(0.02));
                    otherPlayer.character.position.copy(otherPlayer.position);
                    
                    // Face movement direction
                    otherPlayer.character.lookAt(otherPlayer.targetPosition);
                    otherPlayer.character.rotation.x = 0;
                    otherPlayer.character.rotation.z = 0;
                    
                    // Walking animation
                    otherPlayer.character.position.y = Math.abs(Math.sin(Date.now() * 0.005 + otherPlayer.id.charCodeAt(0))) * 0.05;
                }
                
                // Random dancing
                if (Math.random() < 0.001) {
                    otherPlayer.isDancing = !otherPlayer.isDancing;
                    if (otherPlayer.isDancing) {
                        createFloatingText('🎵', otherPlayer.position);
                        setTimeout(() => {
                            otherPlayer.isDancing = false;
                        }, 3000);
                    }
                }
                
                // Dancing animation
                if (otherPlayer.isDancing) {
                    otherPlayer.character.rotation.y += 0.1;
                    otherPlayer.character.position.y = Math.abs(Math.sin(Date.now() * 0.01)) * 0.3;
                    
                    if (otherPlayer.character.userData.leftArm) {
                        otherPlayer.character.userData.leftArm.rotation.z = Math.sin(Date.now() * 0.01) * 0.5 + Math.PI / 8;
                        otherPlayer.character.userData.rightArm.rotation.z = -Math.sin(Date.now() * 0.01) * 0.5 - Math.PI / 8;
                    }
                }
            });
            
            // Check for nearby players
            nearbyPlayer = null;
            let minDistance = Infinity;
            
            players.forEach((otherPlayer) => {
                if (otherPlayer.id === myPlayerId) return;
                const distance = player.position.distanceTo(otherPlayer.position);
                if (distance < 3 && distance < minDistance) {
                    minDistance = distance;
                    nearbyPlayer = otherPlayer;
                }
            });
            
            // Show interaction prompt
            const interactionPrompt = document.getElementById('interaction-prompt');
            if (nearbyPlayer) {
                interactionPrompt.style.display = 'block';
                interactionPrompt.textContent = `Press E to talk to ${nearbyPlayer.avatar.name}`;
            } else {
                interactionPrompt.style.display = 'none';
            }
            
            renderer.render(scene, camera);
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (camera && renderer) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
        });
        
        // Initialize avatar creator when page loads
        initAvatarCreator();
let token = null;
let socket = null;

// Login handling
document.getElementById("login-btn").onclick = async () => {
  const u = document.getElementById("login-username").value;
  const p = document.getElementById("login-password").value;
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: u, password: p })
  });
  const data = await res.json();
  if (data.token) {
    token = data.token;
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("avatar-creator").style.display = "block";
  } else {
    document.getElementById("login-status").textContent = data.error || "Login failed";
  }
};

document.getElementById("register-btn").onclick = async () => {
  const u = document.getElementById("login-username").value;
  const p = document.getElementById("login-password").value;
  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: u, password: p })
  });
  const data = await res.json();
  document.getElementById("login-status").textContent = data.success
    ? "Registered! Now log in."
    : data.error || "Error";
};

