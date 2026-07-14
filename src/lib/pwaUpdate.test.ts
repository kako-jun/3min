import { describe, it, expect } from 'vitest'
import {
  isUpdateCooldownActive,
  isEditingElement,
  shouldContinueDeferring,
  canStartUpdateFlow,
  UPDATE_COOLDOWN_MS,
  MAX_DEFER_MS,
} from './pwaUpdate'

/**
 * Unit tests for src/lib/pwaUpdate.ts — the pure judgement functions behind
 * the PWA update overlay/reload flow (docs/architecture.md "PWA更新方針",
 * GitHub Issue #43).
 *
 * These functions were extracted out of src/main.tsx specifically so this
 * logic could be unit-tested without a DOM. main.tsx itself is thin
 * DOM/SW-registration wiring around these functions and is NOT exercised by
 * this file — see the test report for why, and what that leaves uncovered.
 */

// isEditingElement/shouldContinueDeferring only read `.tagName` and
// `.isContentEditable`, so a plain object stand-in is enough — no DOM needed.
function fakeElement(tagName: string, isContentEditable = false): Element {
  return { tagName, isContentEditable } as unknown as Element
}

describe('isUpdateCooldownActive', () => {
  it('returns false when lastUpdatedAt is null (never updated yet)', () => {
    expect(isUpdateCooldownActive(null, 1_000_000)).toBe(false)
  })

  it('returns true just below the cooldown boundary (elapsed = COOLDOWN_MS - 1)', () => {
    expect(isUpdateCooldownActive(0, UPDATE_COOLDOWN_MS - 1)).toBe(true)
  })

  it('returns false exactly at the cooldown boundary (elapsed === COOLDOWN_MS, catches < vs <= mistakes)', () => {
    expect(isUpdateCooldownActive(0, UPDATE_COOLDOWN_MS)).toBe(false)
  })

  it('returns false just above the cooldown boundary (elapsed = COOLDOWN_MS + 1)', () => {
    expect(isUpdateCooldownActive(0, UPDATE_COOLDOWN_MS + 1)).toBe(false)
  })

  it('returns false when now is before lastUpdatedAt (clock rolled back, elapsed negative)', () => {
    // Characterization, not a spec requirement: the guard is
    // `elapsed >= 0 && elapsed < durationMs`, so a negative elapsed (clock skew)
    // is treated as NOT in cooldown — an update is allowed to proceed right
    // away rather than being blocked indefinitely by a bad clock. This commit
    // only reordered when markUpdated() is called (bugfix 3); it did not touch
    // this negative-elapsed branch, so the pre-existing "allow through" choice
    // still stands.
    expect(isUpdateCooldownActive(10_000, 9_000)).toBe(false)
  })

  it('respects a custom durationMs override', () => {
    expect(isUpdateCooldownActive(0, 4_999, 5_000)).toBe(true)
    expect(isUpdateCooldownActive(0, 5_000, 5_000)).toBe(false)
  })
})

describe('isEditingElement', () => {
  it('returns false when there is no active element (activeElement === null)', () => {
    expect(isEditingElement(null)).toBe(false)
  })

  it('returns true for an INPUT element', () => {
    expect(isEditingElement(fakeElement('INPUT'))).toBe(true)
  })

  it('returns true for a TEXTAREA element', () => {
    expect(isEditingElement(fakeElement('TEXTAREA'))).toBe(true)
  })

  it('returns true for a contentEditable element (e.g. a DIV with contenteditable)', () => {
    expect(isEditingElement(fakeElement('DIV', true))).toBe(true)
  })

  it('returns false for a non-editable, non-contentEditable element (BUTTON)', () => {
    expect(isEditingElement(fakeElement('BUTTON'))).toBe(false)
  })

  it('returns false for a SELECT element', () => {
    expect(isEditingElement(fakeElement('SELECT'))).toBe(false)
  })

  it('CHARACTERIZATION: an INPUT of type=checkbox is still "editing" (type is not inspected)', () => {
    // The implementation only checks tagName === 'INPUT'; it never reads
    // `.type`. A checkbox/radio/button input is therefore treated exactly
    // like a text input, deferring reload even though there is no text being
    // typed. Pinning current behavior — see report for whether this is
    // intentional.
    const checkbox = {
      tagName: 'INPUT',
      type: 'checkbox',
      isContentEditable: false,
    } as unknown as Element
    expect(isEditingElement(checkbox)).toBe(true)
  })
})

describe('shouldContinueDeferring', () => {
  const editingEl = fakeElement('INPUT')
  const idleEl = fakeElement('BUTTON')

  it('continues deferring just below the max-defer boundary while editing (deferredMs = MAX_DEFER_MS - 1)', () => {
    expect(shouldContinueDeferring(editingEl, MAX_DEFER_MS - 1)).toBe(true)
  })

  it('stops deferring exactly at the max-defer boundary while editing (deferredMs === MAX_DEFER_MS, forces the update through)', () => {
    expect(shouldContinueDeferring(editingEl, MAX_DEFER_MS)).toBe(false)
  })

  it('stops deferring just above the max-defer boundary while editing (deferredMs = MAX_DEFER_MS + 1)', () => {
    expect(shouldContinueDeferring(editingEl, MAX_DEFER_MS + 1)).toBe(false)
  })

  it('never needs to defer when not editing, regardless of deferredMs', () => {
    expect(shouldContinueDeferring(idleEl, 0)).toBe(false)
    expect(shouldContinueDeferring(idleEl, MAX_DEFER_MS - 1)).toBe(false)
  })

  it('respects a custom maxDeferMs override', () => {
    expect(shouldContinueDeferring(editingEl, 999, 1_000)).toBe(true)
    expect(shouldContinueDeferring(editingEl, 1_000, 1_000)).toBe(false)
  })

  /**
   * Regression for the "defer terminates, then reload fires blind" bug
   * (Issue #43 review, fix 2): the original main.tsx evaluated this decision
   * exactly once, at the end of the initial idle-polling loop. Once that loop
   * decided to proceed, nothing rechecked document.activeElement again during
   * the ~1.5-3.5s window before the overlay/skipWaiting/reload sequence
   * actually completed — a user who resumed typing in that window got
   * reloaded out from under their keystrokes.
   *
   * The fix re-runs this exact same function at each reload-commit
   * checkpoint (right before sending skipWaiting, inside the controllerchange
   * handler, and inside the fallback timer). These tests pin the decisions at
   * those checkpoints specifically, using the same deferredMs value that
   * would be carried over from the original loop exit (main.tsx does not
   * reset deferredMs between checkpoints).
   */
  describe('reload-checkpoint re-check (regression: defer resumed after the initial loop exited idle)', () => {
    it('says "keep deferring" if editing resumed before a checkpoint, even though the loop originally exited idle (deferredMs=0)', () => {
      expect(shouldContinueDeferring(editingEl, 0)).toBe(true)
    })

    it('says "proceed" if still idle at the checkpoint (matches the original loop-exit decision)', () => {
      expect(shouldContinueDeferring(idleEl, 0)).toBe(false)
    })

    it('says "proceed" even if editing resumed, when the loop originally force-exited at MAX_DEFER_MS (the forced-through decision is not re-litigated later)', () => {
      expect(shouldContinueDeferring(editingEl, MAX_DEFER_MS)).toBe(false)
    })
  })
})

describe('canStartUpdateFlow', () => {
  /**
   * Regression for the "cooldown shorter than max-defer" concurrency bug
   * (Issue #43 review, fix 1): UPDATE_COOLDOWN_MS (10s) is shorter than
   * MAX_DEFER_MS (60s), so while a first update flow is deferred by continued
   * typing, a second onNeedRefresh firing after the 10s cooldown window
   * elapses would slip past isUpdateCooldownActive() and start a second,
   * concurrent update flow (duplicate overlay, duplicate skipWaiting,
   * duplicate reload timers) unless something else blocks it. This function
   * is that primary guard — main.tsx evaluates it before the cooldown check,
   * driven by a module-level `applying` flag that stays true once an update
   * flow has started (see main.tsx for why it's never reset on the success
   * path).
   */
  it('returns true when no update flow is currently applying', () => {
    expect(canStartUpdateFlow(false)).toBe(true)
  })

  it('returns false when an update flow is already applying (blocks a concurrent second flow)', () => {
    expect(canStartUpdateFlow(true)).toBe(false)
  })
})
