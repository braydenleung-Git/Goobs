// Three.js setup
let scene, camera, renderer;
let agents = [];
let selectedAgentIndex = 0;

// Initialize Three.js scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    // Create camera with top-down view
    const aspect = window.innerWidth / window.innerHeight;
    const viewHeight = Math.max(window.innerWidth, window.innerHeight) * 0.75; // Match ground scaling
    const viewWidth = viewHeight * aspect; // Width scales with aspect ratio
    camera = new THREE.OrthographicCamera(
        -viewWidth, viewWidth,
        viewHeight, -viewHeight,
        0.1, 1000
    );
    
    // Position camera for top-down view (directly above)
    camera.position.set(0, 50, 0);
    camera.lookAt(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 25);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Create ground grid
    createGroundGrid();

    // Add initial agents
    addInitialAgents();

    // Start animation loop
    animate();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Create ground grid
function createGroundGrid() {
    // Calculate ground size based on screen dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const groundSize = Math.max(screenWidth, screenHeight) * 1.5; // 1.5x the larger screen dimension
    const gridDivisions = Math.floor(groundSize / 10); // Grid cells roughly 10 units each

    // Ground plane - scales with screen size
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xe0e0e0 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'ground';
    scene.add(ground);

    // Grid lines - scales with screen size
    const gridHelper = new THREE.GridHelper(groundSize, gridDivisions, 0x888888, 0xcccccc);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.y = 0.01;
    gridHelper.name = 'grid';
    scene.add(gridHelper);
}

// Add initial agents
function addInitialAgents() {
    for (let i = 0; i < 3; i++) {
        createAgent(i * 15 - 15, 0, i * 10 - 10);
    }
}

// Create an agent
function createAgent(x, y, z) {
    const agentGroup = new THREE.Group();

    // Agent body (cube)
    const bodyGeometry = new THREE.BoxGeometry(3, 2, 3);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color(Math.random(), Math.random(), Math.random()) 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    agentGroup.add(body);

    // Agent marker (cylinder on top)
    const markerGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
    const markerMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.y = 2.5;
    agentGroup.add(marker);

    agentGroup.position.set(x, y, z);
    agentGroup.userData = {
        id: agents.length,
        name: `Agent ${agents.length + 1}`,
        status: 'idle'
    };

    scene.add(agentGroup);
    agents.push(agentGroup);

    return agentGroup;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate agents slowly
    agents.forEach((agent, index) => {
        agent.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
}

// Recreate ground with new dimensions
function recreateGround() {
    // Remove old ground and grid
    const oldGround = scene.getObjectByName('ground');
    const oldGrid = scene.getObjectByName('grid');
    if (oldGround) scene.remove(oldGround);
    if (oldGrid) scene.remove(oldGrid);

    // Calculate new ground size
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const groundSize = Math.max(screenWidth, screenHeight) * 1.5;
    const gridDivisions = Math.floor(groundSize / 10);

    // Create new ground
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xe0e0e0 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'ground';
    scene.add(ground);

    // Create new grid
    const gridHelper = new THREE.GridHelper(groundSize, gridDivisions, 0x888888, 0xcccccc);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.y = 0.01;
    gridHelper.name = 'grid';
    scene.add(gridHelper);
}

// Handle window resize
function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const viewHeight = Math.max(window.innerWidth, window.innerHeight) * 0.75; // Match ground scaling
    const viewWidth = viewHeight * aspect; // Width scales with aspect ratio
    camera.left = -viewWidth;
    camera.right = viewWidth;
    camera.top = viewHeight;
    camera.bottom = -viewHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Recreate ground with new dimensions
    recreateGround();
}

// UI Functions
function updateAgentInfo() {
    const agentText = document.getElementById('current-agent-text');
    const pageNumber = document.querySelector('.page-number');
    
    if (agents.length > 0) {
        const currentAgent = agents[selectedAgentIndex];
        agentText.textContent = `${currentAgent.userData.name} - Status: ${currentAgent.userData.status}`;
        pageNumber.textContent = selectedAgentIndex + 1;
    } else {
        agentText.textContent = 'No agents selected';
        pageNumber.textContent = '1';
    }
}

function updateTaskingPanel() {
    const agentDropdown = document.getElementById('agent-dropdown');
    const idleAgentsList = document.getElementById('idle-agents-list');
    const idleAgents = agents.filter(agent => agent.userData.status === 'idle');
    
    // Update dropdown options
    agentDropdown.innerHTML = '<option value="">Select an agent...</option>';
    agents.forEach(agent => {
        const option = document.createElement('option');
        option.value = agent.userData.id;
        option.textContent = agent.userData.name;
        agentDropdown.appendChild(option);
    });
    
    // Update idle agents list
    if (idleAgents.length === 0) {
        idleAgentsList.textContent = 'No idle agents available';
    } else {
        idleAgentsList.innerHTML = idleAgents
            .map(agent => `<div>${agent.userData.name}</div>`)
            .join('');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    init();

    // Add Agent button - link to agent customizer
    document.getElementById('add-agent-btn').addEventListener('click', function() {
        window.location.href = 'agent-customizer.html';
    });

    // Agent dropdown selection
    document.getElementById('agent-dropdown').addEventListener('change', function(e) {
        const selectedAgentId = parseInt(e.target.value);
        if (!isNaN(selectedAgentId)) {
            selectedAgentIndex = selectedAgentId;
            updateAgentInfo();
        }
    });

    // Initialize UI
    updateAgentInfo();
    updateTaskingPanel();
});
