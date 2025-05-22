declare module 'react-beautiful-dnd' {
  import * as React from 'react';

  export type Id = string;
  export type DraggableId = Id;
  export type DroppableId = Id;
  export type TypeId = Id;
  export type ZIndex = React.CSSProperties['zIndex'];
  export type DropReason = 'DROP' | 'CANCEL';
  export type Announce = (message: string) => void;

  export interface DraggableLocation {
    droppableId: DroppableId;
    index: number;
  }

  export type MovementMode = 'FLUID' | 'SNAP';

  export interface DraggableRubric {
    draggableId: DraggableId;
    type: TypeId;
    source: DraggableLocation;
  }

  export interface DragStart extends DraggableRubric {
    mode: MovementMode;
  }

  export interface DragUpdate extends DragStart {
    destination?: DraggableLocation | null;
    combine?: Combine | null;
  }

  export interface DropResult extends DragUpdate {
    reason: DropReason;
  }

  export interface Combine {
    draggableId: DraggableId;
    droppableId: DroppableId;
  }

  export interface DroppableProvided {
    innerRef: React.RefCallback<HTMLElement>;
    droppableProps: {
      'data-rbd-droppable-id': DroppableId;
      'data-rbd-droppable-context-id': string;
    };
    placeholder?: React.ReactElement<HTMLElement> | null;
  }

  export interface DroppableStateSnapshot {
    isDraggingOver: boolean;
    draggingOverWith?: DraggableId | null;
    draggingFromThisWith?: DraggableId | null;
    isUsingPlaceholder: boolean;
  }

  export interface DroppableProps {
    droppableId: DroppableId;
    type?: TypeId;
    mode?: 'standard' | 'virtual';
    isDropDisabled?: boolean;
    isCombineEnabled?: boolean;
    direction?: 'horizontal' | 'vertical';
    ignoreContainerClipping?: boolean;
    renderClone?: DraggableChildrenFn;
    getContainerForClone?: () => HTMLElement;
    children: (
      provided: DroppableProvided,
      snapshot: DroppableStateSnapshot
    ) => React.ReactElement<HTMLElement>;
  }

  export interface DraggableProvided {
    draggableProps: {
      'data-rbd-draggable-context-id': string;
      'data-rbd-draggable-id': DraggableId;
      style?: React.CSSProperties;
      onTransitionEnd?: React.TransitionEventHandler<HTMLElement>;
    };
    dragHandleProps: {
      'data-rbd-drag-handle-draggable-id': DraggableId;
      'data-rbd-drag-handle-context-id': string;
      role: string;
      tabIndex: number;
      draggable: boolean;
      onDragStart: React.DragEventHandler<HTMLElement>;
    } | null;
    innerRef: React.RefCallback<HTMLElement>;
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean;
    isDropAnimating: boolean;
    isClone: boolean;
    dropAnimation?: DropAnimation | null;
    draggingOver?: DroppableId | null;
    combineWith?: DraggableId | null;
    combineTargetFor?: DraggableId | null;
    mode?: MovementMode | null;
  }

  export interface DropAnimation {
    duration: number;
    curve: string;
    moveTo: Position;
    opacity?: number | null;
    scale?: number | null;
  }

  export interface Position {
    x: number;
    y: number;
  }

  export type DraggableChildrenFn = (
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
    rubric: DraggableRubric
  ) => React.ReactElement<HTMLElement>;

  export interface DraggableProps {
    draggableId: DraggableId;
    index: number;
    isDragDisabled?: boolean;
    disableInteractiveElementBlocking?: boolean;
    shouldRespectForcePress?: boolean;
    children: DraggableChildrenFn;
  }

  export interface DragDropContextProps {
    onBeforeDragStart?: (start: DragStart) => void;
    onDragStart?: (start: DragStart, provided: ResponderProvided) => void;
    onDragUpdate?: (update: DragUpdate, provided: ResponderProvided) => void;
    onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
    children: React.ReactNode;
  }

  export interface ResponderProvided {
    announce: Announce;
  }

  export class Droppable extends React.Component<DroppableProps> {}
  export class Draggable extends React.Component<DraggableProps> {}
  export class DragDropContext extends React.Component<DragDropContextProps> {}
} 