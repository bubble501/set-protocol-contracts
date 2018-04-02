const assert = require('chai').assert;

contract('{Set}', function(accounts) {
  describe('{Set} creation', async () => {
    require('./creation').test(accounts);
  });

  describe('{Set} Issuance and Redemption', async () => {
    require('./issueAndRedeem').test(accounts);
  });

  // describe('{Set} Partial Redeems', async () => {
  //   require('./partialRedeem').test(accounts);
  // });
});
