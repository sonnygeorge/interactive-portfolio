import Sprite from './sprite.js';

const CONTENT_SQUARES = [
    'Routine Butler',
    'Papiamentu ASR System',
    'Rick & Morty Speaker Attribution',
    "Communication Honorable Mentions",
    // Interactive Portfolio
    // Papiamentu ASR Project - Corpus repo w/ 1. paper pdf of fine-tuning results & 2. Colab notebook of fine-tuning code
    // Published Music - "My Music Hobby"?
    // Communicating Ideas Hall of Fame?
];

const ORIGINAL_BACKGROUNDS = {
    'Routine Butler': 'url(assets/routine_butler.png)',
    'Rick & Morty Speaker Attribution': 'url(assets/rick_and_morty.png)',
    'Papiamentu ASR System': 'url(assets/papiamentu.png)',
    'Communication Honorable Mentions': 'url(assets/spelunk.png)',
};

const HOVER_BACKGROUNDS = {
    'Routine Butler': 'url(assets/routine_butler.gif)',
    'Rick & Morty Speaker Attribution': 'url(assets/rick_and_morty.gif)',
    'Communication Honorable Mentions': 'url(assets/communication.gif)',
};

// Global state variables
let currentSelectedAnchorIndex = null;
let isSpriteMoving = false;

// Helper function to get CSS property values
function getCSSPropertyValue(propName) {
    const result = getComputedStyle(document.documentElement).getPropertyValue(propName);
    if (parseInt(result)) {
        return parseInt(result);
    }
    return result;
}

async function loadContentSquares() {
    const contentBox = document.getElementById('content-box');
    try {
        // Load squares
        for (const square of CONTENT_SQUARES) {
            const div = document.createElement('div');
            div.classList.add('content-square');
            // Background image setting & listeners
            if (square in ORIGINAL_BACKGROUNDS) {
                div.style.backgroundImage = ORIGINAL_BACKGROUNDS[square];
                div.addEventListener('mouseenter', () => {
                    div.style.backgroundImage = HOVER_BACKGROUNDS[square];
                });
                div.addEventListener('mouseleave', () => {
                    div.style.backgroundImage = ORIGINAL_BACKGROUNDS[square];
                });
            } else {
                console.log(getCSSPropertyValue("--default-content-square-color"))
                div.style.background = getCSSPropertyValue("--default-content-square-color")
            }
            // Add project name as data attribute
            div.setAttribute('data-project', square);
            // Create title div and add it to the square
            const titleDiv = document.createElement('div');
            titleDiv.classList.add('content-square-title');
            titleDiv.innerText = square;
            div.appendChild(titleDiv);
            // Add handler for clicking on the square
            contentBox.appendChild(div);
        };

        // Add moving-box (sprite character) features
        const anchors = calculateIntersectionPoints();
        initializeMovingBox(anchors);
        document.querySelectorAll('.content-square').forEach((square, index) => {            
            square.addEventListener('click', function () {
                handleClickOnSquare(index, anchors);
            });
        });
    } catch (error) {
        console.error('Failed to load content squares:', error);
    }
}

function showSpeechBubble(index) {
    const speechBubble = document.getElementById('speech-bubble');
    const speechText = document.getElementById('speech-text');
    const contentSquarePath = CONTENT_SQUARES[index];
    const fileName = contentSquarePath.split('/').pop();
    positionSpeechBubbleNextToMovingBox()
    speechText.innerHTML = explanations[fileName] || 'No explanation available.';
    speechBubble.style.transition = 'opacity 0.3s ease-in';
    speechBubble.classList.remove('hidden');
    setTimeout(() => speechBubble.style.opacity = 1, 0);
}


function hideSpeechBubble() {
    const speechBubble = document.getElementById('speech-bubble');
    if (speechBubble) {
        speechBubble.style.opacity = 0;
        speechBubble.style.transition = '';

        speechBubble.classList.add('hidden'); // Hide the bubble immediately without waiting for the transition
    }
}

function showIntroductorySpeechBubble() {
    const speechBubble = document.getElementById('speech-bubble');
    const speechText = document.getElementById('speech-text');

    speechText.innerHTML = "Heya! I'm Sonny's mom, Lisa. Isn't Sonny just the greatest? He's all that and a slice of bread!<br><br>Here are some of his recent projects. You should <u>click</u> on a few tiles to learn more!";
    speechBubble.classList.remove('hidden');
    setTimeout(() => speechBubble.style.opacity = 1, 0); // Apply opacity transition for the intro
}

function positionSpeechBubbleNextToMovingBox() {
    const movingBox = document.getElementById('moving-box');
    const speechBubble = document.getElementById('speech-bubble');
    const squareMargin = getCSSPropertyValue('--square-margin');

    if (movingBox && speechBubble) {
        const movingBoxRect = movingBox.getBoundingClientRect();
        const offset = 22; // Adjust this value to align with the sprite's eye level

        // Position the speech bubble's bottom at sprite's eye level
        speechBubble.style.top = `${movingBoxRect.top + movingBoxRect.height - offset - speechBubble.offsetHeight}px`;
        speechBubble.style.left = `${movingBoxRect.right + squareMargin}px`;
    }
}

function handleClickOnSquare(index, anchors) {
    // Prevent this function if the sprite is already moving
    if (isSpriteMoving) {
        return;
    }

    const numCols = getCSSPropertyValue('--num-cols');
    const numAnchorCols = numCols + 1;
    const row = Math.floor(index / numCols);
    const col = index % numCols;
    let targetAnchorIndex = numAnchorCols * (row + 1) + (col + 1);

    if (currentSelectedAnchorIndex !== index) {
        hideSpeechBubble(); // Hide the speech bubble if a different box is clicked
        currentSelectedAnchorIndex = index;
    }
    
    const targetAnchor = anchors[targetAnchorIndex];
    if (targetAnchor) {
        animateSpriteToAnchor(targetAnchor, () => {
            showSpeechBubble(index);
        });
    }

    // Apply glow effect
    document.querySelectorAll('.content-square').forEach((square, idx) => {
        if (idx === index) {
            square.classList.add('square-selection-effect');
        } else {
            square.classList.remove('square-selection-effect');
        }
    });

    // Show speech bubble
    if (targetAnchor) {
        animateSpriteToAnchor(targetAnchor, () => {
            showSpeechBubble(index);
        });
    }
}

function calculateIntersectionPoints() {
    const squareSize = getCSSPropertyValue('--square-size');
    const squareMargin = getCSSPropertyValue('--square-margin');
    const laneSize = getCSSPropertyValue('--movable-square-size');
    const numCols = getCSSPropertyValue('--num-cols');
    const numRows = Math.ceil(CONTENT_SQUARES.length / numCols);
    const totalSquareSize = squareSize + 2 * squareMargin;
    const anchorOffset = laneSize / 2;
    const animationAnchors = [];

    for (let row = 0; row <= numRows; row++) {
        for (let col = 0; col <= numCols; col++) {
            const x = col * totalSquareSize + laneSize * col + anchorOffset;
            const y = row * totalSquareSize + laneSize * row + anchorOffset;
            animationAnchors.push({ x, y });
        }
    }

    // Uncomment to visualize the anchor points

    // // Clear previous anchors if they exist
    // const existingAnchors = document.querySelectorAll('.anchor');
    // existingAnchors.forEach(anchor => anchor.remove());

    // // Create and append new anchor elements
    // animationAnchors.forEach((point, index) => {
    //     const anchorElement = createAnchorElement(point.x, point.y, index);
    //     anchorElement.classList.add('anchor'); // Add class for potential styling or removal
    //     document.getElementById('content-box').appendChild(anchorElement);
    // });

    return animationAnchors;
}

// Uncomment to visualize the anchor points

// function createAnchorElement(x, y, index) {
//     const anchorWrapper = document.createElement('div');
//     anchorWrapper.style.position = 'absolute';
//     anchorWrapper.style.left = `${x}px`;
//     anchorWrapper.style.top = `${y}px`;

//     const anchor = document.createElement('div');
//     anchor.style.width = '2px'; // Size of the dot
//     anchor.style.height = '2px';
//     anchor.style.backgroundColor = 'black';
//     anchor.style.borderRadius = '50%'; // Make it round
//     anchor.style.position = 'absolute';

//     const text = document.createElement('span');
//     text.textContent = index; // Set the index number as text
//     text.style.fontSize = '8px'; // Set text size
//     text.style.position = 'absolute';
//     text.style.left = '10px'; // Position text to the right of the dot
//     text.style.top = '50%';
//     text.style.transform = 'translateY(-50%)'; // Center text vertically next to the dot

//     anchorWrapper.appendChild(anchor); // Add the dot to the wrapper
//     anchorWrapper.appendChild(text); // Add the text to the wrapper

//     return anchorWrapper;
// }

function createMovingBox() {
    const movingBox = document.createElement('div');
    movingBox.classList.add('moving-box');
    movingBox.id = 'moving-box';
    
    // Add sprite as a child of the moving box
    const spriteElement = document.createElement('div');
    spriteElement.id = 'sprite';
    movingBox.appendChild(spriteElement);

    document.getElementById('content-box').appendChild(movingBox);
    return movingBox;
}

function moveToAnchor(anchor) {
    const movingBox = document.getElementById('moving-box') || createMovingBox();
    const boxHalfSize = getCSSPropertyValue('--movable-square-size') / 2;
    movingBox.style.left = `${anchor.x - boxHalfSize}px`;
    movingBox.style.top = `${anchor.y - boxHalfSize}px`;
}

function initializeMovingBox(anchors) {
    const movingBox = createMovingBox();
    const topLeftAnchor = anchors[0];
    moveToAnchor(topLeftAnchor);

    // Initialize sprite
    const spriteElement = document.getElementById('sprite');
    const sprite = new Sprite(spriteElement);
    sprite.setStationary(); // Set to stationary initially
}

function animateSpriteToAnchor(targetAnchor, callback) {
    // Get elements and compute styles
    const movingBox = document.getElementById('moving-box');
    const sprite = new Sprite(document.getElementById('sprite'));
    const tenPixelDuration = getCSSPropertyValue('--ten-pixel-traversal-duration');
    const movableSquareSize = getCSSPropertyValue('--movable-square-size');
    const computedStyle = window.getComputedStyle(movingBox);

    // Update global flag
    isSpriteMoving = true;

    // Calculate current and target positions
    const currentX = parseInt(computedStyle.left);
    const currentY = parseInt(computedStyle.top);
    const targetX = targetAnchor.x - movableSquareSize / 2;
    const targetY = targetAnchor.y - movableSquareSize / 2;

    // Determine distances and durations
    const distanceX = targetX - currentX;
    const distanceY = targetY - currentY;
    const durationX = Math.abs((distanceX / 10) * tenPixelDuration);
    const durationY = Math.abs((distanceY / 10) * tenPixelDuration);

    // Determine keyframes and durations for each traversal
    // NOTE: We want to moxe horizontally first if moving leftward...
    // ...This allows us to hug the inward corner created by a not-full bottom row
    const shouldMoveHorizontallyFirst = targetX < currentX
    const [traversalOneKeyframe, traversalTwoKeyframe, traversalOneDuration, traversalTwoDuration] = shouldMoveHorizontallyFirst ?
        [[{ left: `${currentX}px` }, { left: `${targetX}px` }], [{ top: `${currentY}px` }, { top: `${targetY}px` }], durationX, durationY] :
        [[{ top: `${currentY}px` }, { top: `${targetY}px` }], [{ left: `${currentX}px` }, { left: `${targetX}px` }], durationY, durationX];

    // Define options for the animations
    const traversalOptions = duration => ({
        duration,
        fill: 'forwards',
        easing: 'linear'
    });

    // Function to set sprite direction based on movement direction and distance
    const setSpriteDirection = (isHorizontal, isPositiveDirection) => {
        if (isHorizontal) {
            sprite[isPositiveDirection ? 'setWalkingRight' : 'setWalkingLeft'](); // Horizontal movement: right if positive, left if negative
        } else {
            sprite[isPositiveDirection ? 'setWalkingDown' : 'setWalkingUp'](); // Vertical movement: down if positive, up if negative
        }
    };

    // Function to animate traversal and set the next animation or callback
    const animateTraversal = (keyframe, options, isHorizontal) => {
        movingBox.animate(keyframe, options).onfinish = () => {
            if (isHorizontal === shouldMoveHorizontallyFirst) {
                const secondTraversalIsPositive = !shouldMoveHorizontallyFirst ? distanceX > 0 : distanceY > 0;
                setSpriteDirection(!shouldMoveHorizontallyFirst, secondTraversalIsPositive);
                setTimeout(() => animateTraversal(traversalTwoKeyframe, traversalOptions(traversalTwoDuration), !shouldMoveHorizontallyFirst), 175);
            } else {
                sprite.setStationary();
                isSpriteMoving = false; // Update global flag now that sprite is no longer moving
                if (callback) callback();
            }
        };
    };

    // Set initial sprite direction and begin the animation
    const firstTraversalIsPositive = shouldMoveHorizontallyFirst ? distanceX > 0 : distanceY > 0;
    setSpriteDirection(shouldMoveHorizontallyFirst, firstTraversalIsPositive);
    setTimeout(() => animateTraversal(traversalOneKeyframe, traversalOptions(traversalOneDuration), shouldMoveHorizontallyFirst), 175);
}

function populateSkillsList(skills) {
    const skillsList = document.getElementById('skills-list');
    for (const [skill, projects] of Object.entries(skills)) {
        const listItem = document.createElement('li');
        listItem.textContent = skill;
        listItem.addEventListener('mouseenter', () => highlightProjects(projects));
        listItem.addEventListener('mouseleave', () => unhighlightProjects(projects));
        skillsList.appendChild(listItem);
    }
}

function highlightProjects(projects) {
    projects.forEach(project => {
        const projectElement = document.querySelector(`[data-project="${project}"]`);
        if (projectElement) {
            projectElement.classList.add('blinking-glow-effect');
        }
    });
}

function unhighlightProjects(projects) {
    projects.forEach(project => {
        const projectElement = document.querySelector(`[data-project="${project}"]`);
        if (projectElement) {
            console.log(projectElement)
            projectElement.classList.remove('blinking-glow-effect');
        }
    });
}

let explanations = {};

document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch('explanations.json');
        const data = await response.json();
        explanations = data;

        await loadContentSquares(); // Wait for content squares to load

        showIntroductorySpeechBubble(); // Show the intro speech bubble after loading content squares
        positionSpeechBubbleNextToMovingBox(); // Position the speech bubble
    } catch (error) {
        console.error("Error occurred:", error);
    }

    try {
        const response = await fetch('skills.json');
        const skills = await response.json();
        populateSkillsList(skills);

    } catch (error) {
        console.error("Error occurred while loading skills:", error);
    }
});

window.addEventListener('resize', function () {
    const anchors = calculateIntersectionPoints();
    if (anchors && anchors.length > 0) {
        const topLeftAnchor = anchors[0];
        moveToAnchor(topLeftAnchor);
    }
    positionSpeechBubbleNextToMovingBox();
});

document.getElementById('close-speech').addEventListener('click', function () {
    document.getElementById('speech-bubble').classList.add('hidden');
});
