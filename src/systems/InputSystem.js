export class InputSystem {
  constructor(scene) {
    this.scene = scene;
    this.keys = {};
    this._setupKeyboard();
    this._gamepadState = [null, null];
    this._prevGamepadState = [null, null];
  }

  _setupKeyboard() {
    const { KeyCodes } = Phaser.Input.Keyboard;
    this.keys = {
      p1: {
        left:   this.scene.input.keyboard.addKey(KeyCodes.A),
        right:  this.scene.input.keyboard.addKey(KeyCodes.D),
        up:     this.scene.input.keyboard.addKey(KeyCodes.W),
        down:   this.scene.input.keyboard.addKey(KeyCodes.S),
        attack: this.scene.input.keyboard.addKey(KeyCodes.E),
        skill:  this.scene.input.keyboard.addKey(KeyCodes.Q),
      },
      p2: {
        left:   this.scene.input.keyboard.addKey(KeyCodes.LEFT),
        right:  this.scene.input.keyboard.addKey(KeyCodes.RIGHT),
        up:     this.scene.input.keyboard.addKey(KeyCodes.UP),
        down:   this.scene.input.keyboard.addKey(KeyCodes.DOWN),
        attack: this.scene.input.keyboard.addKey(KeyCodes.L),
        skill:  this.scene.input.keyboard.addKey(KeyCodes.K),
      },
    };
  }

  getP1State() {
    const k = this.keys.p1;
    return {
      left:   k.left.isDown,
      right:  k.right.isDown,
      up:     k.up.isDown,
      down:   k.down.isDown,
      attack: Phaser.Input.Keyboard.JustDown(k.attack),
      skill:  Phaser.Input.Keyboard.JustDown(k.skill),
    };
  }

  getP2State() {
    const k = this.keys.p2;
    return {
      left:   k.left.isDown,
      right:  k.right.isDown,
      up:     k.up.isDown,
      down:   k.down.isDown,
      attack: Phaser.Input.Keyboard.JustDown(k.attack),
      skill:  Phaser.Input.Keyboard.JustDown(k.skill),
    };
  }
}
