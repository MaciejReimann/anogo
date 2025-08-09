import { describe, it, expect } from 'vitest';
import { validateEmail, validatePhone, formatUserName, formatMessageDate } from './utils';

describe('validateEmail', () => {
  it('should return valid for correct email format', () => {
    const result = validateEmail('test@example.com');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return invalid for empty email', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Email is required');
  });

  it('should return invalid for incorrect email format', () => {
    const result = validateEmail('invalid-email');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid email format');
  });

  it('should return invalid for email without domain', () => {
    const result = validateEmail('test@');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid email format');
  });
});

describe('validatePhone', () => {
  it('should return valid for correct phone format', () => {
    const result = validatePhone('+1234567890');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return valid for phone with spaces and dashes', () => {
    const result = validatePhone('+1 (234) 567-890');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return invalid for empty phone', () => {
    const result = validatePhone('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Phone number is required');
  });

  it('should return invalid for too short phone', () => {
    const result = validatePhone('123');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid phone number format');
  });
});

describe('formatUserName', () => {
  it('should format name with proper capitalization', () => {
    const result = formatUserName('john doe');
    expect(result).toBe('John Doe');
  });

  it('should handle single name', () => {
    const result = formatUserName('john');
    expect(result).toBe('John');
  });

  it('should handle empty string', () => {
    const result = formatUserName('');
    expect(result).toBe('');
  });

  it('should trim whitespace', () => {
    const result = formatUserName('  john doe  ');
    expect(result).toBe('John Doe');
  });

  it('should handle mixed case input', () => {
    const result = formatUserName('jOHN dOE');
    expect(result).toBe('John Doe');
  });
});

describe('formatMessageDate', () => {
  it('should return "Just now" for recent messages', () => {
    const now = new Date();
    const result = formatMessageDate(now);
    expect(result).toBe('Just now');
  });

  it('should return hours ago for messages within 24 hours', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const result = formatMessageDate(twoHoursAgo);
    expect(result).toBe('2h ago');
  });

  it('should return date for messages older than 24 hours', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const result = formatMessageDate(twoDaysAgo);
    expect(result).toBe(twoDaysAgo.toLocaleDateString());
  });
});
