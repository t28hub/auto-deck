import { Emu, rect } from '@auto-deck/schema';
import { applyPatches } from 'immer';
import { describe, expect, it } from 'vitest';
import { deckWith, onlyElement, onlyText, slideWith, textElement } from './fixture';
import { applyCommand } from './reducer';

describe('applyCommand', () => {
  describe('setElementBounds', () => {
    it('should replace the element bounds and produce reversible patches', () => {
      // Arrange
      const element = textElement('a', 0, 0, 100, 50);
      const slide = slideWith([element]);
      const deck = deckWith([slide]);
      const bounds = rect(Emu.of(10), Emu.of(20), Emu.of(100), Emu.of(50));

      // Act
      const result = applyCommand(deck, { type: 'setElementBounds', slideId: slide.id, elementId: element.id, bounds });

      // Assert
      expect(onlyElement(result.deck).bounds).toEqual({ x: 10, y: 20, w: 100, h: 50 });
      expect(result.forward.length).toBeGreaterThan(0);
      expect(result.deck).not.toBe(deck);
      expect(applyPatches(result.deck, [...result.inverse])).toEqual(deck);
    });

    it('should be a no-op when the bounds are unchanged', () => {
      // Arrange
      const element = textElement('a', 0, 0, 100, 50);
      const slide = slideWith([element]);
      const deck = deckWith([slide]);
      const bounds = rect(Emu.of(0), Emu.of(0), Emu.of(100), Emu.of(50));

      // Act
      const result = applyCommand(deck, { type: 'setElementBounds', slideId: slide.id, elementId: element.id, bounds });

      // Assert
      expect(result.forward).toHaveLength(0);
      expect(result.deck).toBe(deck);
    });

    it('should be a no-op when the element is missing', () => {
      // Arrange
      const slide = slideWith([textElement('a')]);
      const deck = deckWith([slide]);
      const bounds = rect(Emu.of(10), Emu.of(20), Emu.of(100), Emu.of(50));

      // Act
      const result = applyCommand(deck, {
        type: 'setElementBounds',
        slideId: slide.id,
        elementId: textElement('missing').id,
        bounds,
      });

      // Assert
      expect(result.forward).toHaveLength(0);
      expect(result.deck).toBe(deck);
    });
  });

  describe('setElementText', () => {
    it('should replace the text and produce reversible patches', () => {
      // Arrange
      const element = textElement('before');
      const slide = slideWith([element]);
      const deck = deckWith([slide]);

      // Act
      const result = applyCommand(deck, {
        type: 'setElementText',
        slideId: slide.id,
        elementId: element.id,
        text: 'after',
      });

      // Assert
      expect(onlyText(result.deck)).toBe('after');
      expect(applyPatches(result.deck, [...result.inverse])).toEqual(deck);
    });

    it('should be a no-op when the text is unchanged', () => {
      // Arrange
      const element = textElement('same');
      const slide = slideWith([element]);
      const deck = deckWith([slide]);

      // Act
      const result = applyCommand(deck, {
        type: 'setElementText',
        slideId: slide.id,
        elementId: element.id,
        text: 'same',
      });

      // Assert
      expect(result.forward).toHaveLength(0);
      expect(result.deck).toBe(deck);
    });
  });

  describe('addElement', () => {
    it('should append the element by default', () => {
      // Arrange
      const slide = slideWith([textElement('a')]);
      const deck = deckWith([slide]);
      const added = textElement('b');

      // Act
      const result = applyCommand(deck, { type: 'addElement', slideId: slide.id, element: added });

      // Assert
      expect(result.deck.slides[0]?.elements.map((element) => element.id)).toEqual([slide.elements[0]?.id, added.id]);
      expect(applyPatches(result.deck, [...result.inverse])).toEqual(deck);
    });

    it('should insert the element at the given index', () => {
      // Arrange
      const first = textElement('a');
      const slide = slideWith([first]);
      const deck = deckWith([slide]);
      const added = textElement('b');

      // Act
      const result = applyCommand(deck, { type: 'addElement', slideId: slide.id, element: added, index: 0 });

      // Assert
      expect(result.deck.slides[0]?.elements.map((element) => element.id)).toEqual([added.id, first.id]);
    });
  });

  describe('removeElement', () => {
    it('should remove the element and produce reversible patches', () => {
      // Arrange
      const kept = textElement('a');
      const removed = textElement('b');
      const slide = slideWith([kept, removed]);
      const deck = deckWith([slide]);

      // Act
      const result = applyCommand(deck, { type: 'removeElement', slideId: slide.id, elementId: removed.id });

      // Assert
      expect(result.deck.slides[0]?.elements.map((element) => element.id)).toEqual([kept.id]);
      expect(applyPatches(result.deck, [...result.inverse])).toEqual(deck);
    });

    it('should be a no-op when the element is missing', () => {
      // Arrange
      const slide = slideWith([textElement('a')]);
      const deck = deckWith([slide]);

      // Act
      const result = applyCommand(deck, { type: 'removeElement', slideId: slide.id, elementId: textElement('x').id });

      // Assert
      expect(result.forward).toHaveLength(0);
      expect(result.deck).toBe(deck);
    });
  });

  describe('addSlide', () => {
    it('should append the slide and produce reversible patches', () => {
      // Arrange
      const slide = slideWith([textElement('a')]);
      const deck = deckWith([slide]);
      const added = slideWith([textElement('b')]);

      // Act
      const result = applyCommand(deck, { type: 'addSlide', slide: added });

      // Assert
      expect(result.deck.slides.map((current) => current.id)).toEqual([slide.id, added.id]);
      expect(applyPatches(result.deck, [...result.inverse])).toEqual(deck);
    });
  });

  describe('removeSlide', () => {
    it('should remove the slide and produce reversible patches', () => {
      // Arrange
      const kept = slideWith([textElement('a')]);
      const removed = slideWith([textElement('b')]);
      const deck = deckWith([kept, removed]);

      // Act
      const result = applyCommand(deck, { type: 'removeSlide', slideId: removed.id });

      // Assert
      expect(result.deck.slides.map((current) => current.id)).toEqual([kept.id]);
      expect(applyPatches(result.deck, [...result.inverse])).toEqual(deck);
    });
  });
});
