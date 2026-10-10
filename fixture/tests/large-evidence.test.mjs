import test from 'node:test';
import assert from 'node:assert/strict';
import { boundary_0, boundary_21999 } from '../src/large-evidence.js';
test('large controlled diff boundaries', () => { assert.equal(boundary_0, 0); assert.equal(boundary_21999, 21999); });
