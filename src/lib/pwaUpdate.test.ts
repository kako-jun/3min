import { describe, it, expect } from 'vitest'
import {
  isUpdateCooldownActive,
  isEditingElement,
  shouldContinueDeferring,
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
})
