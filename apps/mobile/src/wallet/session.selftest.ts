/* Run: npm run test:wallet  (no jest) */
import assert from 'node:assert/strict';
import { emptySession, sessionFromAuthorize, toModelFacingSnapshot, assertNoSecretsInSnapshot } from './session';

const e = emptySession();
assert.deepEqual(e, { authorized: false, cluster: 'devnet', pubkeys: [] });

const s = sessionFromAuthorize({ cluster: 'devnet', pubkeys: ['11111111111111111111111111111111'] });
const leaky = { ...s, auth_token: 'SECRET', authToken: 'SECRET', token: 'SECRET' } as never;
const snap = toModelFacingSnapshot(leaky);
assert.deepEqual(Object.keys(snap).sort(), ['authorized', 'cluster', 'pubkeys']);
assert.ok(!JSON.stringify(snap).includes('SECRET'));
for (const k of ['auth_token', 'authToken', 'token']) {
  assert.throws(() => assertNoSecretsInSnapshot({ ...s, [k]: 'x' }));
}
assert.deepEqual(sessionFromAuthorize({ cluster: 'testnet', pubkeys: [] }), emptySession('testnet'));
console.log('wallet session selftest: PASS');
