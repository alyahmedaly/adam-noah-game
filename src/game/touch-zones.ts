const MOVE_ZONE_WIDTH = 172;
const MOVE_ZONE_HEIGHT = 112;
const JUMP_BTN_RADIUS = 40;
const MARGIN = 24;

export type TouchRegion = 'left' | 'right' | 'jump' | 'shoot' | null;

export function getTouchLayout(width: number, height: number) {
  const moveZoneX = MARGIN + MOVE_ZONE_WIDTH / 2;
  const moveZoneY = height - MARGIN - MOVE_ZONE_HEIGHT / 2;
  const jumpX = width - MARGIN - JUMP_BTN_RADIUS - 20;
  const jumpY = height - MARGIN - JUMP_BTN_RADIUS - 20;

  return {
    moveZone: {
      centerX: moveZoneX,
      centerY: moveZoneY,
      width: MOVE_ZONE_WIDTH,
      height: MOVE_ZONE_HEIGHT,
    },
    leftPad: {
      x: moveZoneX - 42,
      y: moveZoneY,
      radius: 34,
    },
    rightPad: {
      x: moveZoneX + 42,
      y: moveZoneY,
      radius: 34,
    },
    jumpButton: {
      x: jumpX,
      y: jumpY,
      radius: JUMP_BTN_RADIUS,
    },
    shootButton: {
      x: jumpX,
      y: jumpY - 96,
      radius: JUMP_BTN_RADIUS * 0.8,
    },
  };
}

export function getTouchRegionAtPoint(
  width: number,
  height: number,
  x: number,
  y: number
): TouchRegion {
  const layout = getTouchLayout(width, height);
  const moveZoneLeft = layout.moveZone.centerX - layout.moveZone.width / 2;
  const moveZoneRight = layout.moveZone.centerX + layout.moveZone.width / 2;
  const moveZoneTop = layout.moveZone.centerY - layout.moveZone.height / 2;
  const moveZoneBottom = layout.moveZone.centerY + layout.moveZone.height / 2;

  if (x >= moveZoneLeft && x <= moveZoneRight && y >= moveZoneTop && y <= moveZoneBottom) {
    return x < layout.moveZone.centerX ? 'left' : 'right';
  }

  if (isInsideCircle(x, y, layout.jumpButton.x, layout.jumpButton.y, layout.jumpButton.radius)) {
    return 'jump';
  }

  if (isInsideCircle(x, y, layout.shootButton.x, layout.shootButton.y, layout.shootButton.radius)) {
    return 'shoot';
  }

  return null;
}

function isInsideCircle(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  radius: number
) {
  const dx = x - centerX;
  const dy = y - centerY;

  return (dx * dx) + (dy * dy) <= radius * radius;
}
