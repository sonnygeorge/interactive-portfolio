class Sprite {
    constructor(spriteElement) {
        this.spriteElement = spriteElement;
        this.currentAnimation = null;
    }

    // Image paths as constants
    static STATIONARY_IMAGE = 'assets/character_4.svg';
    static WALKING_FRAMES_UP = ['assets/character_13.svg', 'assets/character_14.svg', 'assets/character_15.svg', 'assets/character_16.svg'];;
    static WALKING_FRAMES_DOWN = ['assets/character_1.svg', 'assets/character_2.svg', 'assets/character_3.svg', 'assets/character_4.svg'];
    static WALKING_FRAMES_RIGHT = ['assets/character_9.svg', 'assets/character_10.svg', 'assets/character_11.svg', 'assets/character_12.svg'];
    static WALKING_FRAMES_LEFT = ['assets/character_5.svg', 'assets/character_6.svg', 'assets/character_7.svg', 'assets/character_8.svg']

    setStationary() {
        this.clearAnimation();
        this.spriteElement.style.backgroundImage = `url("${Sprite.STATIONARY_IMAGE}")`;
    }

    setWalkingLeft() {
        this.setAnimation(Sprite.WALKING_FRAMES_LEFT);
    }

    setWalkingRight() {
        this.setAnimation(Sprite.WALKING_FRAMES_RIGHT);
    }

    setWalkingDown() {
        this.setAnimation(Sprite.WALKING_FRAMES_DOWN);
    }

    setWalkingUp() {
        this.setAnimation(Sprite.WALKING_FRAMES_UP);
    }

    setAnimation(frames) {
        this.clearAnimation();
        let frameIndex = 0;
        this.currentAnimation = setInterval(() => {
            this.spriteElement.style.backgroundImage = `url(${frames[frameIndex]})`;
            frameIndex = (frameIndex + 1) % frames.length; // Loop through the frames
        }, 250); // Adjust the interval for animation speed
    }

    clearAnimation() {
        if (this.currentAnimation) {
            clearInterval(this.currentAnimation);
            this.currentAnimation = null;
        }
    }
}


export default Sprite;
