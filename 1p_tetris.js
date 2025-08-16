const tet_canvas = document.getElementById("tet_canvas");
const tet_ctx = tet_canvas.getContext("2d");

let tet_tiles = Array(23)
  .fill()
  .map(() => Array(10).fill(0));

let put_minos = Array(23)
  .fill()
  .map(() => Array(10).fill(0));

let tet_x = 4;
let tet_y = 4;
let rotate_num = 0;
let next_minos = [];
let check = true;
let save_tet_mino;
let save_rotate_num;
let rotate_save_tet_mino = [];
let keyup = [0, 0, 0, 0]; //ハードドロップ、左回転、右回転、ホールド
let DAS_count = 0;
let start_count = false;
let hold_mino = 0;
let canHold = true;
let Left_Right = 0;
let lastPressed = null;

const mino_color = [
  "#9933FF", // T
  "#00CCFF", // I
  "#00FF00", // S
  "#FF0000", // Z
  "#FF9900", // L
  "#3333FF", // J
  "#FFFF00", // O
];

let keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
  z: false,
  x: false,
  c: false,
};

let sensitivitys = {
  ARR: 10,
  SDF: 20,
  DAS: 6,
  DCD: 3,
};

let mino_style = [
  0,-1,0,1,-1,0,0,0,0,-1,0,0,-1,0,0,1,-1,0,1,0,0,0,0,1,0,0,1,0,-1,0,0,1, // T
  -1,0,1,2,0,0,0,0,0,0,0,0,-1,0,1,2,-1,0,1,2,1,1,1,1,1,1,1,1,-1,0,1,2, //I
  1,0,0,-1,-1,-1,0,0,-1,0,-1,0,-1,0,0,1,1,0,0,-1,0,0,1,1,0,1,0,1,-1,0,0,1, //S
 -1,0,0,1,-1,-1,0,0,0,-1,0,-1,-1,0,0,1,-1,0,0,1,0,0,1,1,1,0,1,0,-1,0,0,1,//Z
  1,-1,0,1,-1,0,0,0,-1,0,0,0,-1,-1,0,1,-1,0,1,-1,0,0,0,1,0,0,0,1,-1,0,1,1, //L
  -1,-1,0,1,-1,0,0,0,0,0,-1,0,-1,0,1,1,-1,0,1,1,0,0,0,1,0,1,0,0,-1,-1,0,1, //J
  0,1,0,1,-1,-1,0,0,0,1,0,1,-1,-1,0,0,0,1,0,1,-1,-1,0,0,0,1,0,1,-1,-1,0,0 //O
];

let rotate_style = [
  [0, 0, -1, 0, -1, 1, 0, -2, -1, -2], //0->R
  [0, 0, 1, 0, 1, -1, 0, 2, 1, 2], //R->0
  [0, 0, 1, 0, 1, -1, 0, 2, 1, 2], //R->2
  [0, 0, -1, 0, -1, 1, 0, -2, -1, -2], //2->R
  [0, 0, 1, 0, 1, 1, 0, -2, 1, -2], //2->L
  [0, 0, -1, 0, -1, -1, 0, 2, -1, 2], //L->2
  [0, 0, -1, 0, -1, -1, 0, 2, -1, 2], //L->0
  [0, 0, 1, 0, 1, 1, 0, -2, 1, -2], //0->L
];

// Iミノ用SRS
let i_rotate_style = [
  [0, 0, -2, 0, 1, 0, -2, -1, 1, 2], //0->R
  [0, 0, 2, 0, -1, 0, 2, 1, -1, -2], //R->0
  [0, 0, -1, 0, 2, 0, -1, 2, 2, -1], //R->2
  [0, 0, 1, 0, -2, 0, 1, -2, -2, 1], //2->R
  [0, 0, 2, 0, -1, 0, 2, 1, -1, -2], //2->L
  [0, 0, -2, 0, 1, 0, -2, -1, 1, 2], //L->2
  [0, 0, 1, 0, -2, 0, 1, -2, -2, 1], //L->0
  [0, 0, -1, 0, 2, 0, -1, 2, 2, -1], //0->L
];

document.addEventListener("keydown", (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      lastPressed = e.key === "ArrowLeft" ? "Left" : "Right";
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (keys.hasOwnProperty(e.key)) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      DAS_count = 0;
      start_count = false;
    }
    keys[e.key] = false;
    if (e.key === "ArrowUp") keyup[0] = 0;
    if (e.key === "z") keyup[1] = 0;
    if (e.key === "x") keyup[2] = 0;
    if (e.key === "c") keyup[3] = 0;
  }
});

function draw_line_1p() {
  tet_ctx.strokeStyle = "gray";
  tet_ctx.lineWidth = 1;

  //メイン
  for (let y = 0; y < 21; y++) {
    tet_ctx.beginPath();
    tet_ctx.moveTo(100, y * 30); //始点x,y
    tet_ctx.lineTo(400, y * 30); //終点x,y
    tet_ctx.stroke();
  }

  for (let x = 0; x < 11; x++) {
    tet_ctx.beginPath();
    tet_ctx.moveTo(x * 30 + 100, 0); //始点x,y
    tet_ctx.lineTo(x * 30 + 100, 600); //終点x,y
    tet_ctx.stroke();
  }

  //Hold
  for (let i = 0; i < 2; i++) {
    tet_ctx.beginPath();
    tet_ctx.moveTo(0, i * 100); //始点x,y
    tet_ctx.lineTo(100, i * 100); //終点x,y
    tet_ctx.stroke();
    tet_ctx.beginPath();
    tet_ctx.moveTo(i * 100, 0); //始点x,y
    tet_ctx.lineTo(i * 100, 100); //終点x,y
    tet_ctx.stroke();
  }

  //Next
  for (let i = 0; i < 2; i++) {
    tet_ctx.beginPath();
    tet_ctx.moveTo(400, i * 400); //始点x,y
    tet_ctx.lineTo(500, i * 400); //終点x,y
    tet_ctx.stroke();
    tet_ctx.beginPath();
    tet_ctx.moveTo(i + 5 * 100, 0); //始点x,y
    tet_ctx.lineTo(i + 5 * 100, 400); //終点x,y
    tet_ctx.stroke();
  }
}

function draw_1p() {
  tet_ctx.clearRect(0, 0, tet_canvas.width, tet_canvas.height);

  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 10; x++) {
      if (tet_tiles[y + 3][x] !== 0) {
        tet_ctx.fillStyle = mino_color[tet_tiles[y + 3][x] - 1];
        tet_ctx.fillRect(x * 30 + 100, y * 30, 30, 30);
      }
    }
  }

  //Next
  if (next_minos.length > 0) {
    for (let i = 0; i < Math.min(5, next_minos.length - 1); i++) {
      if (next_minos[i + 1]) {
        tet_ctx.fillStyle = mino_color[next_minos[i + 1] - 1];
        for (let d = 0; d < 4; d++) {
          if (next_minos[i + 1] === 2 || next_minos[i + 1] === 7) {
            tet_ctx.fillRect(
              mino_style[(next_minos[i + 1] - 1) * 32 + d] * 20 + 430,
              mino_style[(next_minos[i + 1] - 1) * 32 + d + 4] * 20 +
                40 +
                i * 80,
              20,
              20
            );
          } else {
            tet_ctx.fillRect(
              mino_style[(next_minos[i + 1] - 1) * 32 + d] * 20 + 440,
              mino_style[(next_minos[i + 1] - 1) * 32 + d + 4] * 20 +
                40 +
                i * 80,
              20,
              20
            );
          }
        }
      }
    }
  }

  //Hold
  if (hold_mino !== 0) {
    tet_ctx.fillStyle = mino_color[hold_mino - 1];
    for (let i = 0; i < 4; i++) {
      if (hold_mino === 2 || hold_mino === 7) {
        tet_ctx.fillRect(
          mino_style[(hold_mino - 1) * 32 + i] * 20 + 30,
          mino_style[(hold_mino - 1) * 32 + i + 4] * 20 + 45,
          20,
          20
        );
      } else {
        tet_ctx.fillRect(
          mino_style[(hold_mino - 1) * 32 + i] * 20 + 40,
          mino_style[(hold_mino - 1) * 32 + i + 4] * 20 + 45,
          20,
          20
        );
      }
    }
  }
}

function new_mino() {
  rotate_num = 0;
  tet_x = 4;
  tet_y = 4;
  if (next_minos.length < 7) {
    next_minos.push(...next_mino());
  }
}

function next_mino() {
  const mino_types = [1, 2, 3, 4, 5, 6, 7]; //T, I, S, Z, L, J, O
  for (let i = mino_types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mino_types[i], mino_types[j]] = [mino_types[j], mino_types[i]]; // 要素を交換
  }
  return mino_types;
}

function set_mino() {
  for (let y = 0; y < 23; y++) {
    for (let x = 0; x < 10; x++) {
      if (put_minos[y][x] !== 0) {
        tet_tiles[y][x] = put_minos[y][x];
      } else {
        tet_tiles[y][x] = 0;
      }
    }
  }

  save_tet_mino = Array(8).fill(0);
  if (next_minos.length > 0) {
    for (let i = 0; i < 4; i++) {
      let block_x =
        tet_x + mino_style[(next_minos[0] - 1) * 32 + rotate_num * 8 + i];
      let block_y =
        tet_y + mino_style[(next_minos[0] - 1) * 32 + rotate_num * 8 + 4 + i];
      if (block_x >= 0 && block_x < 10 && block_y >= 0 && block_y < 23) {
        tet_tiles[block_y][block_x] = next_minos[0];
      }

      save_tet_mino[i] = block_y;
      save_tet_mino[i + 4] = block_x;
    }
  }
}

function hold() {
  if (canHold === true) {
    if (keys.c && keyup[3] === 0) {
      if (hold_mino === 0) {
        hold_mino = next_minos[0];
        next_minos.shift();
      } else {
        const save_hold = hold_mino;
        hold_mino = next_minos[0];
        next_minos[0] = save_hold;
      }
      canHold = false;
      keyup[3] = 1;

      new_mino();
      set_mino();

      resetDAS();
    }
  }
}

function line_check() {
  for (let i = 0; i < 23; i++) {
    let count_tile = 0;
    for (let x = 0; x < 10; x++) {
      if (put_minos[i][x] !== 0) {
        count_tile++;
      }
    }
    if (count_tile === 10) {
      put_minos.splice(i, 1);
      put_minos.unshift(Array(10).fill(0));
      for (let yy = 0; yy < 20; yy++) {
        for (let xx = 0; xx < 10; xx++) {
          tet_tiles[yy][xx] = put_minos[yy][xx];
        }
      }
    }
  }
  set_mino();
}

function resetDAS() {
  if (keys.ArrowLeft || keys.ArrowRight) {
    DAS_count = 0;
    start_count = true;
  }
}

function move () {
    
  if (keys.ArrowLeft && !keys.ArrowRight) {
    Left_Right = "Left";
  } else if (keys.ArrowRight && !keys.ArrowLeft) {
    Left_Right = "Right";
  } else if (keys.ArrowLeft && keys.ArrowRight) {
    if (lastPressed === "Left") {
      Left_Right = "Left";
    } else if (lastPressed === "Right") {
      Left_Right = "Right";
    }
  } else {
    Left_Right = 0;
  }

  if (Left_Right === "Left") {
    if (DAS_count === 0) {
      move_check("Left");
      if (check === true) {
        start_count = true;
        tet_x--;
      }
    } else if (DAS_count === sensitivitys.DAS) {
      for (let i = 0; i < sensitivitys.ARR; i++) {
        move_check("Left");
        if (check === true) {
          tet_x--;
          set_mino();
        }
      }
    }
    set_mino();
  }
  if (Left_Right === "Right") {
    if (DAS_count === 0) {
      move_check("Right");
      if (check === true) {
        start_count = true;
        tet_x++;
      }
    } else if (DAS_count === sensitivitys.DAS) {
      for (let i = 0; i < sensitivitys.ARR; i++) {
        move_check("Right");
        if (check === true) {
          tet_x++;
          set_mino()
        }
      }
    }
    set_mino();
  }
  if (keys.ArrowDown) {
    for (let i = 0; i < sensitivitys.SDF; i++) {
      move_check("Down");
      if (check === true) {
        tet_y++;
        set_mino();
      }
    }
  }
  if (keys.ArrowUp) {
    if (keyup[0] === 0) {
      move_check("HardDrop");
      keyup[0] = 1;
      set_mino();
      for (let i = 0; i < 4; i++) {
        put_minos[save_tet_mino[i]][save_tet_mino[i + 4]] = next_minos[0];
      }
      next_minos.shift();
      canHold = true;
      new_mino();
      set_mino();
      line_check();

      resetDAS();
    }
  }
}

function move_check (control) {
  check = true;
  let check_num = 0;
  switch (control) {
    case "Left":
      for (let i = 0; i < 4; i++) {
        if (save_tet_mino[i + 4] - 1 > -1 && put_minos[save_tet_mino[i]][save_tet_mino[i + 4] - 1] === 0) {
          check_num++;
        }
      }
      if (check_num < 4) {
        check = false;
      }
      break;
    case "Right":
      for (let i = 0; i < 4; i++) {
        if (save_tet_mino[i + 4] + 1 < 10 && put_minos[save_tet_mino[i]][save_tet_mino[i + 4] + 1] === 0) {
          check_num++;
        }
      }
      if (check_num < 4) {
        check = false;
      }
      break;
    case "Down":
      for (let i = 0; i < 4; i++) {
        if (save_tet_mino[i] + 1 < 23 && put_minos[save_tet_mino[i] + 1][save_tet_mino[i + 4]] === 0) {
          check_num++;
        }
      }
      if (check_num < 4) {
        check = false;
      }
      break;
    case "HardDrop":
      let drop_distance = 0;
      while (true) {
        check_num = 0;

        for (let i = 0; i < 4; i++) {
          let next_y = save_tet_mino[i] + drop_distance + 1;
          let block_x = save_tet_mino[i + 4];
          if (next_y < 23 && put_minos[next_y][block_x] === 0) {
            check_num++;
          }
        }

        if (check_num === 4) {
          drop_distance++;
        } else {
          break;
        }
      }
      tet_y += drop_distance;
      break;
  }
}

function rotate () {
  if (keys.z && keyup[1] === 0) {
    save_rotate_num = rotate_num;
    if (rotate_num === 3) {
      rotate_num = 0;
    } else {
      rotate_num++;
    }
    rotate_type();
    keyup[1] = 1;
    set_mino();

    resetDAS();
  }

  if (keys.x && keyup[2] === 0) {
    save_rotate_num = rotate_num;
    if (rotate_num === 0) {
      rotate_num = 3;
    } else {
      rotate_num--;
    }
    rotate_type();
    keyup[2] = 1;
    set_mino();

    resetDAS();
  }
}

function rotate_type() {
  let rotate_plase;
  let rotate_plase_num = 0;
  let sub_rotate_x_y = [];
  let rotate_check_num = 0;
  let save_x_y = [tet_x, tet_y];

  switch (`${save_rotate_num}${rotate_num}`) {
    case "03":
      rotate_plase = 0;
      break;
    case "30":
      rotate_plase = 1;
      break;
    case "32":
      rotate_plase = 2;
      break;
    case "23":
      rotate_plase = 3;
      break;
    case "21":
      rotate_plase = 4;
      break;
    case "12":
      rotate_plase = 5;
      break;
    case "10":
      rotate_plase = 6;
      break;
    case "01":
      rotate_plase = 7;
      break;
  }
  const current_rotate_style = next_minos[0] === 2 ? i_rotate_style : rotate_style;
  while (true) {
    sub_rotate_x_y = [];
    rotate_check_num = 0;
    tet_x = save_x_y[0] + current_rotate_style[rotate_plase][rotate_plase_num * 2];
    tet_y = save_x_y[1] + (-1 * current_rotate_style[rotate_plase][rotate_plase_num * 2 + 1]);
    
    for (let i = 0; i < 4; i++) {
      sub_rotate_x_y[i] = tet_y + mino_style[(next_minos[0] - 1) * 32 + rotate_num * 8 + i + 4];
      sub_rotate_x_y[i + 4] = tet_x + mino_style[(next_minos[0] - 1) * 32 + rotate_num * 8 + i];
    }

    for (let i = 0; i < 4; i++) {
      if (
        sub_rotate_x_y[i + 4] >= 0 &&
        sub_rotate_x_y[i + 4] < 10 &&
        sub_rotate_x_y[i] < 23 &&
        put_minos[sub_rotate_x_y[i]][sub_rotate_x_y[i + 4]] === 0
      ) {
        rotate_check_num++;
      }
    }

    if (rotate_check_num === 4) {
      break;
    } else {
      rotate_plase_num++;
      if (rotate_plase_num === 5) {
        tet_x = save_x_y[0];
        tet_y = save_x_y[1];
        rotate_num = save_rotate_num;
        break;
      }
    }
  }
}

function draw_shadow() {
  let drop_distance = 0;

  while (true) {
    let canDrop = true;
    for (let i = 0; i < 4; i++) {
      let nextY = save_tet_mino[i] + drop_distance + 1;
      let blockX = save_tet_mino[i + 4];
      if (nextY >= 23 || put_minos[nextY][blockX] !== 0) {
        canDrop = false;
        break;
      }
    }
    if (canDrop) {
      drop_distance++;
    } else {
      break;
    }
  }

  tet_ctx.fillStyle = "#85858585";
  for (let i = 0; i < 4; i++) {
    let blockX = save_tet_mino[i + 4];
    let blockY = save_tet_mino[i] + drop_distance;
    tet_ctx.fillRect(blockX * 30 + 100, (blockY - 3) * 30, 30, 30);
  }
}

new_mino();
set_mino();

setInterval(() => {
  if (start_count === true) {
    DAS_count++;
  }
  hold();
  rotate();
  move();
  draw_1p();
  draw_line_1p();
  draw_shadow()
}, 16);
