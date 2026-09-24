'use client';

import { Component, type ReactNode } from 'react';

interface CanvasBoundaryProps {
  /** Names the scene in the console message. */
  label: string;
  /** Called once if the 3D scene throws, so the section can switch to a layout without it. */
  onFail: () => void;
  children: ReactNode;
}

interface CanvasBoundaryState {
  failed: boolean;
}

/** Keeps a GPU or shader failure inside a 3D scene from taking the page down with it. */
export class CanvasBoundary extends Component<CanvasBoundaryProps, CanvasBoundaryState> {
  state: CanvasBoundaryState = { failed: false };

  static getDerivedStateFromError(): CanvasBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`The ${this.props.label} could not render`, error);
    this.props.onFail();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
