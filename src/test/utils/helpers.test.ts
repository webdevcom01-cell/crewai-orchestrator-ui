import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateIdFromName, generateTempId, isTempId, sanitizeId, escapeYaml, escapeHtml } from '../../../utils/helpers';

describe('helpers', () => {
  describe('generateIdFromName', () => {
    it('should convert name to snake_case id', () => {
      expect(generateIdFromName('Test Agent')).toBe('test_agent');
      expect(generateIdFromName('My Research Agent')).toBe('my_research_agent');
    });

    it('should handle special characters', () => {
      expect(generateIdFromName('Test-Agent!')).toBe('test_agent');
      expect(generateIdFromName('Test@Agent#123')).toBe('test_agent_123');
    });

    it('should handle multiple spaces', () => {
      expect(generateIdFromName('Test   Agent')).toBe('test_agent');
    });

    it('should handle empty string', () => {
      expect(generateIdFromName('')).toBe('entity');
    });

    it('should handle only special characters', () => {
      expect(generateIdFromName('!@#$%')).toBe('entity');
    });
  });

  describe('generateTempId', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should generate temp id with prefix', () => {
      const id = generateTempId();
      expect(id).toMatch(/^new_item_/);
    });

    it('should generate unique ids', () => {
      const id1 = generateTempId();
      vi.advanceTimersByTime(1); // Advance time by 1ms
      const id2 = generateTempId();
      expect(id1).not.toBe(id2);
    });

    it('should generate valid format', () => {
      const id = generateTempId();
      expect(id).toMatch(/^new_item_[0-9]+$/);
    });
  });

  describe('isTempId', () => {
    it('should return true for temp ids', () => {
      expect(isTempId('new_item_123')).toBe(true);
      expect(isTempId('new_item_456789')).toBe(true);
    });

    it('should return false for permanent ids', () => {
      expect(isTempId('agent_123')).toBe(false);
      expect(isTempId('research_agent')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isTempId('')).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(isTempId('NEW_ITEM_123')).toBe(false);
      expect(isTempId('New_Item_123')).toBe(false);
    });

    it('should work with custom prefix', () => {
      expect(isTempId('custom_prefix_123', 'custom_prefix')).toBe(true);
      expect(isTempId('new_item_123', 'custom_prefix')).toBe(false);
    });
  });

  describe('sanitizeId', () => {
    it('should convert to lowercase', () => {
      expect(sanitizeId('TestAgent')).toBe('testagent');
      expect(sanitizeId('UPPERCASE')).toBe('uppercase');
    });

    it('should replace invalid characters with underscores', () => {
      expect(sanitizeId('test-agent')).toBe('test_agent');
      expect(sanitizeId('test.agent')).toBe('test_agent');
      expect(sanitizeId('test@agent!')).toBe('test_agent_');
    });

    it('should keep valid characters', () => {
      expect(sanitizeId('test_agent_123')).toBe('test_agent_123');
      expect(sanitizeId('valid_id')).toBe('valid_id');
    });

    it('should handle empty string', () => {
      expect(sanitizeId('')).toBe('');
    });

    it('should handle special characters', () => {
      expect(sanitizeId('test!@#$%^&*agent')).toBe('test________agent');
    });
  });

  describe('escapeYaml', () => {
    it('should escape HTML entities', () => {
      expect(escapeYaml('<script>')).toBe('&lt;script&gt;');
      expect(escapeYaml('a & b')).toBe('a &amp; b');
    });

    it('should escape quotes', () => {
      expect(escapeYaml('"test"')).toBe('&quot;test&quot;');
      expect(escapeYaml("'test'")).toBe('&#x27;test&#x27;');
    });

    it('should escape backslashes', () => {
      expect(escapeYaml('path\\to\\file')).toBe('path\\\\to\\\\file');
    });

    it('should escape newlines', () => {
      expect(escapeYaml('line1\nline2')).toBe('line1\\nline2');
    });

    it('should handle null and undefined', () => {
      expect(escapeYaml(null)).toBe('');
      expect(escapeYaml(undefined)).toBe('');
    });

    it('should handle empty string', () => {
      expect(escapeYaml('')).toBe('');
    });

    it('should handle complex XSS attempts', () => {
      expect(escapeYaml('<img src="x" onerror="alert(1)">')).toBe('&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('should escape quotes', () => {
      expect(escapeHtml('"test"')).toBe('&quot;test&quot;');
      expect(escapeHtml("'test'")).toBe('&#x27;test&#x27;');
    });

    it('should handle null and undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should escape script tags', () => {
      expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });
  });

  describe('generateIdFromName with suffix', () => {
    it('should append suffix when provided', () => {
      expect(generateIdFromName('Test', '123')).toBe('test_123');
      expect(generateIdFromName('My Agent', 'v2')).toBe('my_agent_v2');
    });

    it('should not append underscore when no suffix', () => {
      expect(generateIdFromName('Test', '')).toBe('test');
      expect(generateIdFromName('Test')).toBe('test');
    });
  });
});
