const ACTIONS = ['left', 'right', 'jump', 'shoot'] as const;

export type TouchAction = typeof ACTIONS[number];

export function createTouchState({ movementCenterX }: { movementCenterX: number }) {
  const actionPointers = new Map<TouchAction, Set<number>>();
  const pendingPresses = new Set<TouchAction>();
  const pointerActions = new Map<number, TouchAction>();
  let activeMovementPointer: number | null = null;

  for (const action of ACTIONS) {
    actionPointers.set(action, new Set());
  }

  const api = {
    get left() {
      return actionPointers.get('left')!.size > 0;
    },
    get right() {
      return actionPointers.get('right')!.size > 0;
    },
    get jump() {
      return actionPointers.get('jump')!.size > 0;
    },
    get shoot() {
      return actionPointers.get('shoot')!.size > 0;
    },
    startMovementPointer(pointerId: number, pointerX: number) {
      if (activeMovementPointer !== null && activeMovementPointer !== pointerId) return;

      activeMovementPointer = pointerId;
      setMovementDirection(pointerId, pointerX);
    },
    moveMovementPointer(pointerId: number, pointerX: number) {
      if (activeMovementPointer !== pointerId) return;

      setMovementDirection(pointerId, pointerX);
    },
    pressAction(action: Exclude<TouchAction, 'left' | 'right'>, pointerId: number) {
      bindPointerToAction(pointerId, action);
      pendingPresses.add(action);
    },
    releasePointer(pointerId: number) {
      if (activeMovementPointer === pointerId) {
        activeMovementPointer = null;
      }

      unbindPointer(pointerId);
    },
    consumeAction(action: Exclude<TouchAction, 'left' | 'right'>) {
      if (!pendingPresses.has(action)) return false;

      pendingPresses.delete(action);
      return true;
    },
    clear() {
      activeMovementPointer = null;
      pendingPresses.clear();
      pointerActions.clear();

      for (const action of ACTIONS) {
        actionPointers.get(action)!.clear();
      }
    },
  };

  function setMovementDirection(pointerId: number, pointerX: number) {
    const direction = pointerX < movementCenterX ? 'left' : 'right';
    bindPointerToAction(pointerId, direction);
  }

  function bindPointerToAction(pointerId: number, action: TouchAction) {
    const currentAction = pointerActions.get(pointerId);

    if (currentAction === action) return;

    if (currentAction) {
      actionPointers.get(currentAction)!.delete(pointerId);
    }

    actionPointers.get(action)!.add(pointerId);
    pointerActions.set(pointerId, action);
  }

  function unbindPointer(pointerId: number) {
    const currentAction = pointerActions.get(pointerId);
    if (!currentAction) return;

    actionPointers.get(currentAction)!.delete(pointerId);
    pointerActions.delete(pointerId);
  }

  return api;
}
