/**
 * Configurable blocklist of known disposable / temporary email domains
 */
const disposableDomains = new Set([
  'mailinator.com',
  '10minutemail.com',
  'tempmail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'yopmail.com',
  'getairmail.com',
  'dispostable.com',
  'trashmail.com',
  'fakeinbox.com',
  'sharklasers.com',
  'temp-mail.org',
  'maildrop.cc',
  'getnada.com',
  'mohmal.com',
  'inboxkitten.com',
  'crazymailing.com',
  'fakemailgenerator.com',
  'mytemp.email',
  'burnermail.io',
  'tempinbox.com',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'bccto.me',
  'chacuo.net',
  '0815.ru',
  'dropmail.me',
  'harakirimail.com'
]);

/**
 * Check whether an email domain is in the disposable blocklist
 */
const isDisposableEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return disposableDomains.has(domain);
};

module.exports = {
  disposableDomains,
  isDisposableEmail,
};
