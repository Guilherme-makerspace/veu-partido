export default class InputSNES {
  constructor(scene) {
    this.scene = scene;
    this.pads = [null, null];
    this.prevState = [{}, {}];
    this.state = [{}, {}];

    this.keys = {
      p1: scene.input.keyboard.addKeys({
        up: 'W', down: 'S', left: 'A', right: 'D',
        action: 'F', skill: 'G', menu: 'TAB', special: 'E',
      }),
      p2: scene.input.keyboard.addKeys({
        up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT',
        action: 'L', skill: 'K', menu: 'SHIFT', special: 'I',
      }),
    };

    scene.input.gamepad.on('connected', (pad) => {
      if (!this.pads[0]) {
        this.pads[0] = pad;
      } else if (!this.pads[1]) {
        this.pads[1] = pad;
      }
    });

    scene.input.gamepad.on('disconnected', (pad) => {
      if (this.pads[0] === pad) this.pads[0] = null;
      if (this.pads[1] === pad) this.pads[1] = null;
    });
  }

  update() {
    for (let i = 0; i < 2; i++) {
      this.prevState[i] = { ...this.state[i] };
      const pad = this.pads[i];
      const kb = i === 0 ? this.keys.p1 : this.keys.p2;

      this.state[i] = {
        up: (pad ? pad.up : false) || kb.up.isDown,
        down: (pad ? pad.down : false) || kb.down.isDown,
        left: (pad ? pad.left : false) || kb.left.isDown,
        right: (pad ? pad.right : false) || kb.right.isDown,
        action: (pad ? pad.buttons[0].pressed : false) || kb.action.isDown,
        skill: (pad ? pad.buttons[1].pressed : false) || kb.skill.isDown,
        special: (pad ? pad.buttons[3].pressed : false) || kb.special.isDown,
        menu: (pad ? pad.buttons[9].pressed : false) || kb.menu.isDown,
        lb: (pad ? pad.buttons[4].pressed : false),
        rb: (pad ? pad.buttons[5].pressed : false),
        axisX: pad ? pad.leftStick.x : ((kb.right.isDown ? 1 : 0) - (kb.left.isDown ? 1 : 0)),
        axisY: pad ? pad.leftStick.y : ((kb.down.isDown ? 1 : 0) - (kb.up.isDown ? 1 : 0)),
      };
    }
  }

  justPressed(player, button) {
    const idx = player - 1;
    return this.state[idx][button] && !this.prevState[idx][button];
  }

  isDown(player, button) {
    return !!this.state[player - 1][button];
  }

  getAxis(player) {
    const s = this.state[player - 1];
    return { x: s.axisX || 0, y: s.axisY || 0 };
  }
}
